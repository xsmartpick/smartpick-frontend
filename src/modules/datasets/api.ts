// In development, use relative path to leverage Vite proxy
// In production, use VITE_API_URL env var or default to localhost:8080
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '' : 'http://localhost:8080')

export type MediaType = 'image' | 'video' | 'audio' | 'text'

export interface Dataset {
  id: string
  name: string
  description: string
  mediaType: MediaType
  createdAt: string
  createdBy: string
  updatedAt: string
}

export interface GetDatasetsResponse {
  datasets: Dataset[]
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

export async function getDatasets(): Promise<Dataset[]> {
  const response = await fetch(`${API_BASE_URL}/v1/datasets`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new ApiError(
      `Failed to fetch datasets: ${response.status} ${errorText}`,
      response.status,
      response.statusText,
    )
  }

  const data = await response.json()

  // Handle both array response and object with datasets property
  if (Array.isArray(data)) {
    return data
  }

  if (data?.datasets && Array.isArray(data.datasets)) {
    return data.datasets
  }

  return []
}

export interface CreateDatasetRequest {
  name: string
  description: string
  mediaType: MediaType
}

export async function createDataset(
  request: CreateDatasetRequest,
): Promise<Dataset> {
  const response = await fetch(`${API_BASE_URL}/v1/datasets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new ApiError(
      `Failed to create dataset: ${response.status} ${errorText}`,
      response.status,
      response.statusText,
    )
  }

  return response.json()
}
