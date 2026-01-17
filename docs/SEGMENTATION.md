# SmartPick Segmentation System

This document describes the technical architecture, flow, and design decisions behind the SmartPick image segmentation system.

## Overview

The segmentation system automatically detects and extracts individual objects (cashew kernels) from batch images, preparing them for human labeling. This is a critical preprocessing step that transforms raw factory images into labeled training data.

## Tech Stack

### Core Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Worker Process** | Python 3.11+ | Main segmentation engine |
| **Image Processing** | OpenCV 4.x | Classical computer vision algorithms |
| **Deep Learning** | PyTorch + SAM2 | State-of-the-art segmentation (optional) |
| **Database** | PostgreSQL 15+ | Job queue, segment storage |
| **Object Storage** | MinIO (S3-compatible) | Image and crop storage |
| **API Framework** | FastAPI | Health checks, manual processing |

### Why This Tech Stack?

#### Python for Image Processing

**Rationale:**
- **Ecosystem**: Python has the most mature image processing ecosystem (OpenCV, PIL, scikit-image)
- **ML Integration**: Seamless integration with PyTorch/TensorFlow for deep learning models
- **Rapid Iteration**: Easy to experiment with different algorithms
- **NumPy Performance**: NumPy arrays provide near-C performance for numerical operations

**Trade-offs:**
- Slower than Go/Rust for pure computation
- GIL limits true parallelism (mitigated by multiprocessing)
- Memory overhead for large images

#### OpenCV as Primary Segmenter

**Rationale:**
- **Speed**: 10-100x faster than deep learning approaches
- **No GPU Required**: Runs on any server, reduces infrastructure costs
- **Deterministic**: Same input always produces same output
- **Well-Understood**: Decades of research, predictable behavior
- **Low Latency**: Sub-second processing per image

**When OpenCV Works Best:**
- Uniform backgrounds (factory conveyor belts)
- Clear object boundaries
- Consistent lighting conditions
- Objects don't overlap significantly

**Limitations:**
- Struggles with complex backgrounds
- Can't handle semantic understanding
- Requires tuning for different scenarios

#### SAM2 as Optional Deep Learning Model

**Rationale:**
- **State-of-the-Art**: Meta's Segment Anything Model 2 achieves best-in-class accuracy
- **Zero-Shot**: Works without task-specific training
- **Handles Complexity**: Can segment objects in challenging scenes

**When to Use SAM2:**
- Complex or varying backgrounds
- Objects with unclear boundaries
- When accuracy is more important than speed
- GPU resources are available

**Trade-offs:**
- Requires GPU (CUDA)
- 10-100x slower than OpenCV
- Higher infrastructure costs
- Model weights are large (~2GB)

#### PostgreSQL for Job Queue

**Rationale:**
- **Already in Stack**: SmartPick backend uses PostgreSQL
- **ACID Compliance**: Reliable job state management
- **No Additional Infrastructure**: No need for Redis/RabbitMQ
- **Rich Queries**: Complex status queries, analytics

**Alternative Considered:**
- Redis: Faster but adds infrastructure complexity
- RabbitMQ: Overkill for our scale
- Celery: Additional abstraction layer not needed

#### MinIO for Object Storage

**Rationale:**
- **S3-Compatible**: Easy migration to AWS S3 later
- **Self-Hosted**: Full control, no cloud vendor lock-in
- **Cost-Effective**: No per-request charges
- **Kubernetes-Ready**: Easy to scale

## Segmentation Flow

