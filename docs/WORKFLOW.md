# SmartPick Workflow Guide

This document describes the daily workflows for administrators and labelers in the SmartPick cashew classification system.

## System Overview

SmartPick is an AI-powered cashew kernel classification system that helps quality control teams efficiently label and categorize cashew kernels by grade (W180, W210, W240, W320, W450, Split, Butts, Pieces, Reject).

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SmartPick System                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌────────────┐│
│  │   Frontend   │    │   Backend    │    │  Segmentation│    │  Database  ││
│  │   (React)    │◄──►│   (Go/Echo)  │◄──►│   Worker     │◄──►│ (PostgreSQL││
│  │              │    │              │    │   (Python)   │    │  + MinIO)  ││
│  └──────────────┘    └──────────────┘    └──────────────┘    └────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## User Roles

### Administrator (Admin)
- Creates and manages projects and batches
- Uploads images for processing
- Configures segmentation parameters
- Reviews and approves/rejects segments
- Assigns tasks to labelers
- Monitors overall progress and quality

### Labeler
- Views assigned labeling tasks
- Labels individual cashew segments with grades
- Submits completed work for review
- Tracks personal progress

---

## Administrator Daily Workflow

### Morning Setup (8:00 AM - 9:00 AM)

#### 1. Check Dashboard
Navigate to the dashboard (`/`) to review:
- **Labeled Today**: Number of segments labeled in the current day
- **Total Labeled**: Cumulative labeled segments
- **Average Time**: Time per label (efficiency metric)
- **Pending Batches**: Batches awaiting processing

#### 2. Review Overnight Processing
Check if any segmentation jobs completed overnight:
1. Go to **Batches** (`/batches`)
2. Look for batches with status "Segmented" or "Ready for Labeling"
3. Review segmentation quality for any newly processed batches

### Image Upload & Processing (9:00 AM - 10:00 AM)

#### 3. Create New Batch
1. Navigate to **Batches** → Click **Create Batch**
2. Fill in batch details:
   - **Name**: Descriptive name (e.g., "Production Line A - Jan 17")
   - **Description**: Any relevant notes
3. Upload images:
   - Drag & drop or click to select images
   - Supported formats: JPEG, PNG, WebP
   - Max 50 files per upload, 200MB per file
4. Click **Upload & Create Batch**

#### 4. Start Auto-Segmentation
1. Open the newly created batch
2. Click **Start Auto-Segmentation**
3. Configure segmentation preset:
   - **Standard**: Good for well-separated kernels
   - **High Sensitivity**: For detecting smaller pieces
   - **Dense Objects**: For touching/overlapping kernels
4. Monitor progress in the Segmentation Panel

#### 5. Review Segments
Once segmentation completes:
1. Review detected segments in the gallery view
2. For each segment, you can:
   - **Approve** (✓): Segment is correctly detected
   - **Reject** (✗): Segment is incorrect (noise, partial, etc.)
   - **Adjust**: Modify bounding box if needed
3. Use bulk actions for efficiency:
   - Select multiple segments
   - Apply bulk approve/reject

### Task Management (10:00 AM - 11:00 AM)

#### 6. Create Labeling Tasks (Critical for Large Batches)

> **Important**: For batches with many segments (500+), always split into tasks!
> 
> Without splitting:
> - Labeler sees ALL segments → overwhelming
> - No parallel work → slow completion
> - Hard to track progress → no accountability
>
> With task splitting:
> - Each labeler sees only their portion → manageable
> - Multiple labelers work simultaneously → fast completion
> - Clear progress per task → easy monitoring

**Steps to Split a Batch:**

1. Go to batch details page
2. Click **Split Batch** (or the menu → "Split into Tasks")
3. Configure task distribution:
   
   **Split Mode Options:**
   - **By Segments**: Split approved segments among tasks
     - Use when segmentation is complete
     - Best for labeling workflows
     - Total = all approved segments in the batch
   
   - **By Images**: Split images among tasks
     - Use when you want to distribute raw images
     - Each task gets a subset of images
     - Total = all images in the batch

4. Configure task count:
   - **Number of Tasks**: How many parallel tasks
   - System auto-calculates segments/images per task
   - Example: 1000 segments ÷ 4 tasks = 250 per task

5. Review the task breakdown:
   - Preview shows each task's segment count
   - Adjust task count to balance workload

6. Click **Create Tasks**

**Task Assignment Guidelines:**
| Batch Size | Recommended Tasks | Segments per Task |
|------------|------------------|-------------------|
| < 500 segments | 1-2 tasks | 250-500 |
| 500-2000 segments | 2-5 tasks | 200-400 |
| 2000-5000 segments | 5-10 tasks | 300-500 |
| > 5000 segments | 10+ tasks | 300-500 |

