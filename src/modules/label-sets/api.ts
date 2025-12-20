export interface Label {
  id: string
  name: string
  description?: string
  color?: string // hex color for visualization
}

export interface LabelSet {
  id: string
  name: string
  description: string
  labels: Label[]
  createdAt: string
  createdBy: string
  updatedAt: string
}

export interface GetLabelSetsResponse {
  labelSets: LabelSet[]
  total?: number
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public statusText?: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Mock data for development
const mockLabelSets: LabelSet[] = [
  {
    id: '1',
    name: 'Object Detection Labels',
    description: 'Labels for detecting objects in images',
    labels: [
      {
        id: '1',
        name: 'Person',
        description: 'Human person',
        color: '#3B82F6',
      },
      { id: '2', name: 'Car', description: 'Vehicle', color: '#EF4444' },
      { id: '3', name: 'Bicycle', color: '#10B981' },
      { id: '4', name: 'Dog', color: '#F59E0B' },
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'user@example.com',
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    name: 'Classification Labels',
    description: 'Simple classification categories',
    labels: [
      { id: '5', name: 'Good', color: '#10B981' },
      { id: '6', name: 'Bad', color: '#EF4444' },
      { id: '7', name: 'Neutral', color: '#6B7280' },
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'user@example.com',
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    name: 'Sentiment Analysis',
    description: 'Labels for sentiment classification',
    labels: [
      { id: '8', name: 'Positive', color: '#10B981' },
      { id: '9', name: 'Negative', color: '#EF4444' },
      { id: '10', name: 'Neutral', color: '#6B7280' },
    ],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'user@example.com',
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
]

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function getLabelSets(): Promise<LabelSet[]> {
  // Mock: simulate API call
  await delay(300)

  return [...mockLabelSets]
}

export interface CreateLabelSetRequest {
  name: string
  description: string
  labels: Omit<Label, 'id'>[]
}

export async function createLabelSet(
  request: CreateLabelSetRequest,
): Promise<LabelSet> {
  // Mock: simulate API call
  await delay(500)

  const newLabelSet: LabelSet = {
    id: String(mockLabelSets.length + 1),
    name: request.name,
    description: request.description,
    labels: request.labels.map((label, idx) => ({
      ...label,
      id: String(mockLabelSets.length * 10 + idx + 1),
    })),
    createdAt: new Date().toISOString(),
    createdBy: 'user@example.com',
    updatedAt: new Date().toISOString(),
  }

  mockLabelSets.push(newLabelSet)
  return newLabelSet
}
