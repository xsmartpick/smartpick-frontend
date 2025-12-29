import {
  LabelingPage,
  mockLabelingImages,
  mockLabels,
} from '~/modules/labeling'

/**
 * Labeling page route
 *
 * This is a thin wrapper that:
 * - Provides mock data (will be replaced with real data fetching)
 * - Handles route-specific concerns (URL params, query strings, etc.)
 * - Connects to the reusable LabelingPage component from the module
 */
export const Component = () => {
  return (
    <LabelingPage
      images={mockLabelingImages}
      labels={mockLabels}
      onSave={(_) => {
        // UI only - no backend integration
        // TODO: implement actual API call when backend is ready
      }}
    />
  )
}
