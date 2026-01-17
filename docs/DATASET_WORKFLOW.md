# Dataset Workflow Documentation

This document describes the complete workflow for creating datasets from labeled batches and exporting them for model training.

## Overview

The dataset workflow follows these steps:

1. **Upload Images** → Create batches with images
2. **Segment Images** → Run auto-segmentation to detect objects
3. **Review Segments** → Approve/reject detected segments
4. **Label Segments** → Assign labels to approved segments
5. **Create Dataset** → Combine labeled batches into a dataset
6. **Export Dataset** → Export in various formats for model training

## Detailed Workflow

### Step 1: Create and Upload Batches

1. Navigate to **Batches** page (`/batches`)
2. Click **New Batch** button
3. Enter batch name and description
4. Upload images (drag & drop or file picker)
5. Wait for upload to complete
6. Click **Create Batch**

### Step 2: Run Auto-Segmentation

1. Open a batch by clicking on it
2. Scroll to the **Auto Segmentation** section
3. Select a segmentation preset (or use default)
4. Click **Run Segmentation** (or **Rerun** if already run)
5. Wait for segmentation to complete
6. Review the detected segments

### Step 3: Review Segments

Segments can be in these states:
- **Pending Review** - Needs human review
- **Approved** - Accepted for labeling
- **Rejected** - Discarded
- **Manual** - Manually created segment

Actions:
- Click ✓ to approve a segment
- Click ✗ to reject a segment
- Use **Approve All** to bulk approve pending segments
- Use filters to view segments by status

### Step 4: Label Segments

1. Click **Start Labeling** button on batch details page
2. The labeling interface shows:
   - Current segment image (center)
   - Label panel (right side)
   - Navigation controls (bottom)
   - Progress indicator (top)

3. **Labeling Controls:**
   - Click a label to assign it to the current segment
   - Labels auto-save to the backend
   - Use keyboard shortcuts (1-9) for quick labeling
   - Use ← → arrows to navigate between segments
   - Progress bar shows labeling completion

4. **Auto-Advance Feature:**
   - When you select a label, it automatically advances to the next segment
   - This enables rapid labeling workflow

### Step 5: Create Dataset from Batches

Once batches are fully labeled, you can create a dataset:

1. Navigate to **Batches** page (`/batches`)
2. Select batches by clicking the checkbox on each batch card
   - Or use **Select All** to select all visible batches
3. A selection bar appears showing selected count
4. Click **Create Dataset** button
5. In the modal:
   - Enter dataset name
   - Add optional description
   - Review selected batches summary
6. Click **Create Dataset**

### Step 6: Export Dataset

Export your dataset in various formats for model training:

1. Navigate to **Datasets** page (`/datasets`)
2. Open the dataset you want to export
3. Click **Export** button
4. Choose export format:
   - **YOLO** - YOLOv5/v8 format with images and labels
   - **COCO** - COCO JSON format for object detection
   - **Pascal VOC** - XML annotations
   - **CSV** - Simple CSV with image paths and labels
   - **JSON** - Raw JSON export

5. Configure options:
   - **Include Images** - Download images with annotations
   - **Train/Val/Test Split** - Set ratios (e.g., 70/20/10)

6. Click **Export Dataset**
7. Download the exported file when ready

## Export Formats

### YOLO Format
```
dataset/
├── images/
│   ├── train/
│   ├── val/
│   └── test/
├── labels/
│   ├── train/
│   ├── val/
│   └── test/
└── data.yaml
```

### COCO Format
```json
{
  "images": [...],
  "annotations": [...],
  "categories": [...]
}
```

### Pascal VOC Format
```xml
<annotation>
  <filename>image.jpg</filename>
  <object>
    <name>label_name</name>
    <bndbox>...</bndbox>
  </object>
</annotation>
```

## API Endpoints

### Labeling
- `PUT /labeling/segments/{segmentId}` - Save single segment label
- `POST /labeling/segments` - Bulk save segment labels
- `DELETE /labeling/segments/{segmentId}` - Remove segment label
- `GET /labeling/batches/{batchId}/segments` - Get labeled segments

### Datasets
- `GET /datasets` - List all datasets
- `POST /datasets` - Create new dataset
- `GET /datasets/{id}` - Get dataset details
- `PUT /datasets/{id}` - Update dataset
- `DELETE /datasets/{id}` - Delete dataset
- `POST /datasets/{id}/batches` - Add batches to dataset
- `POST /datasets/{id}/export` - Export dataset

## Best Practices

1. **Batch Organization**
   - Group related images into batches
   - Use descriptive batch names
   - Add descriptions for context

2. **Segmentation Quality**
   - Review all segments before labeling
   - Reject poor quality segments
   - Create manual segments for missed objects

3. **Labeling Consistency**
   - Use consistent label definitions
   - Train labelers on guidelines
   - Review labeled data periodically

4. **Dataset Splits**
   - Use 70/20/10 split for train/val/test
   - Ensure balanced class distribution
   - Keep test set untouched during training

## Troubleshooting

### Labels not saving
- Check network connection
- Verify API endpoint is accessible
- Check browser console for errors

### Export fails
- Ensure all segments are labeled
- Check dataset has sufficient data
- Verify export format is supported

### Segmentation issues
- Try different segmentation presets
- Adjust confidence thresholds
- Use manual segmentation for edge cases
