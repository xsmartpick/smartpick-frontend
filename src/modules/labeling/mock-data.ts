import type { Label } from '~/modules/label-sets/api'

import type { LabelingImage } from './types'

// Mock images for labeling
export const mockLabelingImages: LabelingImage[] = [
  {
    id: 'img-1',
    name: 'product-photo-001.jpg',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop',
    width: 800,
    height: 600,
  },
  {
    id: 'img-2',
    name: 'product-photo-002.jpg',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop',
    width: 800,
    height: 600,
  },
  {
    id: 'img-3',
    name: 'product-photo-003.jpg',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop',
    width: 800,
    height: 600,
  },
  {
    id: 'img-4',
    name: 'product-photo-004.jpg',
    url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=600&fit=crop',
    width: 800,
    height: 600,
  },
  {
    id: 'img-5',
    name: 'product-photo-005.jpg',
    url: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&h=600&fit=crop',
    width: 800,
    height: 600,
  },
  {
    id: 'img-6',
    name: 'product-photo-006.jpg',
    url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&h=600&fit=crop',
    width: 800,
    height: 600,
  },
  {
    id: 'img-7',
    name: 'product-photo-007.jpg',
    url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&h=600&fit=crop',
    width: 800,
    height: 600,
  },
  {
    id: 'img-8',
    name: 'product-photo-008.jpg',
    url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&h=600&fit=crop',
    width: 800,
    height: 600,
  },
]

// Mock labels (using the same structure as label-sets)
export const mockLabels: Label[] = [
  {
    id: 'label-1',
    name: 'Good Quality',
    description: 'Product meets quality standards',
    color: '#10B981',
  },
  {
    id: 'label-2',
    name: 'Defective',
    description: 'Product has defects',
    color: '#EF4444',
  },
  {
    id: 'label-3',
    name: 'Needs Review',
    description: 'Requires manual inspection',
    color: '#F59E0B',
  },
  {
    id: 'label-4',
    name: 'Perfect',
    description: 'Excellent quality',
    color: '#3B82F6',
  },
  {
    id: 'label-5',
    name: 'Minor Issues',
    description: 'Small imperfections',
    color: '#8B5CF6',
  },
]
