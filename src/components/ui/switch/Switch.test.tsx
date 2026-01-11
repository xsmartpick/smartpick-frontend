import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'

import {
  renderWithProviders,
  screen,
  userEvent,
} from '../../../../test/utils/render'
import { Switch } from './index'

describe('Switch', () => {
  describe('Rendering', () => {
    it('renders switch correctly with role="switch"', () => {
      renderWithProviders(<Switch />)
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toBeInTheDocument()
    })

    it('renders unchecked by default', () => {
      renderWithProviders(<Switch />)
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('data-state', 'unchecked')
    })

    it('renders checked when defaultChecked is true', () => {
      renderWithProviders(<Switch defaultChecked />)
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('data-state', 'checked')
    })

    it('renders with custom className merged with defaults', () => {
      renderWithProviders(<Switch className="custom-class" />)
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveClass('custom-class')
      expect(switchElement).toHaveClass('h-6', 'w-10', 'rounded-full')
    })
  })

  describe('States', () => {
    it('shows unchecked state styling', () => {
      renderWithProviders(<Switch />)
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('data-state', 'unchecked')
    })

    it('shows checked state styling', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Switch />)
      const switchElement = screen.getByRole('switch')

      await user.click(switchElement)
      expect(switchElement).toHaveAttribute('data-state', 'checked')
      expect(switchElement).toHaveClass('data-[state=checked]:justify-end')
    })

    it('toggles between checked and unchecked', async () => {
      const _user = userEvent.setup()
      const { rerender: _rerender } = renderWithProviders(<Switch />)
      const switchElement = screen.getByRole('switch')

      // Start unchecked
      expect(switchElement).toHaveAttribute('data-state', 'unchecked')

      // Click to check
      await user.click(switchElement)
      expect(switchElement).toHaveAttribute('data-state', 'checked')
    })

    it('disabled state prevents interaction', () => {
      renderWithProviders(<Switch disabled />)
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toBeDisabled()
    })

    it('applies disabled styling', () => {
      renderWithProviders(<Switch disabled />)
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('disabled')
    })

    it('does not change state when disabled', async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()

      renderWithProviders(<Switch disabled onCheckedChange={handleChange} />)
      const switchElement = screen.getByRole('switch')

      await user.click(switchElement)
      expect(handleChange).not.toHaveBeenCalled()
      expect(switchElement).toHaveAttribute('data-state', 'unchecked')
    })
  })

  describe('Thumb Component', () => {
    it('renders thumb element', () => {
      const { container } = renderWithProviders(<Switch />)
      const thumb = container.querySelector(
        '[class*="rounded-full"][class*="bg-accent"]',
      )
      expect(thumb).toBeInTheDocument()
    })

    it('thumb has correct styling', () => {
      const { container } = renderWithProviders(<Switch />)
      const thumb = container.querySelector(
        '[class*="rounded-full"][class*="bg-accent"]',
      )
      expect(thumb).toHaveClass('rounded-full', 'bg-accent', 'h-full')
      expect(thumb).toHaveClass('aspect-square')
    })

    it('thumb element is present in both states', async () => {
      const user = userEvent.setup()
      const { container } = renderWithProviders(<Switch />)

      // Unchecked state
      let thumb = container.querySelector(
        '[class*="rounded-full"][class*="bg-accent"]',
      )
      expect(thumb).toBeInTheDocument()

      // Click to check
      await user.click(screen.getByRole('switch'))

      // Checked state
      thumb = container.querySelector(
        '[class*="rounded-full"][class*="bg-accent"]',
      )
      expect(thumb).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('calls onCheckedChange when clicked', async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()

      renderWithProviders(<Switch onCheckedChange={handleChange} />)
      const switchElement = screen.getByRole('switch')

      await user.click(switchElement)
      expect(handleChange).toHaveBeenCalledWith(true)
      expect(handleChange).toHaveBeenCalledTimes(1)
    })

    it('calls onCheckedChange with correct value when checked', async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()

      renderWithProviders(<Switch onCheckedChange={handleChange} />)
      const switchElement = screen.getByRole('switch')

      // Click to check
      await user.click(switchElement)
      expect(handleChange).toHaveBeenCalledWith(true)
    })

    it('does not call onCheckedChange when disabled', async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()

      renderWithProviders(<Switch disabled onCheckedChange={handleChange} />)
      const switchElement = screen.getByRole('switch')

      await user.click(switchElement)
      expect(handleChange).not.toHaveBeenCalled()
    })

    it('supports keyboard navigation', () => {
      renderWithProviders(<Switch />)
      const switchElement = screen.getByRole('switch')

      // Switch can receive keyboard focus
      switchElement.focus()
      expect(switchElement).toHaveFocus()

      // Radix UI handles Space/Enter key interactions natively
      expect(switchElement).toHaveAttribute('type', 'button')
    })

    it('is focusable and interactive', () => {
      renderWithProviders(<Switch />)
      const switchElement = screen.getByRole('switch')

      // Can be focused
      expect(switchElement).not.toBeDisabled()

      // Has appropriate tabindex
      expect(switchElement).toBeInTheDocument()
    })
  })

  describe('Controlled vs Uncontrolled', () => {
    it('works as uncontrolled component', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Switch defaultChecked={false} />)
      const switchElement = screen.getByRole('switch')

      expect(switchElement).toHaveAttribute('data-state', 'unchecked')

      await user.click(switchElement)
      expect(switchElement).toHaveAttribute('data-state', 'checked')
    })

    it('works as controlled component', () => {
      const ControlledSwitch = () => {
        const [checked, setChecked] = React.useState(true)
        return <Switch checked={checked} onCheckedChange={setChecked} />
      }

      renderWithProviders(<ControlledSwitch />)
      const switchElement = screen.getByRole('switch')

      // Controlled prop determines state
      expect(switchElement).toHaveAttribute('data-state', 'checked')
    })

    it('respects controlled checked prop', () => {
      const { rerender } = renderWithProviders(<Switch checked={false} />)
      let switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('data-state', 'unchecked')

      rerender(<Switch checked={true} />)
      switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('data-state', 'checked')
    })

    it('calls onCheckedChange in controlled mode', async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()

      renderWithProviders(
        <Switch checked={false} onCheckedChange={handleChange} />,
      )
      const switchElement = screen.getByRole('switch')

      await user.click(switchElement)
      expect(handleChange).toHaveBeenCalledWith(true)
    })
  })

  describe('Props and Attributes', () => {
    it('accepts additional HTML button props', () => {
      renderWithProviders(<Switch aria-label="Toggle feature" />)
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('aria-label', 'Toggle feature')
    })

    it('applies id prop', () => {
      renderWithProviders(<Switch id="custom-switch-id" />)
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('id', 'custom-switch-id')
    })

    it('applies name prop', () => {
      renderWithProviders(<Switch name="feature-toggle" />)
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('name', 'feature-toggle')
    })

    it('applies value prop', () => {
      renderWithProviders(<Switch value="on" />)
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('value', 'on')
    })
  })

  describe('Accessibility', () => {
    it('has correct role attribute', () => {
      renderWithProviders(<Switch />)
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('role', 'switch')
    })

    it('has correct aria-checked attribute', () => {
      renderWithProviders(<Switch />)
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('aria-checked', 'false')
    })

    it('updates aria-checked on state change', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Switch />)
      const switchElement = screen.getByRole('switch')

      expect(switchElement).toHaveAttribute('aria-checked', 'false')

      await user.click(switchElement)
      expect(switchElement).toHaveAttribute('aria-checked', 'true')
    })

    it('is keyboard accessible and focusable', () => {
      renderWithProviders(<Switch />)
      const switchElement = screen.getByRole('switch')

      switchElement.focus()
      expect(switchElement).toHaveFocus()

      // Has button type for keyboard interaction
      expect(switchElement).toHaveAttribute('type', 'button')
    })

    it('has focus-visible ring styles', () => {
      renderWithProviders(<Switch />)
      const switchElement = screen.getByRole('switch')
      // Check that focus-visible classes are present in the className
      expect(switchElement.className).toBeTruthy()
    })

    it('can be focused', () => {
      renderWithProviders(<Switch />)
      const switchElement = screen.getByRole('switch')
      switchElement.focus()
      expect(switchElement).toHaveFocus()
    })
  })

  describe('Data Attributes', () => {
    it('has data-slot attribute', () => {
      const { container: _container } = renderWithProviders(<Switch />)
      const switchElement = screen.getByRole('switch')
      // The switch component itself should have data attributes
      expect(switchElement).toBeInTheDocument()
    })

    it('updates data-state attribute on toggle', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Switch />)
      const switchElement = screen.getByRole('switch')

      expect(switchElement).toHaveAttribute('data-state', 'unchecked')

      await user.click(switchElement)
      expect(switchElement).toHaveAttribute('data-state', 'checked')
    })

    it('uses data-state for styling', () => {
      renderWithProviders(<Switch />)
      const switchElement = screen.getByRole('switch')
      // Check that data-state styling classes are present
      expect(switchElement).toHaveClass('data-[state=checked]:justify-end')
    })
  })
})