### High-Level Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Segmentation Pipeline                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. JOB CREATION (Backend)                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ POST /v1/segmentation/start                                              ││
│  │ → Creates SegmentationJob record (status: pending)                       ││
│  │ → Links to batch_items that need processing                              ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                    │                                         │
│                                    ▼                                         │
│  2. JOB POLLING (Worker)                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ Every 5 seconds:                                                         ││
│  │ → Query: SELECT * FROM segmentation_jobs WHERE status = 'pending'        ││
│  │ → Claim job: UPDATE status = 'processing'                                ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                    │                                         │
│                                    ▼                                         │
│  3. IMAGE DOWNLOAD (Worker)                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ For each batch_item:                                                     ││
│  │ → Get storage_path from file_uploads                                     ││
│  │ → Download from MinIO to temp directory                                  ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                    │                                         │
│                                    ▼                                         │
│  4. SEGMENTATION (Worker)                                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ OpenCV Pipeline:                                                         ││
│  │ a) Preprocessing: Resize, denoise, normalize                             ││
│  │ b) Thresholding: Otsu's, adaptive, color-based                          ││
│  │ c) Morphology: Opening/closing to clean up                               ││
│  │ d) Contour Detection: Find object boundaries                             ││
│  │ e) Filtering: Remove too small/large, low confidence                     ││
│  │ f) Confidence Scoring: Based on shape regularity, aspect ratio           ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                    │                                         │
│                                    ▼                                         │
│  5. CROP GENERATION (Worker)                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ For each detected segment:                                               ││
│  │ → Extract bounding box region                                            ││
│  │ → Apply padding (10%)                                                    ││
│  │ → Save crop to MinIO: segments/{batch_item_id}/{segment_id}.jpg          ││
│  │ → Optionally save mask: segments/{batch_item_id}/{segment_id}_mask.png   ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                    │                                         │
│                                    ▼                                         │
│  6. DATABASE UPDATE (Worker)                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ For each segment:                                                        ││
│  │ → INSERT INTO image_segments (batch_item_id, bbox, confidence, ...)      ││
│  │ → If confidence > auto_approve_threshold: status = 'approved'            ││
│  │ → Else: status = 'pending'                                               ││
│  │                                                                          ││
│  │ Update batch_item: segmentation_status = 'completed'                     ││
│  │ Update job: progress++, status = 'completed' when done                   ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### OpenCV Segmentation Algorithm

```python
def segment_image(image):
    # 1. PREPROCESSING
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # 2. MULTI-METHOD THRESHOLDING
    # Try multiple methods, combine results
    methods = [
        ('otsu', cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)),
        ('adaptive', cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, ...)),
        ('color', color_based_threshold(image)),  # HSV-based for brown kernels
    ]
    
    # 3. MORPHOLOGICAL OPERATIONS
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    cleaned = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)  # Remove noise
    cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_CLOSE, kernel)  # Fill holes
    
    # 4. CONTOUR DETECTION
    contours, _ = cv2.findContours(cleaned, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # 5. FILTERING & SCORING
    segments = []
    for contour in contours:
        area = cv2.contourArea(contour)
        if min_area < area < max_area:
            bbox = cv2.boundingRect(contour)
            confidence = calculate_confidence(contour, area, bbox)
            if confidence >= min_confidence:
                segments.append(Segment(bbox, confidence, contour))
    
    return segments
```

### Confidence Scoring

Confidence is calculated based on:

1. **Contour Regularity (70% weight)**
   - Compares contour area to convex hull area
   - Regular shapes (cashews) have ratio close to 1.0
   - Formula: `regularity = contour_area / convex_hull_area`

2. **Aspect Ratio (30% weight)**
   - Cashews have characteristic elongated shape
   - Expected ratio: 1.5 - 3.0
   - Penalize very round or very elongated shapes

```python
def calculate_confidence(contour, area, bbox):
    # Regularity: how close to convex hull
    hull = cv2.convexHull(contour)
    hull_area = cv2.contourArea(hull)
    regularity = area / hull_area if hull_area > 0 else 0
    
    # Aspect ratio: width/height
    x, y, w, h = bbox
    aspect = max(w, h) / min(w, h) if min(w, h) > 0 else 0
    
    # Penalize extreme aspect ratios
    if 1.5 <= aspect <= 3.0:
        aspect_score = 1.0
    else:
        aspect_score = max(0, 1.0 - abs(aspect - 2.25) * 0.2)
    
    # Weighted combination
    confidence = 0.7 * regularity + 0.3 * aspect_score
    return confidence
```

