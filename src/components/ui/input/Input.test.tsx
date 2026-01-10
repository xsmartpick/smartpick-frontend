import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'

import {
  renderWithProviders,
  screen,
  userEvent,
} from '../../../../test/utils/render'
import { Input } from './Input'

describe('Input', () => {
  describe('Rendering', () => {
    it('renders text input correctly', () => {
      renderWithProviders(<Input placeholder="Enter text" />)
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('renders input element', () => {
      const { container } = renderWithProviders(<Input />)
      const input = container.querySelector('input')
      expect(input).toBeInTheDocument()
    })

    it('renders different input types', () => {
      const types = ['email', 'number', 'tel', 'url'] as const

      types.forEach((type) => {
        const { unmount } = renderWithProviders(<Input type={type} />)
        const input = document.querySelector(`input[type="${type}"]`)
        expect(input).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('Password Input', () => {
    it('renders password input with visibility toggle button', () => {
      const { container } = renderWithProviders(<Input type="password" />)

      const input = container.querySelector('input[type="password"]')
      expect(input).toBeInTheDocument()

      const toggleButton = screen.getByRole('button', {
        name: /change password visibility/i,
      })
      expect(toggleButton).toBeInTheDocument()
    })

    it('toggles password visibility when button is clicked', async () => {
      const user = userEvent.setup()
      const { container } = renderWithProviders(<Input type="password" />)

      const input = container.querySelector('input') as HTMLInputElement
      const toggleButton = screen.getByRole('button', {
        name: /change password visibility/i,
      })

      // Initially password type
      expect(input).toHaveAttribute('type', 'password')
      expect(screen.getByText('Show password')).toBeInTheDocument()

      // Click to show password
      await user.click(toggleButton)
      expect(input).toHaveAttribute('type', 'text')
      expect(screen.getByText('Hide password')).toBeInTheDocument()

      // Click to hide password again
      await user.click(toggleButton)
      expect(input).toHaveAttribute('type', 'password')
      expect(screen.getByText('Show password')).toBeInTheDocument()
    })

    it('shows eye icon when password is hidden', () => {
      const { container } = renderWithProviders(<Input type="password" />)
      const eyeIcon = container.querySelector('[aria-hidden="true"]')
      expect(eyeIcon).toBeInTheDocument()
    })

    it('applies correct padding for password toggle button', () => {
      const { container } = renderWithProviders(<Input type="password" />)
      const input = container.querySelector('input')
      expect(input).toHaveClass('pr-10')
    })
  })

  describe('Search Input', () => {
    it('renders search icon for search type', () => {
      const { container } = renderWithProviders(<Input type="search" />)
      const searchIcon = container.querySelector('[aria-hidden="true"]')
      expect(searchIcon).toBeInTheDocument()
    })

    it('applies correct padding for search icon', () => {
      renderWithProviders(<Input type="search" />)
      const input = screen.getByRole('searchbox')
      expect(input).toHaveClass('pl-8')
    })

    it('search icon is not interactive', () => {
      const { container } = renderWithProviders(<Input type="search" />)
      const iconWrapper = container.querySelector('.pointer-events-none')
      expect(iconWrapper).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('applies error styling when hasError is true', () => {
      renderWithProviders(<Input hasError />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('ring-2', 'ring-red/20', 'border-red')
    })

    it('does not apply error styling by default', () => {
      renderWithProviders(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).not.toHaveClass('ring-red/20')
    })
  })

  describe('Number Input Stepper', () => {
    it('shows stepper by default for number inputs', () => {
      renderWithProviders(<Input type="number" />)
      const input = screen.getByRole('spinbutton')
      expect(input).not.toHaveClass('[appearance:textfield]')
    })

    it('hides stepper when enableStepper is false', () => {
      renderWithProviders(<Input type="number" enableStepper={false} />)
      const input = screen.getByRole('spinbutton')
      expect(input).toHaveClass('[appearance:textfield]')
    })
  })

  describe('Disabled State', () => {
    it('disables input when disabled prop is true', () => {
      renderWithProviders(<Input disabled />)
      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
    })

    it('applies disabled styling', () => {
      renderWithProviders(<Input disabled />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('disabled:border-border')
      expect(input).toHaveClass('disabled:bg-disabled-control')
    })
  })

  describe('User Interactions', () => {
    it('calls onChange when typing', async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()

      renderWithProviders(<Input onChange={handleChange} />)
      const input = screen.getByRole('textbox')

      await user.type(input, 'test')
      expect(handleChange).toHaveBeenCalled()
      expect(input).toHaveValue('test')
    })

    it('updates value on input change', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Input />)

      const input = screen.getByRole('textbox')
      await user.type(input, 'Hello World')

      expect(input).toHaveValue('Hello World')
    })

    it('does not call onChange when disabled', async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()

      renderWithProviders(<Input onChange={handleChange} disabled />)
      const input = screen.getByRole('textbox')

      await user.type(input, 'test')
      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  describe('Placeholder', () => {
    it('displays placeholder text', () => {
      renderWithProviders(<Input placeholder="Enter your email" />)
      expect(
        screen.getByPlaceholderText('Enter your email'),
      ).toBeInTheDocument()
    })

    it('hides placeholder when input has value', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Input placeholder="Type here" />)

      const input = screen.getByPlaceholderText('Type here')
      await user.type(input, 'Some text')

      expect(input).toHaveValue('Some text')
    })
  })

  describe('Custom className', () => {
    it('applies custom wrapper className', () => {
      const { container } = renderWithProviders(
        <Input className="custom-wrapper-class" />,
      )
      const wrapper = container.querySelector('.custom-wrapper-class')
      expect(wrapper).toBeInTheDocument()
    })

    it('applies custom input className', () => {
      renderWithProviders(<Input inputClassName="custom-input-class" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('custom-input-class')
    })

    it('merges custom className with default classes', () => {
      renderWithProviders(<Input inputClassName="custom-class" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('custom-class')
      expect(input).toHaveClass('rounded-md') // Default class
    })
  })

  describe('Accessibility', () => {
    it('has correct ARIA label for password toggle', () => {
      renderWithProviders(<Input type="password" />)
      const toggleButton = screen.getByRole('button', {
        name: /change password visibility/i,
      })
      expect(toggleButton).toHaveAttribute(
        'aria-label',
        'Change password visibility',
      )
    })

    it('shows screen reader text for password visibility state', () => {
      renderWithProviders(<Input type="password" />)
      expect(screen.getByText('Show password')).toHaveClass('sr-only')
    })

    it('marks icons as aria-hidden', () => {
      const { container } = renderWithProviders(<Input type="search" />)
      const icon = container.querySelector('[aria-hidden="true"]')
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Controlled vs Uncontrolled', () => {
    it('works as uncontrolled component', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Input defaultValue="initial" />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('initial')

      await user.clear(input)
      await user.type(input, 'new value')
      expect(input).toHaveValue('new value')
    })

    it('works as controlled component', async () => {
      const ControlledInput = () => {
        const [value, setValue] = React.useState('controlled')
        return (
          <Input value={value} onChange={(e) => setValue(e.target.value)} />
        )
      }

      const user = userEvent.setup()
      renderWithProviders(<ControlledInput />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('controlled')

      await user.clear(input)
      await user.type(input, 'updated')
      expect(input).toHaveValue('updated')
    })
  })
})
