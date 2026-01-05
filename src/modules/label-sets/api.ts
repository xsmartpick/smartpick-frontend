// In development, use relative path to leverage Vite proxy
// In production, use VITE_API_URL env var or default to localhost:8080
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '' : 'http://localhost:8080')

export interface Label {
  id: string
  name: string
  description?: string
  color?: string // hex color for visualization
}

export interface LabelSet {
  id: string
  batchId?: string | null
  name: string
  description?: string | null
  labels: Label[]
  labelIds?: string[]
  createdAt: string
  createdBy: string
  updatedAt: string
}

interface BackendLabelSet {
  id: string
  batchId?: string | null
  name: string
  description?: string | null
  labelIds?: string[] | null
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

function mapLabelSet(data: BackendLabelSet): LabelSet {
  return {
    id: data.id,
    batchId: data.batchId ?? null,
    name: data.name,
    description: data.description ?? '',
    labels: [],
    labelIds: data.labelIds ?? [],
    createdAt: data.createdAt,
    createdBy: data.createdBy,
    updatedAt: data.updatedAt,
  }
}

export async function getLabelSets(): Promise<LabelSet[]> {
  const response = await fetch(`${API_BASE_URL}/v1/labelsets`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new ApiError(
      `Failed to fetch label sets: ${response.status} ${errorText}`,
      response.status,
      response.statusText,
    )
  }

  const data = await response.json()
  const raw = Array.isArray(data) ? data : data?.labelSets
  if (!Array.isArray(raw)) {
    return []
  }

  return raw.map((item) => mapLabelSet(item))
}

export interface CreateLabelSetRequest {
  name: string
  description: string
  batchId?: string | null
  labelIds?: string[] | null
}

export async function createLabelSet(
  request: CreateLabelSetRequest,
): Promise<LabelSet> {
  const response = await fetch(`${API_BASE_URL}/v1/labelsets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new ApiError(
      `Failed to create label set: ${response.status} ${errorText}`,
      response.status,
      response.statusText,
    )
  }

  const data = (await response.json()) as BackendLabelSet
  return mapLabelSet(data)
}

export interface UpdateLabelSetRequest {
  name?: string
  description?: string
  batchId?: string | null
  labelIds?: string[] | null
}

export async function updateLabelSet(
  id: string,
  request: UpdateLabelSetRequest,
): Promise<LabelSet> {
  const response = await fetch(`${API_BASE_URL}/v1/labelsets/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new ApiError(
      `Failed to update label set: ${response.status} ${errorText}`,
      response.status,
      response.statusText,
    )
  }

  const data = (await response.json()) as BackendLabelSet
  return mapLabelSet(data)
}

export async function deleteLabelSet(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/v1/labelsets/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new ApiError(
      `Failed to delete label set: ${response.status} ${errorText}`,
      response.status,
      response.statusText,
    )
  }
}
