# Projects Module

Projects are the top-level organizational unit for labeling work. Each project belongs to an organization and contains batches, which in turn contain tasks.

## Data Model

```
Organization
└── Project
    └── Batch
        └── Task
```

### Project Entity

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `name` | string | Project name (2-64 chars) |
| `description` | string | Optional description |
| `status` | `active` \| `completed` \| `archived` | Current state |
| `orgId` | string | Parent organization |
| `stats` | ProjectStats | Aggregated metrics |
| `createdAt` | ISO 8601 | Creation timestamp |
| `updatedAt` | ISO 8601 | Last modification |
| `createdBy` | string | User ID of creator |
| `createdByName` | string | Display name of creator |
| `updatedBy` | string | User ID of last editor |
| `updatedByName` | string | Display name of last editor |
| `events` | ProjectEvent[] | Activity timeline |

### ProjectStats

| Field | Type | Description |
|-------|------|-------------|
| `totalBatches` | number | Number of batches |
| `totalImages` | number | Total images across batches |
| `labeledImages` | number | Images with labels |
| `pendingTasks` | number | Tasks not yet started |
| `completedTasks` | number | Finished tasks |
| `totalTasks` | number | All tasks |
| `averageLabelingTime` | number | Avg seconds per image |
| `labelerCount` | number | Active labelers |

### ProjectEvent

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Event ID |
| `type` | ProjectEventType | Event category |
| `description` | string | Human-readable description |
| `userId` | string | Who triggered it |
| `userName` | string | Display name |
| `metadata` | object | Additional context |
| `createdAt` | ISO 8601 | When it happened |

Event types: `created`, `updated`, `status_changed`, `batch_added`, `batch_removed`, `task_completed`, `member_added`, `member_removed`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects` | List all projects |
| GET | `/projects/:id` | Get project details |
| POST | `/projects` | Create project |
| PUT | `/projects/:id` | Update project |
| DELETE | `/projects/:id` | Delete project |

### Create Project

```json
POST /projects
{
  "name": "Product Classification Q1",
  "description": "Labeling product images for ML training"
}
```

### Update Project

```json
PUT /projects/:id
{
  "name": "Updated Name",
  "description": "New description",
  "status": "completed"
}
```

## Module Structure

```
src/modules/projects/
├── api.ts          # API functions
├── hooks.ts        # React Query hooks
├── types.ts        # TypeScript types
├── index.ts        # Public exports
└── components/
    ├── index.ts
    ├── ProjectCard.tsx
    ├── ProjectDetails.tsx
    ├── CreateProjectModal.tsx
    └── EditProjectModal.tsx
```

## Usage

### Listing Projects

```tsx
import { useProjects } from '~/modules/projects'

function ProjectList() {
  const { data: projects, isLoading, error } = useProjects()

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message={error.message} />

  return (
    <div>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
```

### Project Detail Page

```tsx
import { useProject } from '~/modules/projects'
import { ProjectDetails } from '~/modules/projects/components/ProjectDetails'

function ProjectPage({ id }: { id: string }) {
  const { data: project } = useProject(id)

  if (!project) return null

  return <ProjectDetails project={project} />
}
```

### Creating a Project

```tsx
import { useCreateProject, CreateProjectModal } from '~/modules/projects'

function CreateButton() {
  const [open, setOpen] = useState(false)
  const createMutation = useCreateProject()

  const handleSubmit = async (data) => {
    await createMutation.mutateAsync(data)
    setOpen(false)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>New Project</Button>
      <CreateProjectModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
      />
    </>
  )
}
```

### Updating a Project

```tsx
import { useUpdateProject } from '~/modules/projects'

function UpdateStatus({ projectId }: { projectId: string }) {
  const updateMutation = useUpdateProject()

  const markComplete = () => {
    updateMutation.mutate({
      id: projectId,
      data: { status: 'completed' }
    })
  }

  return <Button onClick={markComplete}>Mark Complete</Button>
}
```

### Deleting a Project

```tsx
import { useDeleteProject } from '~/modules/projects'

function DeleteButton({ projectId }: { projectId: string }) {
  const deleteMutation = useDeleteProject()

  const handleDelete = async () => {
    if (confirm('Delete this project?')) {
      await deleteMutation.mutateAsync(projectId)
    }
  }

  return <Button variant="destructive" onClick={handleDelete}>Delete</Button>
}
```

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/projects` | `index.sync.tsx` | Project list |
| `/projects/:id` | `[id].sync.tsx` | Project detail |

## Components

### ProjectCard

Displays project summary in a card format. Shows:
- Name and description
- Status badge
- Stats (batches, images)
- Progress bar
- Dropdown actions (complete, archive, delete)

### ProjectDetails

Full project view with:
- Header with name, status, actions
- Stats grid (batches, images, tasks, labelers)
- Progress bars (labeling, task completion)
- Activity timeline
- Metadata panel (dates, creator, IDs)
- Quick action buttons

### CreateProjectModal

Form modal for new projects:
- Name field (required)
- Description field (optional)
- Validation and loading states

### EditProjectModal

Form modal for editing existing projects:
- Pre-filled with current values
- Tracks changes to enable/disable save
- Same validation as create

## Query Keys

```ts
projectKeys = {
  all: ['projects'],
  lists: () => ['projects', 'list'],
  list: (filters) => ['projects', 'list', { filters }],
  details: () => ['projects', 'detail'],
  detail: (id) => ['projects', 'detail', id],
}
```

Mutations automatically invalidate relevant queries.
