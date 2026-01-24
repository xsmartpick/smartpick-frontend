import { apiClient } from '~/lib/api-client'
import { API_ENDPOINTS } from '~/lib/endpoints'

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
  const data = await apiClient<
    BackendLabelSet[] | { labelSets: BackendLabelSet[] }
  >(API_ENDPOINTS.LABEL_SETS.LIST, { method: 'GET' })
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
  const data = await apiClient<BackendLabelSet>(
    API_ENDPOINTS.LABEL_SETS.CREATE,
    {
      method: 'POST',
      body: request,
    },
  )
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
  const data = await apiClient<BackendLabelSet>(
    API_ENDPOINTS.LABEL_SETS.UPDATE(id),
    {
      method: 'PUT',
      body: request,
    },
  )
  return mapLabelSet(data)
}

export async function deleteLabelSet(id: string): Promise<void> {
  await apiClient<void>(API_ENDPOINTS.LABEL_SETS.DELETE(id), {
    method: 'DELETE',
  })
}