## Configuration

### Segmentation Presets

| Preset | min_confidence | auto_approve | Use Case |
|--------|---------------|--------------|----------|
| **Standard** | 0.5 | 0.8 | Well-separated kernels |
| **High Sensitivity** | 0.3 | 0.7 | Detecting small pieces |
| **Dense Objects** | 0.6 | 0.85 | Touching/overlapping |

### Environment Variables

```bash
# Thresholds
MIN_CONFIDENCE=0.3          # Minimum confidence to keep segment
AUTO_APPROVE_THRESHOLD=0.7  # Auto-approve above this

# Processing
DEFAULT_MODEL=opencv        # opencv or sam2
POLL_INTERVAL_SECONDS=5     # Job polling frequency

# SAM2 (if using)
SAM2_CHECKPOINT=/path/to/sam2_weights.pth
DEVICE=cuda                 # cuda or cpu
```

## Performance Characteristics

### OpenCV Performance

| Metric | Value |
|--------|-------|
| Processing time per image | 50-200ms |
| Memory usage | ~100MB per image |
| CPU cores used | 1 (single-threaded) |
| GPU required | No |

### SAM2 Performance

| Metric | Value |
|--------|-------|
| Processing time per image | 2-5 seconds |
| Memory usage | ~4GB GPU VRAM |
| GPU required | Yes (CUDA) |
| Accuracy | Higher than OpenCV |

## Scaling Considerations

### Current Architecture (Single Worker)

- Processes ~500-1000 images/hour with OpenCV
- Suitable for batches up to 10,000 images
- No horizontal scaling

### Future Scaling Options

1. **Multiple Workers**: Run multiple worker instances, each claiming different jobs
2. **GPU Pool**: Dedicated SAM2 workers for high-accuracy processing
3. **Kubernetes**: Auto-scale based on job queue depth
4. **Batch Processing**: Process multiple images in parallel

## Troubleshooting

### No Segments Detected

1. **Check image quality**: Ensure images are clear, well-lit
2. **Adjust thresholds**: Lower `min_confidence` to 0.2-0.3
3. **Try different preset**: Use "High Sensitivity" preset
4. **Check logs**: Look for preprocessing issues

### Too Many False Positives

1. **Increase confidence**: Raise `min_confidence` to 0.6-0.7
2. **Adjust size filters**: Set appropriate min/max area
3. **Use morphology**: Enable erosion to separate touching objects

### Slow Processing

1. **Check image size**: Resize large images before processing
2. **Use OpenCV**: SAM2 is 10-100x slower
3. **Monitor resources**: Check CPU/memory usage

---

## Architecture Decision Records

### ADR-001: Why OpenCV + SAM2 Hybrid Approach

**Context**: We needed an automated segmentation system that could accurately detect cashew kernels in factory images for quality control labeling.

**Decision**: Implement a hybrid system with OpenCV as the primary segmenter and SAM2 as an optional high-accuracy alternative.

**Rationale**:

| Approach | Pros | Cons |
|----------|------|------|
| **OpenCV Only** | Fast (50-200ms), no GPU, low cost, deterministic | Less accurate on complex scenes |
| **SAM2 Only** | State-of-the-art accuracy, handles edge cases | Requires GPU, 10-100x slower, high cost |
| **Hybrid (Chosen)** | Best of both worlds, scalable cost model | More complex architecture |

**Why Not Other Models?**

| Model | Considered? | Reason |
|-------|-------------|--------|
| YOLO v8 | Yes | Requires training data, not zero-shot |
| Mask R-CNN | Yes | Slower than SAM2, similar GPU requirements |
| U-Net | Yes | Requires domain-specific training |
| Traditional ML (SVM/RF) | Yes | Needs feature engineering, less accurate |

**Outcome**: OpenCV handles 90%+ of standard factory images efficiently. SAM2 is available for difficult cases where accuracy matters more than speed.

