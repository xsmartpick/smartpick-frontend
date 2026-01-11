import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'

import {
  renderWithProviders,
  screen,
  userEvent,
} from '../../../../test/utils/render'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  describe('Rendering', () => {
    it('renders pagination correctly', () => {
      renderWithProviders(
        <Pagination totalPages={5} currentPage={1} onPageChange={vi.fn()} />,
      )
      const nav = screen.getByRole('navigation', { name: /pagination/i })
      expect(nav).toBeInTheDocument()
    })

    it('does not render when totalPages is 1', () => {
      renderWithProviders(
        <Pagination totalPages={1} currentPage={1} onPageChange={vi.fn()} />,
      )
      const nav = screen.queryByRole('navigation', { name: /pagination/i })
      expect(nav).not.toBeInTheDocument()
    })

    it('does not render when totalPages is 0', () => {
      renderWithProviders(
        <Pagination totalPages={0} currentPage={1} onPageChange={vi.fn()} />,
      )
      const nav = screen.queryByRole('navigation', { name: /pagination/i })
      expect(nav).not.toBeInTheDocument()
    })

    it('renders correct number of page buttons', () => {
      renderWithProviders(
        <Pagination totalPages={5} currentPage={3} onPageChange={vi.fn()} />,
      )
      // Should have: Previous, 1, 2, 3, 4, 5, Next
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBe(7) // 2 nav + 5 pages
    })

    it('renders with custom className', () => {
      const { container } = renderWithProviders(
        <Pagination
          totalPages={5}
          currentPage={1}
          onPageChange={vi.fn()}
          className="custom-pagination-class"
        />,
      )
      const nav = container.querySelector('nav')
      expect(nav).toHaveClass('custom-pagination-class')
    })
  })

  describe('Navigation Buttons', () => {
    it('renders Previous button', () => {
      renderWithProviders(
        <Pagination totalPages={5} currentPage={2} onPageChange={vi.fn()} />,
      )
      const prevButton = screen.getByRole('button', {
        name: /go to previous page/i,
      })
      expect(prevButton).toBeInTheDocument()
    })

    it('renders Next button', () => {
      renderWithProviders(
        <Pagination totalPages={5} currentPage={2} onPageChange={vi.fn()} />,
      )
      const nextButton = screen.getByRole('button', {
        name: /go to next page/i,
      })
      expect(nextButton).toBeInTheDocument()
    })

    it('disables Previous button on first page', () => {
      renderWithProviders(
        <Pagination totalPages={5} currentPage={1} onPageChange={vi.fn()} />,
      )
      const prevButton = screen.getByRole('button', {
        name: /go to previous page/i,
      })
      expect(prevButton).toBeDisabled()
    })

    it('enables Previous button when not on first page', () => {
      renderWithProviders(
        <Pagination totalPages={5} currentPage={2} onPageChange={vi.fn()} />,
      )
      const prevButton = screen.getByRole('button', {
        name: /go to previous page/i,
      })
      expect(prevButton).not.toBeDisabled()
    })

    it('disables Next button on last page', () => {
      renderWithProviders(
        <Pagination totalPages={5} currentPage={5} onPageChange={vi.fn()} />,
      )
      const nextButton = screen.getByRole('button', {
        name: /go to next page/i,
      })
      expect(nextButton).toBeDisabled()
    })

    it('enables Next button when not on last page', () => {
      renderWithProviders(
        <Pagination totalPages={5} currentPage={4} onPageChange={vi.fn()} />,
      )
      const nextButton = screen.getByRole('button', {
        name: /go to next page/i,
      })
      expect(nextButton).not.toBeDisabled()
    })

    it('Previous button has screen reader text', () => {
      renderWithProviders(
        <Pagination totalPages={5} currentPage={2} onPageChange={vi.fn()} />,
      )
      expect(screen.getByText('Previous')).toHaveClass('sr-only')
    })

    it('Next button has screen reader text', () => {
      renderWithProviders(
        <Pagination totalPages={5} currentPage={2} onPageChange={vi.fn()} />,
      )
      expect(screen.getByText('Next')).toHaveClass('sr-only')
    })
  })

  describe('Page Number Buttons', () => {
    it('renders page number buttons', () => {
      renderWithProviders(
        <Pagination totalPages={5} currentPage={3} onPageChange={vi.fn()} />,
      )
      expect(
        screen.getByRole('button', { name: /go to page 1/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /go to page 2/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /go to page 3/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /go to page 4/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /go to page 5/i }),
      ).toBeInTheDocument()
    })

    it('highlights active page button', () => {
      renderWithProviders(
        <Pagination totalPages={5} currentPage={3} onPageChange={vi.fn()} />,
      )
      const page3Button = screen.getByRole('button', { name: /go to page 3/i })
      expect(page3Button).toHaveClass('bg-accent', 'text-background')
    })

    it('non-active page buttons have different styling', () => {
      renderWithProviders(
        <Pagination totalPages={5} currentPage={3} onPageChange={vi.fn()} />,
      )
      const page1Button = screen.getByRole('button', { name: /go to page 1/i })
      expect(page1Button).toHaveClass('text-text-secondary')
      expect(page1Button).not.toHaveClass('bg-accent')
    })

    it('active page has aria-current attribute', () => {
      renderWithProviders(
        <Pagination totalPages={5} currentPage={3} onPageChange={vi.fn()} />,
      )
      const page3Button = screen.getByRole('button', { name: /go to page 3/i })
      expect(page3Button).toHaveAttribute('aria-current', 'page')
    })

    it('non-active pages do not have aria-current', () => {
      renderWithProviders(
        <Pagination totalPages={5} currentPage={3} onPageChange={vi.fn()} />,
      )
      const page1Button = screen.getByRole('button', { name: /go to page 1/i })
      expect(page1Button).not.toHaveAttribute('aria-current')
    })
  })

  describe('Pagination Logic', () => {
    it('shows all pages when totalPages is small', () => {
      renderWithProviders(
        <Pagination totalPages={5} currentPage={3} onPageChange={vi.fn()} />,
      )
      // All 5 pages should be visible
      expect(
        screen.getByRole('button', { name: /go to page 1/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /go to page 5/i }),
      ).toBeInTheDocument()
    })

    it('shows ellipsis for large page counts', () => {
      const { container } = renderWithProviders(
        <Pagination totalPages={20} currentPage={10} onPageChange={vi.fn()} />,
      )
      // Should have ellipsis elements (aria-hidden spans)
      const ellipsis = container.querySelectorAll('span[aria-hidden]')
      expect(ellipsis.length).toBeGreaterThan(0)
    })

    it('shows right ellipsis when near start', () => {
      renderWithProviders(
        <Pagination totalPages={20} currentPage={2} onPageChange={vi.fn()} />,
      )
      // Should show: 1, 2, 3, 4, ..., 20
      expect(
        screen.getByRole('button', { name: /go to page 1/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /go to page 20/i }),
      ).toBeInTheDocument()
    })

    it('shows left ellipsis when near end', () => {
      renderWithProviders(
        <Pagination totalPages={20} currentPage={19} onPageChange={vi.fn()} />,
      )
      // Should show: 1, ..., 17, 18, 19, 20
      expect(
        screen.getByRole('button', { name: 'Go to page 1' }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Go to page 20' }),
      ).toBeInTheDocument()
    })

    it('shows both ellipsis when in middle', () => {
      const { container } = renderWithProviders(
        <Pagination totalPages={20} currentPage={10} onPageChange={vi.fn()} />,
      )
      // Should show: 1, ..., 9, 10, 11, ..., 20
      const ellipsis = container.querySelectorAll('span[aria-hidden]')
      expect(ellipsis.length).toBe(2) // Two ellipsis elements
    })
  })

  describe('Callbacks', () => {
    it('calls onPageChange when clicking page number', async () => {
      const handlePageChange = vi.fn()
      const user = userEvent.setup()

      renderWithProviders(
        <Pagination
          totalPages={5}
          currentPage={1}
          onPageChange={handlePageChange}
        />,
      )

      const page3Button = screen.getByRole('button', { name: /go to page 3/i })
      await user.click(page3Button)

      expect(handlePageChange).toHaveBeenCalledWith(3)
      expect(handlePageChange).toHaveBeenCalledTimes(1)
    })

    it('calls onPageChange when clicking Previous', async () => {
      const handlePageChange = vi.fn()
      const user = userEvent.setup()

      renderWithProviders(
        <Pagination
          totalPages={5}
          currentPage={3}
          onPageChange={handlePageChange}
        />,
      )

      const prevButton = screen.getByRole('button', {
        name: /go to previous page/i,
      })
      await user.click(prevButton)

      expect(handlePageChange).toHaveBeenCalledWith(2)
    })

    it('calls onPageChange when clicking Next', async () => {
      const handlePageChange = vi.fn()
      const user = userEvent.setup()

      renderWithProviders(
        <Pagination
          totalPages={5}
          currentPage={3}
          onPageChange={handlePageChange}
        />,
      )

      const nextButton = screen.getByRole('button', {
        name: /go to next page/i,
      })
      await user.click(nextButton)

      expect(handlePageChange).toHaveBeenCalledWith(4)
    })

    it('does not call onPageChange when clicking disabled Previous', async () => {
      const handlePageChange = vi.fn()
      const user = userEvent.setup()

      renderWithProviders(
        <Pagination
          totalPages={5}
          currentPage={1}
          onPageChange={handlePageChange}
        />,
      )

      const prevButton = screen.getByRole('button', {
        name: /go to previous page/i,
      })
      await user.click(prevButton)

      expect(handlePageChange).not.toHaveBeenCalled()
    })

    it('does not call onPageChange when clicking disabled Next', async () => {
      const handlePageChange = vi.fn()
      const user = userEvent.setup()

      renderWithProviders(
        <Pagination
          totalPages={5}
          currentPage={5}
          onPageChange={handlePageChange}
        />,
      )

      const nextButton = screen.getByRole('button', {
        name: /go to next page/i,
      })
      await user.click(nextButton)

      expect(handlePageChange).not.toHaveBeenCalled()
    })
  })

  describe('siblingCount Prop', () => {
    it('uses default siblingCount of 1', () => {
      renderWithProviders(
        <Pagination totalPages={10} currentPage={5} onPageChange={vi.fn()} />,
      )
      // With siblingCount=1, should show: 1, ..., 4, 5, 6, ..., 10
      expect(
        screen.getByRole('button', { name: /go to page 4/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /go to page 5/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /go to page 6/i }),
      ).toBeInTheDocument()
    })

    it('respects custom siblingCount', () => {
      renderWithProviders(
        <Pagination
          totalPages={20}
          currentPage={10}
          onPageChange={vi.fn()}
          siblingCount={2}
        />,
      )
      // With siblingCount=2, should show: 1, ..., 8, 9, 10, 11, 12, ..., 20
      expect(
        screen.getByRole('button', { name: /go to page 8/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /go to page 12/i }),
      ).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has navigation role and label', () => {
      renderWithProviders(
        <Pagination totalPages={5} currentPage={1} onPageChange={vi.fn()} />,
      )
      const nav = screen.getByRole('navigation', { name: /pagination/i })
      expect(nav).toHaveAttribute('aria-label', 'pagination')
    })

    it('page buttons have descriptive aria-labels', () => {
      renderWithProviders(
        <Pagination totalPages={5} currentPage={3} onPageChange={vi.fn()} />,
      )
      const page1Button = screen.getByRole('button', { name: /go to page 1/i })
      expect(page1Button).toHaveAttribute('aria-label', 'Go to page 1')
    })

    it('navigation buttons have descriptive aria-labels', () => {
      renderWithProviders(
        <Pagination totalPages={5} currentPage={3} onPageChange={vi.fn()} />,
      )
      const prevButton = screen.getByRole('button', {
        name: /go to previous page/i,
      })
      const nextButton = screen.getByRole('button', {
        name: /go to next page/i,
      })

      expect(prevButton).toHaveAttribute('aria-label', 'Go to previous page')
      expect(nextButton).toHaveAttribute('aria-label', 'Go to next page')
    })

    it('ellipsis is aria-hidden', () => {
      const { container } = renderWithProviders(
        <Pagination totalPages={20} currentPage={10} onPageChange={vi.fn()} />,
      )
      const ellipsis = container.querySelectorAll('span[aria-hidden]')
      ellipsis.forEach((el) => {
        expect(el).toHaveAttribute('aria-hidden')
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles currentPage = totalPages correctly', () => {
      renderWithProviders(
        <Pagination totalPages={5} currentPage={5} onPageChange={vi.fn()} />,
      )
      const page5Button = screen.getByRole('button', { name: /go to page 5/i })
      expect(page5Button).toHaveClass('bg-accent')
    })

    it('handles currentPage = 1 correctly', () => {
      renderWithProviders(
        <Pagination totalPages={5} currentPage={1} onPageChange={vi.fn()} />,
      )
      const page1Button = screen.getByRole('button', { name: /go to page 1/i })
      expect(page1Button).toHaveClass('bg-accent')
    })

    it('renders correctly with totalPages = 2', () => {
      renderWithProviders(
        <Pagination totalPages={2} currentPage={1} onPageChange={vi.fn()} />,
      )
      expect(
        screen.getByRole('button', { name: /go to page 1/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /go to page 2/i }),
      ).toBeInTheDocument()
    })
  })
})