#### 7. Assign Tasks to Labelers
1. Go to **Tasks** page (`/tasks`)
2. For each created task:
   - Click **Assign** button
   - Select labeler from dropdown
   - Set priority (High/Medium/Low)
   - Set deadline if needed
3. Notify labelers of their assignments

#### 8. Monitor Progress
Throughout the day:
1. Check **Tasks** page (`/tasks`) for status updates
2. Each task shows:
   - Assigned labeler
   - Progress (e.g., "125/250 labeled")
   - Status (Not Started / In Progress / Completed)
   - Time spent
3. Review completed tasks for quality
4. Reassign tasks if labelers are unavailable

### Quality Control (Ongoing)

#### 8. Spot Check Labels
Periodically review labeled segments:
1. Go to a batch with labeled segments
2. Filter by "Labeled" status
3. Verify label accuracy
4. Flag any issues for re-labeling

### End of Day (5:00 PM - 6:00 PM)

#### 9. Generate Reports
1. Review daily statistics on dashboard
2. Export labeled data if needed
3. Plan next day's batches

---

## Labeler Daily Workflow

### Morning Check-in (8:00 AM - 8:30 AM)

#### 1. View Dashboard
Navigate to dashboard (`/`) to see:
- Personal labeling statistics
- Pending tasks
- Recent activity

#### 2. Check Assigned Tasks
1. Go to **Tasks** (`/tasks`)
2. Review assigned tasks sorted by priority
3. Note any urgent deadlines

### Task-Based Labeling (Recommended Approach)

> **Why Task-Based Labeling?**
>
> Large batches can contain thousands or tens of thousands of segments. Instead of overwhelming a single labeler with all segments, administrators should:
> 1. Split batches into smaller **Tasks** (e.g., 100-500 segments per task)
> 2. Assign tasks to different labelers
> 3. Each labeler works only on their assigned segments
>
> This approach provides:
> - **Manageable workload**: Each labeler sees only their assigned segments
> - **Parallel processing**: Multiple labelers work simultaneously
> - **Progress tracking**: Admin can monitor each task's completion
> - **Accountability**: Clear ownership of each task

#### 3. Access Your Assigned Task
1. Go to **Tasks** (`/tasks`)
2. Find your assigned task (shows batch name, segment count, deadline)
3. Click **Start Labeling** to open the task-specific labeling interface
4. You will only see segments assigned to your task (not the entire batch)

### Labeling Session (8:30 AM - 12:00 PM, 1:00 PM - 5:00 PM)

#### 4. Start Labeling
1. Select a task from the task list
2. Click **Start Labeling** to open the labeling interface
3. The labeling page shows:
   - Current segment image (center)
   - Label options (right panel)
   - Thumbnail navigation (bottom)
   - Progress indicator (shows YOUR task progress, not entire batch)

#### 5. Label Segments
For each segment:
1. **Examine** the cashew kernel image
2. **Identify** the grade based on:
   - Size (W180 = largest, W450 = smallest whole)
   - Condition (whole, split, butts, pieces)
   - Quality (reject if damaged/defective)
3. **Click** the appropriate label or use keyboard shortcuts:
   - `1-9`: Quick label selection
   - `→` or `Space`: Next image
   - `←`: Previous image
   - `Enter`: Confirm and move to next

#### 5. Label Categories

| Grade | Description | Visual Cues |
|-------|-------------|-------------|
| **W180** | Whole kernel, 180 count/lb | Largest, premium quality |
| **W210** | Whole kernel, 210 count/lb | Large, high quality |
| **W240** | Whole kernel, 240 count/lb | Medium-large |
| **W320** | Whole kernel, 320 count/lb | Medium size |
| **W450** | Whole kernel, 450 count/lb | Small whole kernels |
| **Split** | Broken in half lengthwise | Two halves visible |
| **Butts** | Cross-broken pieces | Irregular break pattern |
| **Pieces** | Small fragments | Multiple small pieces |
| **Reject** | Damaged/defective | Discoloration, damage, foreign matter |

#### 6. Save Progress
- Progress is auto-saved periodically
- Click **Save** button to manually save
- Take breaks without losing work

### Breaks & Efficiency

#### Tips for Efficient Labeling
1. **Use keyboard shortcuts** - Much faster than clicking
2. **Batch similar items** - Get into a rhythm
3. **Take regular breaks** - Prevents fatigue and errors
4. **Ask when unsure** - Flag difficult cases for admin review

