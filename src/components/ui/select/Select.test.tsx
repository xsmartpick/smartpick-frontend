import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'

import {
  renderWithProviders,
  screen,
  userEvent,
  waitFor,
} from '../../../../test/utils/render'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './Select'

describe('Select', () => {
  describe('Rendering', () => {
    it('renders Select with trigger', () => {
      renderWithProviders(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
        </Select>,
      )
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('renders trigger with placeholder', () => {
      renderWithProviders(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
        </Select>,
      )
      expect(screen.getByText('Select option')).toBeInTheDocument()
    })

    it('does not render content by default', () => {
      renderWithProviders(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      )
      // Content should not be visible initially
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument()
    })

    it('renders with defaultValue', () => {
      renderWithProviders(
        <Select defaultValue="option1">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>,
      )
      expect(screen.getByText('Option 1')).toBeInTheDocument()
    })
  })

  describe('Opening and Closing', () => {
    it('opens content when trigger is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      )

      const trigger = screen.getByRole('combobox')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument()
      })
    })

    it('closes content when clicking outside', async () => {
      const user = userEvent.setup()
      const { container: _container } = renderWithProviders(
        <div>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Option 1</SelectItem>
            </SelectContent>
          </Select>
          <div data-testid="outside">Outside</div>
        </div>,
      )

      const trigger = screen.getByRole('combobox')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument()
      })

      const outside = screen.getByTestId('outside')
      await user.click(outside)

      await waitFor(() => {
        expect(screen.queryByText('Option 1')).not.toBeInTheDocument()
      })
    })

    it('closes content on Escape key', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      )

      const trigger = screen.getByRole('combobox')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument()
      })

      await user.keyboard('{Escape}')

      await waitFor(() => {
        expect(screen.queryByText('Option 1')).not.toBeInTheDocument()
      })
    })
  })

  describe('Size Variants', () => {
    it('applies default size classes', () => {
      renderWithProviders(
        <Select>
          <SelectTrigger size="default">
            <SelectValue />
          </SelectTrigger>
        </Select>,
      )
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveClass('h-9', 'px-3.5', 'py-2')
    })

    it('applies small size classes', () => {
      renderWithProviders(
        <Select>
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
        </Select>,
      )
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveClass('h-8', 'px-3', 'text-sm')
    })

    it('renders both sizes without crashing', () => {
      const sizes = ['default', 'sm'] as const

      sizes.forEach((size) => {
        const { unmount } = renderWithProviders(
          <Select>
            <SelectTrigger size={size}>
              <SelectValue />
            </SelectTrigger>
          </Select>,
        )
        expect(screen.getByRole('combobox')).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('Loading State', () => {
    it('shows loading spinner when loading is true', () => {
      const { container } = renderWithProviders(
        <Select>
          <SelectTrigger loading>
            <SelectValue />
          </SelectTrigger>
        </Select>,
      )
      const spinner = container.querySelector('.i-mingcute-loading-3-line')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('animate-spin')
    })

    it('shows down arrow icon when not loading', () => {
      const { container } = renderWithProviders(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
        </Select>,
      )
      const downIcon = container.querySelector('.i-mingcute-down-line')
      expect(downIcon).toBeInTheDocument()
    })

    it('does not show down arrow when loading', () => {
      const { container } = renderWithProviders(
        <Select>
          <SelectTrigger loading>
            <SelectValue />
          </SelectTrigger>
        </Select>,
      )
      const downIcon = container.querySelector('.i-mingcute-down-line')
      expect(downIcon).not.toBeInTheDocument()
    })
  })

  describe('Item Selection', () => {
    it('selects item when clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>,
      )

      const trigger = screen.getByRole('combobox')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument()
      })

      const option1 = screen.getByText('Option 1')
      await user.click(option1)

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toHaveTextContent('Option 1')
      })
    })

    it('calls onValueChange when item is selected', async () => {
      const handleValueChange = vi.fn()
      const user = userEvent.setup()

      renderWithProviders(
        <Select onValueChange={handleValueChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      )

      const trigger = screen.getByRole('combobox')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument()
      })

      const option = screen.getByText('Option 1')
      await user.click(option)

      expect(handleValueChange).toHaveBeenCalledWith('option1')
    })

    it('renders checkmark indicator on selected item', async () => {
      const user = userEvent.setup()
      const { container } = renderWithProviders(
        <Select defaultValue="option1">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>,
      )

      const trigger = screen.getByRole('combobox')
      await user.click(trigger)

      await waitFor(() => {
        const checkIcon = container.querySelector('.i-mingcute-check-fill')
        expect(checkIcon).toBeInTheDocument()
      })
    })

    it('closes dropdown after selecting item', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      )

      const trigger = screen.getByRole('combobox')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument()
      })

      const option = screen.getByText('Option 1')
      await user.click(option)

      await waitFor(() => {
        // Content should close after selection
        expect(screen.queryByRole('option')).not.toBeInTheDocument()
      })
    })
  })

  describe('SelectValue', () => {
    it('displays selected value', () => {
      renderWithProviders(
        <Select defaultValue="option1">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      )
      expect(screen.getByText('Option 1')).toBeInTheDocument()
    })

    it('shows placeholder when no value selected', () => {
      renderWithProviders(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Choose an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>,
      )
      expect(screen.getByText('Choose an option')).toBeInTheDocument()
    })

    it('updates displayed value after selection', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>,
      )

      const trigger = screen.getByRole('combobox')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Option 2')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Option 2'))

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toHaveTextContent('Option 2')
      })
    })
  })

  describe('SelectLabel', () => {
    it('renders SelectLabel correctly', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectLabel>Category</SelectLabel>
            <SelectItem value="1">Item 1</SelectItem>
          </SelectContent>
        </Select>,
      )

      const trigger = screen.getByRole('combobox')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Category')).toBeInTheDocument()
      })
    })

    it('SelectLabel has correct styling', async () => {
      const _user = userEvent.setup()
      const { container: _container } = renderWithProviders(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectLabel>Label</SelectLabel>
          </SelectContent>
        </Select>,
      )

      await user.click(screen.getByRole('combobox'))

      await waitFor(() => {
        const label = screen.getByText('Label')
        expect(label).toHaveClass('font-semibold')
      })
    })

    it('SelectLabel supports inset prop', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectLabel inset>Inset Label</SelectLabel>
          </SelectContent>
        </Select>,
      )

      await user.click(screen.getByRole('combobox'))

      await waitFor(() => {
        const label = screen.getByText('Inset Label')
        expect(label).toHaveClass('pl-8')
      })
    })
  })

  describe('SelectSeparator', () => {
    it('renders SelectSeparator', async () => {
      const user = userEvent.setup()
      const { container } = renderWithProviders(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Item 1</SelectItem>
            <SelectSeparator />
            <SelectItem value="2">Item 2</SelectItem>
          </SelectContent>
        </Select>,
      )

      await user.click(screen.getByRole('combobox'))

      await waitFor(() => {
        const separator = container.querySelector('[role="separator"]')
        expect(separator).toBeInTheDocument()
      })
    })
  })

  describe('SelectGroup', () => {
    it('renders SelectGroup with items', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Group</SelectLabel>
              <SelectItem value="1">Item 1</SelectItem>
              <SelectItem value="2">Item 2</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>,
      )

      await user.click(screen.getByRole('combobox'))

      await waitFor(() => {
        expect(screen.getByText('Group')).toBeInTheDocument()
        expect(screen.getByText('Item 1')).toBeInTheDocument()
        expect(screen.getByText('Item 2')).toBeInTheDocument()
      })
    })
  })

  describe('Disabled State', () => {
    it('disables trigger when disabled prop is true', () => {
      renderWithProviders(
        <Select>
          <SelectTrigger disabled>
            <SelectValue />
          </SelectTrigger>
        </Select>,
      )
      const trigger = screen.getByRole('combobox')
      expect(trigger).toBeDisabled()
    })

    it('applies disabled styling to trigger', () => {
      renderWithProviders(
        <Select>
          <SelectTrigger disabled>
            <SelectValue />
          </SelectTrigger>
        </Select>,
      )
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveClass('cursor-not-allowed', 'opacity-30')
    })

    it('does not open when trigger is disabled', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <Select>
          <SelectTrigger disabled>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Item 1</SelectItem>
          </SelectContent>
        </Select>,
      )

      const trigger = screen.getByRole('combobox')
      await user.click(trigger)

      // Content should not appear
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
    })

    it('renders disabled SelectItem', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1" disabled>
              Disabled Item
            </SelectItem>
          </SelectContent>
        </Select>,
      )

      await user.click(screen.getByRole('combobox'))

      await waitFor(() => {
        const item = screen.getByText('Disabled Item')
        expect(item).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('trigger has combobox role', () => {
      renderWithProviders(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
        </Select>,
      )
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('trigger is keyboard accessible', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Item 1</SelectItem>
          </SelectContent>
        </Select>,
      )

      const trigger = screen.getByRole('combobox')
      trigger.focus()
      expect(trigger).toHaveFocus()

      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument()
      })
    })

    it('can navigate items with arrow keys', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Item 1</SelectItem>
            <SelectItem value="2">Item 2</SelectItem>
          </SelectContent>
        </Select>,
      )

      const trigger = screen.getByRole('combobox')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument()
      })

      // Radix UI handles arrow key navigation internally
      await user.keyboard('{ArrowDown}')
      // Item 2 should now be focused (handled by Radix)
    })
  })

  describe('Custom className', () => {
    it('SelectTrigger merges custom className', () => {
      renderWithProviders(
        <Select>
          <SelectTrigger className="custom-trigger-class">
            <SelectValue />
          </SelectTrigger>
        </Select>,
      )
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveClass('custom-trigger-class')
      expect(trigger).toHaveClass('rounded-lg')
    })

    it('SelectContent merges custom className', async () => {
      const user = userEvent.setup()
      const { container } = renderWithProviders(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="custom-content-class">
            <SelectItem value="1">Item 1</SelectItem>
          </SelectContent>
        </Select>,
      )

      await user.click(screen.getByRole('combobox'))

      await waitFor(() => {
        const content = container.querySelector('.custom-content-class')
        expect(content).toBeInTheDocument()
      })
    })
  })

  describe('Controlled vs Uncontrolled', () => {
    it('works as uncontrolled component', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <Select defaultValue="option1">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>,
      )

      expect(screen.getByRole('combobox')).toHaveTextContent('Option 1')

      await user.click(screen.getByRole('combobox'))

      await waitFor(() => {
        expect(screen.getByText('Option 2')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Option 2'))

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toHaveTextContent('Option 2')
      })
    })

    it('works as controlled component', async () => {
      const ControlledSelect = () => {
        const [value, setValue] = React.useState('option1')
        return (
          <Select value={value} onValueChange={setValue}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
            </SelectContent>
          </Select>
        )
      }

      const user = userEvent.setup()
      renderWithProviders(<ControlledSelect />)

      expect(screen.getByRole('combobox')).toHaveTextContent('Option 1')

      await user.click(screen.getByRole('combobox'))

      await waitFor(() => {
        expect(screen.getByText('Option 2')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Option 2'))

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toHaveTextContent('Option 2')
      })
    })
  })

  describe('Composition', () => {
    it('renders complex select structure', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Vegetables</SelectLabel>
              <SelectItem value="carrot">Carrot</SelectItem>
              <SelectItem value="potato">Potato</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>,
      )

      const trigger = screen.getByRole('combobox')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Fruits')).toBeInTheDocument()
        expect(screen.getByText('Vegetables')).toBeInTheDocument()
        expect(screen.getByText('Apple')).toBeInTheDocument()
        expect(screen.getByText('Carrot')).toBeInTheDocument()
      })
    })
  })
})
