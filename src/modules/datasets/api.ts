import { apiClient } from '~/lib/api-client'
import { API_ENDPOINTS } from '~/lib/endpoints'

export type MediaType = 'image' | 'video' | 'audio' | 'text'
export type ExportFormat = 'yolo' | 'coco' | 'pascal_voc' | 'csv' | 'json'

export interface DatasetBatch {
  id: string
  name: string
  imageCount: number
  segmentCount: number
  labeledCount: number
  addedAt: string
}

export interface Dataset {
  id: string
  name: string
  description: string
  mediaType: MediaType
  status: 'draft' | 'ready' | 'exported'
  totalImages: number
  totalSegments: number
  labeledSegments: number
  batches?: DatasetBatch[]
  exportFormats?: ExportFormat[]
  lastExportedAt?: string
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
  try {
    const response = await apiClient<Dataset[] | { datasets: Dataset[] }>(
      API_ENDPOINTS.DATASETS.LIST,
      { method: 'GET' },
    )

    // Handle both array response and object with datasets property
    if (Array.isArray(response)) {
      return response
    }

    if (response?.datasets && Array.isArray(response.datasets)) {
      return response.datasets
    }

    return []
  } catch (error) {
    console.error('Failed to fetch datasets:', error)
    return []
  }
}

export async function getDataset(id: string): Promise<Dataset> {
  return apiClient<Dataset>(API_ENDPOINTS.DATASETS.DETAIL(id), {
    method: 'GET',
  })
}

export interface CreateDatasetRequest {
  name: string
  description: string
  mediaType: MediaType
}

export interface UpdateDatasetRequest {
  name?: string
  description?: string
  mediaType?: MediaType
}

export async function createDataset(
  request: CreateDatasetRequest,
): Promise<Dataset> {
  return apiClient<Dataset>(API_ENDPOINTS.DATASETS.CREATE, {
    method: 'POST',
    body: request,
  })
}

export async function updateDataset(
  id: string,
  request: UpdateDatasetRequest,
): Promise<Dataset> {
  return apiClient<Dataset>(API_ENDPOINTS.DATASETS.UPDATE(id), {
    method: 'PUT',
    body: request,
  })
}

export async function deleteDataset(id: string): Promise<void> {
  return apiClient<void>(API_ENDPOINTS.DATASETS.DELETE(id), {
    method: 'DELETE',
  })
}

/**
 * Add batches to a dataset
 */
export interface AddBatchesToDatasetRequest {
  batchIds: string[]
}

export async function addBatchesToDataset(
  datasetId: string,
  batchIds: string[],
): Promise<{ message: string; addedCount: number }> {
  return apiClient<{ message: string; addedCount: number }>(
    API_ENDPOINTS.DATASETS.ADD_BATCHES(datasetId),
    {
      method: 'POST',
      body: { batchIds },
    },
  )
}

/**
 * Create dataset from batches (shortcut)
 */
export interface CreateDatasetFromBatchesRequest {
  name: string
  description?: string
  batchIds: string[]
}

export async function createDatasetFromBatches(
  request: CreateDatasetFromBatchesRequest,
): Promise<Dataset> {
  // First create the dataset
  const dataset = await createDataset({
    name: request.name,
    description: request.description || '',
    mediaType: 'image',
  })

  // Then add batches to it
  if (request.batchIds.length > 0) {
    await addBatchesToDataset(dataset.id, request.batchIds)
  }

  return dataset
}

/**
 * Export dataset in specified format
 */
export interface ExportDatasetRequest {
  format: ExportFormat
  includeImages?: boolean
  splitRatio?: {
    train: number
    val: number
    test: number
  }
}

export interface ExportDatasetResponse {
  jobId: string
  downloadUrl?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  message: string
}

export async function exportDataset(
  datasetId: string,
  request: ExportDatasetRequest,
): Promise<ExportDatasetResponse> {
  return apiClient<ExportDatasetResponse>(
    API_ENDPOINTS.DATASETS.EXPORT(datasetId),
    {
      method: 'POST',
      body: request,
    },
  )
}

/**
 * Get export job status
 */
export async function getExportStatus(
  datasetId: string,
  jobId: string,
): Promise<ExportDatasetResponse> {
  return apiClient<ExportDatasetResponse>(
    `${API_ENDPOINTS.DATASETS.EXPORT(datasetId)}/${jobId}`,
    {
      method: 'GET',
    },
  )
}
