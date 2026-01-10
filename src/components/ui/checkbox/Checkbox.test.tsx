import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'

import {
  renderWithProviders,
  screen,
  userEvent,
} from '../../../../test/utils/render'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  describe('Rendering', () => {
    it('renders checkbox correctly', () => {
      renderWithProviders(<Checkbox />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
    })

    it('renders unchecked by default', () => {
      renderWithProviders(<Checkbox />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
    })

    it('renders checked when defaultChecked is true', () => {
      renderWithProviders(<Checkbox defaultChecked />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })
  })

  describe('Checked/Unchecked States', () => {
    it('can be clicked', async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()

      renderWithProviders(<Checkbox onCheckedChange={handleChange} />)
      const checkbox = screen.getByRole('checkbox')

      await user.click(checkbox)
      expect(handleChange).toHaveBeenCalledWith(true)
      expect(handleChange).toHaveBeenCalledTimes(1)
    })

    it('applies correct styling when checked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Checkbox />)
      const checkbox = screen.getByRole('checkbox')

      await user.click(checkbox)
      expect(checkbox).toHaveAttribute('data-state', 'checked')
      expect(checkbox).toHaveClass('data-[state=checked]:bg-accent')
    })

    it('applies correct styling when unchecked', () => {
      renderWithProviders(<Checkbox />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('data-state', 'unchecked')
      expect(checkbox).toHaveClass('bg-fill')
    })
  })

  describe('Indeterminate State', () => {
    it('renders indeterminate state when prop is true', () => {
      const { container } = renderWithProviders(<Checkbox indeterminate />)
      const checkbox = screen.getByRole('checkbox')

      // Indeterminate state applies special styling
      expect(checkbox).toHaveClass('bg-accent', 'text-white')

      // Check for indeterminate indicator (horizontal line)
      const indicator = container.querySelector(
        '[data-slot="checkbox-indicator"]',
      )
      expect(indicator).toBeInTheDocument()
    })

    it('shows horizontal line for indeterminate state', () => {
      const { container } = renderWithProviders(<Checkbox indeterminate />)
      const paths = container.querySelectorAll('path')

      // Should have 2 paths: checkmark and horizontal line
      expect(paths.length).toBe(2)

      // Second path is horizontal line (d="M6 12h12")
      const horizontalLine = Array.from(paths).find((path) =>
        path.getAttribute('d')?.includes('M6 12h12'),
      )
      expect(horizontalLine).toBeInTheDocument()
    })

    it('does not show checkmark when indeterminate', () => {
      renderWithProviders(<Checkbox indeterminate />)
      const checkbox = screen.getByRole('checkbox')

      // Checkbox should not be checked when indeterminate
      expect(checkbox).toHaveAttribute('data-state', 'unchecked')
    })
  })

  describe('Callbacks', () => {
    it('calls onCheckedChange when checked', async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()

      renderWithProviders(<Checkbox onCheckedChange={handleChange} />)
      const checkbox = screen.getByRole('checkbox')

      await user.click(checkbox)
      expect(handleChange).toHaveBeenCalledWith(true)
    })

    it('calls onCheckedChange with correct value', async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()

      renderWithProviders(<Checkbox onCheckedChange={handleChange} />)

      await user.click(screen.getByRole('checkbox'))
      expect(handleChange).toHaveBeenCalledTimes(1)
      expect(handleChange).toHaveBeenLastCalledWith(true)
    })
  })

  describe('Disabled State', () => {
    it('disables checkbox when disabled prop is true', () => {
      renderWithProviders(<Checkbox disabled />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeDisabled()
    })

    it('applies disabled styling', () => {
      renderWithProviders(<Checkbox disabled />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveClass(
        'disabled:cursor-not-allowed',
        'disabled:opacity-50',
      )
    })

    it('does not call onCheckedChange when disabled', async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()

      renderWithProviders(<Checkbox disabled onCheckedChange={handleChange} />)
      const checkbox = screen.getByRole('checkbox')

      await user.click(checkbox)
      expect(handleChange).not.toHaveBeenCalled()
    })

    it('does not toggle state when disabled', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Checkbox disabled />)
      const checkbox = screen.getByRole('checkbox')

      expect(checkbox).not.toBeChecked()
      await user.click(checkbox)
      expect(checkbox).not.toBeChecked()
    })
  })

  describe('Controlled vs Uncontrolled', () => {
    it('works as uncontrolled component', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Checkbox defaultChecked={false} />)
      const checkbox = screen.getByRole('checkbox')

      expect(checkbox).not.toBeChecked()

      await user.click(checkbox)
      expect(checkbox).toBeChecked()
    })

    it('works as controlled component', () => {
      const ControlledCheckbox = () => {
        const [checked, setChecked] = React.useState(true)
        return <Checkbox checked={checked} onCheckedChange={setChecked} />
      }

      renderWithProviders(<ControlledCheckbox />)
      const checkbox = screen.getByRole('checkbox')

      expect(checkbox).toBeChecked()
    })

    it('respects controlled checked prop', () => {
      const { rerender } = renderWithProviders(<Checkbox checked={false} />)
      let checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()

      rerender(<Checkbox checked={true} />)
      checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })
  })

  describe('Custom className', () => {
    it('applies custom className', () => {
      renderWithProviders(<Checkbox className="custom-checkbox-class" />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveClass('custom-checkbox-class')
    })

    it('merges custom className with default classes', () => {
      renderWithProviders(<Checkbox className="my-custom-class" />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveClass('my-custom-class')
      expect(checkbox).toHaveClass('size-5') // Default class
      expect(checkbox).toHaveClass('rounded-sm') // Default class
    })
  })

  describe('Accessibility', () => {
    it('has correct role', () => {
      renderWithProviders(<Checkbox />)
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('has correct data-state attribute', () => {
      renderWithProviders(<Checkbox />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('data-state', 'unchecked')
    })

    it('updates data-state on check', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Checkbox />)
      const checkbox = screen.getByRole('checkbox')

      await user.click(checkbox)
      expect(checkbox).toHaveAttribute('data-state', 'checked')
    })

    it('can be focused', () => {
      renderWithProviders(<Checkbox />)
      const checkbox = screen.getByRole('checkbox')
      checkbox.focus()
      expect(checkbox).toHaveFocus()
    })

    it('has focus-visible ring styles', () => {
      renderWithProviders(<Checkbox />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveClass('focus-visible:ring-2')
    })
  })

  describe('Visual Indicator', () => {
    it('renders checkbox indicator', () => {
      const { container } = renderWithProviders(<Checkbox />)
      const indicator = container.querySelector(
        '[data-slot="checkbox-indicator"]',
      )
      expect(indicator).toBeInTheDocument()
    })

    it('has checkmark path', () => {
      const { container } = renderWithProviders(<Checkbox />)
      const paths = container.querySelectorAll('path')

      // Should have 2 paths: checkmark and indeterminate line
      expect(paths.length).toBe(2)

      // First path is checkmark (d="M4.5 12.75l6 6 9-13.5")
      const checkmark = Array.from(paths).find((path) =>
        path.getAttribute('d')?.includes('M4.5 12.75l6 6 9-13.5'),
      )
      expect(checkmark).toBeInTheDocument()
    })
  })
})