### ADR-002: Job Queue Design

**Context**: Need async processing for segmentation jobs that may take seconds to minutes.

**Decision**: Use PostgreSQL as the job queue instead of dedicated message brokers.

**Rationale**:

| Option | Pros | Cons |
|--------|------|------|
| PostgreSQL (Chosen) | Already in stack, ACID, rich queries | Not optimized for high-throughput queuing |
| Redis Queue | Fast, lightweight | Additional infrastructure, eventual consistency |
| RabbitMQ/Kafka | Enterprise features, high throughput | Overkill for our scale, operational overhead |
| Celery | Python-native, feature-rich | Additional abstraction, Redis/RabbitMQ dependency |

**Why PostgreSQL Works For Us**:
- Job volume is low (~1000 jobs/day max)
- Need rich status queries and analytics
- Already have PostgreSQL expertise
- ACID guarantees prevent lost jobs

### ADR-003: Human-in-the-Loop Review

**Context**: Automated segmentation isn't perfect. Need quality assurance before labels become training data.

**Decision**: Implement a review workflow with automatic approval for high-confidence segments.

**Workflow**:
```
Segment Detected → Confidence Score → Threshold Check → Review Status
                         │                  │
                         │        High (≥0.8)└──→ Auto-Approved
                         │        Medium (0.5-0.8) → Pending Review
                         └─────── Low (<0.5) → Auto-Rejected
```

**Benefits**:
1. **Quality Control**: Humans verify edge cases
2. **Training Data**: High-quality labels for future ML models
3. **Efficiency**: Auto-approve reduces manual work by 60-80%
4. **Feedback Loop**: Rejected segments inform algorithm tuning

### ADR-004: Storage Architecture

**Context**: Need to store original images, segment crops, and masks efficiently.

**Decision**: Use MinIO (S3-compatible) with structured object keys.

**Object Key Structure**:
```
uploads/                          # Original uploaded files
  {batch_id}/
    {file_id}.jpg

segments/                         # Segmentation outputs
  {batch_item_id}/
    {segment_id}.jpg             # Cropped segment
    {segment_id}_mask.png        # Optional binary mask
```

**Why MinIO Over Alternatives**:

| Storage | Pros | Cons |
|---------|------|------|
| MinIO (Chosen) | S3-compatible, self-hosted, free | Requires setup |
| AWS S3 | Managed, scalable | Cost, vendor lock-in |
| Local Filesystem | Simple | Not scalable, no redundancy |
| PostgreSQL BLOB | Transactional | Slow for large files |

### ADR-005: Confidence Scoring Algorithm

**Context**: Need to quantify segmentation quality for auto-approval decisions.

**Decision**: Use contour-based heuristics rather than ML-based scoring.

**Algorithm Components**:
1. **Contour Regularity (70%)**: Ratio of contour area to convex hull
2. **Aspect Ratio (30%)**: Penalize shapes that don't match cashew proportions

**Why Heuristics Over ML**:
- No training data needed
- Deterministic and explainable
- Fast to compute
- Easy to tune and debug

**Tuning Guidelines**:
- `auto_approve_threshold = 0.8`: Conservative, high precision
- `auto_approve_threshold = 0.7`: Balanced precision/recall
- `auto_approve_threshold = 0.6`: Aggressive, higher recall

## Future Improvements

### Planned Enhancements

1. **Active Learning**: Use rejected segments to improve confidence scoring
2. **Multi-model Ensemble**: Combine OpenCV + SAM2 predictions
3. **GPU Cluster**: Scale SAM2 processing with Kubernetes
4. **Real-time Processing**: WebSocket-based progress updates
5. **Mobile Review App**: Allow QC on tablets in factory

### Research Areas

1. **Domain-Specific Models**: Fine-tune SAM2 on cashew images
2. **Anomaly Detection**: Automatically flag unusual segments
3. **Batch Quality Scoring**: Predict batch defect rates early

---

*Last updated: January 2026*
