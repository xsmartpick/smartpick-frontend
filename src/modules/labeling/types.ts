import type { Label } from '~/modules/label-sets/api'

/**
 * Represents an image to be labeled
 */
export interface LabelingImage {
  id: string
  name: string
  url: string
  width: number
  height: number
}

/**
 * Represents a label assignment to an image
 */
export interface ImageLabel {
  imageId: string
  labelId: string
  labelName: string
  labelColor?: string
  assignedAt: string
}

/**
 * Labeling session state
 */
export interface LabelingSession {
  images: LabelingImage[]
  labels: Label[]
  assignments: ImageLabel[]
  currentImageIndex: number
}