### End of Day

#### 7. Complete Tasks
1. Finish current labeling session
2. Save all progress
3. Mark task as complete if finished
4. Review personal statistics

---

## Workflow Diagrams

### Complete Pipeline

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Upload    │────►│   Segment   │────►│   Review    │────►│   Label     │
│   Images    │     │   (Auto)    │     │  Segments   │     │  Segments   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │                   │
      ▼                   ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Batch     │     │ Segmentation│     │  Approved   │     │   Labeled   │
│  Created    │     │   Complete  │     │  Segments   │     │    Data     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### Batch Status Flow

```
created → processing → segmented → labeling → completed
    │          │           │           │
    └──────────┴───────────┴───────────┴──► (can fail at any stage)
```

### Task Assignment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Large Batch (10,000 images)                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │   Split into      │
                    │   Tasks           │
                    └─────────┬─────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│   Task 1      │     │   Task 2      │     │   Task N      │
│  2,500 images │     │  2,500 images │     │  2,500 images │
│  → Labeler A  │     │  → Labeler B  │     │  → Labeler D  │
└───────────────┘     └───────────────┘     └───────────────┘
```

---

## Best Practices

### For Administrators
1. **Batch naming**: Use consistent, descriptive names
2. **Quality checks**: Review 5-10% of labeled data daily
3. **Workload balance**: Distribute tasks evenly among labelers
4. **Communication**: Notify labelers of urgent tasks

### For Labelers
1. **Consistency**: Apply same criteria throughout session
2. **When in doubt**: Choose the more conservative grade
3. **Report issues**: Flag unclear images or system problems
4. **Stay focused**: Quality over speed

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Segmentation produces no results | Check image quality, adjust sensitivity preset |
| Images not uploading | Verify file format and size limits |
| Labels not saving | Check network connection, try manual save |
| Task not appearing | Refresh page, check assignment status |

### Getting Help
- Contact your administrator for workflow questions
- Report technical issues to IT support
- Check system status on the dashboard

---

## Keyboard Shortcuts Reference

### Labeling Page
| Key | Action |
|-----|--------|
| `1-9` | Select label 1-9 |
| `→` or `Space` | Next image |
| `←` | Previous image |
| `Enter` | Confirm label |
| `Esc` | Exit labeling mode |

### General Navigation
| Key | Action |
|-----|--------|
| `Ctrl/Cmd + K` | Quick search |
| `Ctrl/Cmd + S` | Save |
| `Ctrl/Cmd + Z` | Undo |

---

---

## Task-Based Labeling Implementation (Developer Notes)

### Current Architecture

The labeling flow currently works as:
```
/label                 → Shows all batches (hub page)
/label/:batchId       → Labels ALL approved segments in a batch
```

### Proposed Task-Based Architecture

```
/label                 → Shows batches + assigned tasks (hub page)
/label/:batchId       → Labels ALL segments (for admins)
/label/task/:taskId   → Labels ONLY segments assigned to this task
```

### Implementation Checklist

1. **Backend Changes:**
   - [ ] Add endpoint: `GET /v1/tasks/:id/segments` - returns only segments for this task
   - [ ] Task table stores `segment_ids` (already exists)
   - [ ] Segment query filter by task's segment IDs

2. **Frontend Changes:**
   - [ ] Create `TaskLabelingPage.tsx` (similar to `BatchLabelingPage.tsx`)
   - [ ] Add route: `src/pages/(main)/label/task/[taskId].tsx`
   - [ ] Add hook: `useTaskLabelingImages(taskId)` 
   - [ ] Update tasks list to link to `/label/task/:taskId`
   - [ ] Update labeling hub to show assigned tasks

3. **Data Flow for Task-Based Labeling:**
   ```
   TaskLabelingPage
     ├── useTaskLabelingImages(taskId)
     │     └── API: GET /v1/tasks/:id/segments
     │           └── Returns: { images: [...], existingAssignments: [...] }
     └── LabelingPage (same component, different data source)
   ```

### API Design

**Get Task Segments for Labeling:**
```
GET /v1/tasks/:id/segments?status=approved

Response:
{
  "images": [
    {
      "id": "segment-uuid",
      "url": "https://...",
      "thumbnailUrl": "https://...",
      "originalImageName": "image1.jpg",
      "confidence": 0.95,
      "label": { "id": "...", "name": "W240" }  // if already labeled
    }
  ],
  "task": {
    "id": "task-uuid",
    "name": "Task 1",
    "progress": { "total": 100, "labeled": 45 }
  }
}
```

---

*Last updated: January 2026*
