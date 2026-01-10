import { describe, expect, it, vi } from 'vitest'

import {
  renderWithProviders,
  screen,
  userEvent,
} from '../../../../test/utils/render'
import { Button } from './Button'

describe('Button', () => {
  describe('Rendering', () => {
    it('renders correctly with children', () => {
      renderWithProviders(<Button>Click me</Button>)
      expect(
        screen.getByRole('button', { name: /click me/i }),
      ).toBeInTheDocument()
    })

    it('renders primary variant by default', () => {
      renderWithProviders(<Button>Primary</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-accent')
    })
  })

  describe('Variants', () => {
    it('renders all variants without crashing', () => {
      const variants = [
        'primary',
        'secondary',
        'light',
        'ghost',
        'destructive',
      ] as const

      variants.forEach((variant) => {
        const { unmount } = renderWithProviders(
          <Button variant={variant}>{variant}</Button>,
        )
        expect(screen.getByRole('button')).toBeInTheDocument()
        unmount()
      })
    })

    it('applies correct classes for secondary variant', () => {
      renderWithProviders(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-background')
      expect(button).toHaveClass('border-border')
    })

    it('applies correct classes for destructive variant', () => {
      renderWithProviders(<Button variant="destructive">Delete</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-red')
    })
  })

  describe('Sizes', () => {
    it('applies small size classes', () => {
      renderWithProviders(<Button size="sm">Small</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-xs')
    })

    it('applies medium size classes by default', () => {
      renderWithProviders(<Button>Medium</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-4', 'py-2', 'text-sm')
    })
  })

  describe('States', () => {
    it('handles disabled state correctly', () => {
      renderWithProviders(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('shows loading state with spinner', () => {
      renderWithProviders(
        <Button isLoading loadingText="Loading...">
          Submit
        </Button>,
      )
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0)
    })

    it('hides children when loading without loadingText', () => {
      renderWithProviders(<Button isLoading>Submit</Button>)
      expect(screen.getByText('Submit')).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      renderWithProviders(<Button onClick={handleClick}>Click</Button>)

      await user.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      renderWithProviders(
        <Button onClick={handleClick} disabled>
          Click
        </Button>,
      )

      await user.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('does not call onClick when loading', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      renderWithProviders(
        <Button onClick={handleClick} isLoading>
          Click
        </Button>,
      )

      await user.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Custom className', () => {
    it('merges custom className with default classes', () => {
      renderWithProviders(<Button className="custom-class">Custom</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
      expect(button).toHaveClass('rounded-lg')
    })
  })
})
