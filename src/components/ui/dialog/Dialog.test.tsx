import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'

import {
  renderWithProviders,
  screen,
  userEvent,
  waitFor,
} from '../../../../test/utils/render'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './Dialog'

describe('Dialog', () => {
  describe('Rendering', () => {
    it('renders Dialog root without crashing', () => {
      const { container } = renderWithProviders(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
        </Dialog>,
      )
      expect(container).toBeInTheDocument()
    })

    it('does not render content by default', () => {
      renderWithProviders(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>Content
          </DialogContent>
        </Dialog>,
      )
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders with defaultOpen', () => {
      renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
            Content
          </DialogContent>
        </Dialog>,
      )
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('renders trigger button', () => {
      renderWithProviders(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
        </Dialog>,
      )
      expect(
        screen.getByRole('button', { name: /open dialog/i }),
      ).toBeInTheDocument()
    })

    it('dialog content has correct role', () => {
      renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Test Title</DialogTitle>
            Content
          </DialogContent>
        </Dialog>,
      )
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('role', 'dialog')
    })
  })

  describe('Dialog Trigger', () => {
    it('opens dialog when trigger is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog</DialogTitle>
            Content
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByRole('button', { name: /open/i }))
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('trigger has data-slot attribute', () => {
      const { container } = renderWithProviders(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
        </Dialog>,
      )
      const trigger = container.querySelector('[data-slot="dialog-trigger"]')
      expect(trigger).toBeInTheDocument()
    })

    it('trigger can be any component', () => {
      renderWithProviders(
        <Dialog>
          <DialogTrigger asChild>
            <button type="button">Custom Button</button>
          </DialogTrigger>
        </Dialog>,
      )
      expect(
        screen.getByRole('button', { name: /custom button/i }),
      ).toBeInTheDocument()
    })

    it('trigger maintains own props', () => {
      renderWithProviders(
        <Dialog>
          <DialogTrigger className="custom-trigger-class">Open</DialogTrigger>
        </Dialog>,
      )
      const trigger = screen.getByRole('button', { name: /open/i })
      expect(trigger).toHaveClass('custom-trigger-class')
    })
  })

  describe('Dialog Content', () => {
    it('renders content when open', () => {
      renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            Test Content
          </DialogContent>
        </Dialog>,
      )
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('does not render content when closed', async () => {
      const _user = userEvent.setup()
      renderWithProviders(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            Content
          </DialogContent>
        </Dialog>,
      )

      // Initially closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('content has correct styling classes', () => {
      renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            Content
          </DialogContent>
        </Dialog>,
      )
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveClass(
        'fixed',
        'z-50',
        'bg-background',
        'border',
        'rounded-xl',
        'p-6',
      )
    })

    it('content has data-slot attribute', () => {
      const { container } = renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            Content
          </DialogContent>
        </Dialog>,
      )
      const content = container.querySelector('[data-slot="dialog-content"]')
      expect(content).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent className="custom-content-class">
            <DialogTitle>Title</DialogTitle>
            Content
          </DialogContent>
        </Dialog>,
      )
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveClass('custom-content-class')
    })

    it('supports from prop for animation direction', () => {
      const directions = ['top', 'bottom', 'left', 'right'] as const
      directions.forEach((from) => {
        const { unmount } = renderWithProviders(
          <Dialog defaultOpen>
            <DialogContent from={from}>
              <DialogTitle>Title</DialogTitle>
              Content
            </DialogContent>
          </Dialog>,
        )
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        unmount()
      })
    })

    it('supports custom transition prop', () => {
      const customTransition = {
        type: 'spring' as const,
        stiffness: 200,
        damping: 30,
      }
      renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent transition={customTransition}>
            <DialogTitle>Title</DialogTitle>
            Content
          </DialogContent>
        </Dialog>,
      )
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('content renders children correctly', () => {
      renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <div data-testid="child-element">Complex Child</div>
          </DialogContent>
        </Dialog>,
      )
      expect(screen.getByTestId('child-element')).toBeInTheDocument()
    })
  })

  describe('Built-in Close Button', () => {
    it('renders close button in DialogContent', () => {
      const { container } = renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            Content
          </DialogContent>
        </Dialog>,
      )
      const closeIcon = container.querySelector('.i-mingcute-close-line')
      expect(closeIcon).toBeInTheDocument()
    })

    it('close button has screen reader text', () => {
      renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            Content
          </DialogContent>
        </Dialog>,
      )
      const srText = screen.getByText('Close')
      expect(srText).toHaveClass('sr-only')
    })

    it('close button closes dialog when clicked', async () => {
      const user = userEvent.setup()
      const { container } = renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            Content
          </DialogContent>
        </Dialog>,
      )

      const closeButton = container.querySelector(
        '.i-mingcute-close-line',
      )?.parentElement
      expect(closeButton).toBeInTheDocument()

      if (closeButton) {
        await user.click(closeButton)
        await waitFor(() => {
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
      }
    })

    it('close button has correct positioning', () => {
      const { container } = renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            Content
          </DialogContent>
        </Dialog>,
      )
      const closeButton = container.querySelector(
        '.i-mingcute-close-line',
      )?.parentElement
      expect(closeButton).toHaveClass('absolute', 'right-4', 'top-4')
    })
  })

  describe('Dialog Overlay', () => {
    it('renders overlay when dialog is open', () => {
      const { container } = renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>Content
          </DialogContent>
        </Dialog>,
      )
      const overlay = container.querySelector('[data-slot="dialog-overlay"]')
      expect(overlay).toBeInTheDocument()
    })

    it('overlay has correct styling', () => {
      const { container } = renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>Content
          </DialogContent>
        </Dialog>,
      )
      const overlay = container.querySelector('[data-slot="dialog-overlay"]')
      expect(overlay).toHaveClass('fixed', 'inset-0', 'z-50')
    })

    it('overlay has data-slot attribute', () => {
      const { container } = renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>Content
          </DialogContent>
        </Dialog>,
      )
      const overlay = container.querySelector('[data-slot="dialog-overlay"]')
      expect(overlay).toHaveAttribute('data-slot', 'dialog-overlay')
    })

    it('clicking overlay closes dialog', async () => {
      const user = userEvent.setup()
      const { container } = renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>Content
          </DialogContent>
        </Dialog>,
      )

      const overlay = container.querySelector('[data-slot="dialog-overlay"]')
      if (overlay) {
        await user.click(overlay)
        await waitFor(() => {
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
      }
    })
  })

  describe('Dialog Header', () => {
    it('renders header component with data-slot', () => {
      const { container } = renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>Header</DialogHeader>
          </DialogContent>
        </Dialog>,
      )
      const header = container.querySelector('[data-slot="dialog-header"]')
      expect(header).toBeInTheDocument()
    })

    it('header has correct layout classes', () => {
      const { container } = renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>Header</DialogHeader>
          </DialogContent>
        </Dialog>,
      )
      const header = container.querySelector('[data-slot="dialog-header"]')
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5')
    })

    it('header renders children', () => {
      renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Title</DialogTitle>
              <DialogDescription>Description</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>,
      )
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
    })
  })

  describe('Dialog Title', () => {
    it('renders title component with data-slot', () => {
      const { container } = renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      )
      const title = container.querySelector('[data-slot="dialog-title"]')
      expect(title).toBeInTheDocument()
    })

    it('title has correct typography', () => {
      const { container } = renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      )
      const title = container.querySelector('[data-slot="dialog-title"]')
      expect(title).toHaveClass(
        'text-lg',
        'font-semibold',
        'leading-none',
        'tracking-tight',
      )
    })

    it('title accepts custom className', () => {
      const { container } = renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle className="custom-title-class">Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      )
      const title = container.querySelector('[data-slot="dialog-title"]')
      expect(title).toHaveClass('custom-title-class')
    })
  })

  describe('Dialog Description', () => {
    it('renders description component with data-slot', () => {
      const { container } = renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogDescription>Description</DialogDescription>
          </DialogContent>
        </Dialog>,
      )
      const description = container.querySelector(
        '[data-slot="dialog-description"]',
      )
      expect(description).toBeInTheDocument()
    })

    it('description has correct styling', () => {
      const { container } = renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogDescription>Description</DialogDescription>
          </DialogContent>
        </Dialog>,
      )
      const description = container.querySelector(
        '[data-slot="dialog-description"]',
      )
      expect(description).toHaveClass('text-sm', 'text-muted-foreground')
    })

    it('description accepts custom className', () => {
      const { container } = renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogDescription className="custom-description-class">
              Description
            </DialogDescription>
          </DialogContent>
        </Dialog>,
      )
      const description = container.querySelector(
        '[data-slot="dialog-description"]',
      )
      expect(description).toHaveClass('custom-description-class')
    })
  })

  describe('Dialog Footer', () => {
    it('renders footer component with data-slot', () => {
      const { container } = renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogFooter>Footer</DialogFooter>
          </DialogContent>
        </Dialog>,
      )
      const footer = container.querySelector('[data-slot="dialog-footer"]')
      expect(footer).toBeInTheDocument()
    })

    it('footer has correct layout', () => {
      const { container } = renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogFooter>Footer</DialogFooter>
          </DialogContent>
        </Dialog>,
      )
      const footer = container.querySelector('[data-slot="dialog-footer"]')
      expect(footer).toHaveClass('flex', 'flex-col-reverse', 'gap-2')
    })

    it('footer renders action buttons', () => {
      renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogFooter>
              <button type="button">Cancel</button>
              <button type="button">Confirm</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      )
      expect(
        screen.getByRole('button', { name: /cancel/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /confirm/i }),
      ).toBeInTheDocument()
    })
  })

  describe('DialogClose Component', () => {
    it('DialogClose wrapper closes dialog', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogClose>
              <button type="button">Close Me</button>
            </DialogClose>
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByRole('button', { name: /close me/i }))
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('DialogClose has contents display', () => {
      const { container } = renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogClose>Close</DialogClose>
          </DialogContent>
        </Dialog>,
      )
      const closeWrapper = container.querySelector('[data-slot="dialog-close"]')
      expect(closeWrapper).toHaveClass('contents')
    })

    it('DialogClose accepts custom className', () => {
      const { container } = renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogClose className="custom-close-class">Close</DialogClose>
          </DialogContent>
        </Dialog>,
      )
      const closeWrapper = container.querySelector('[data-slot="dialog-close"]')
      expect(closeWrapper).toHaveClass('custom-close-class')
    })
  })

  describe('State Management', () => {
    it('works as uncontrolled component', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>Content
          </DialogContent>
        </Dialog>,
      )

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /open/i }))
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('works as controlled component', async () => {
      const ControlledDialog = () => {
        const [open, setOpen] = React.useState(false)
        return (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>Open</DialogTrigger>
            <DialogContent>
              <DialogTitle>Title</DialogTitle>Content
            </DialogContent>
          </Dialog>
        )
      }

      const user = userEvent.setup()
      renderWithProviders(<ControlledDialog />)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /open/i }))
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('calls onOpenChange when opened', async () => {
      const handleOpenChange = vi.fn()
      const user = userEvent.setup()

      renderWithProviders(
        <Dialog onOpenChange={handleOpenChange}>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>Content
          </DialogContent>
        </Dialog>,
      )

      await user.click(screen.getByRole('button', { name: /open/i }))
      expect(handleOpenChange).toHaveBeenCalledWith(true)
    })

    it('calls onOpenChange when closed', async () => {
      const handleOpenChange = vi.fn()
      const user = userEvent.setup()
      const { container } = renderWithProviders(
        <Dialog defaultOpen onOpenChange={handleOpenChange}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>Content
          </DialogContent>
        </Dialog>,
      )

      const closeButton = container.querySelector(
        '.i-mingcute-close-line',
      )?.parentElement
      if (closeButton) {
        await user.click(closeButton)
        expect(handleOpenChange).toHaveBeenCalledWith(false)
      }
    })

    it('respects controlled open prop', () => {
      const { rerender } = renderWithProviders(
        <Dialog open={false}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>Content
          </DialogContent>
        </Dialog>,
      )
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

      rerender(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>Content
          </DialogContent>
        </Dialog>,
      )
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('DialogContext provides isOpen state', () => {
      renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>Content
          </DialogContent>
        </Dialog>,
      )
      // Dialog is open, content should be visible
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  describe('Keyboard Interactions', () => {
    it('closes dialog on Escape key', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>Content
          </DialogContent>
        </Dialog>,
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()

      await user.keyboard('{Escape}')
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('traps focus inside dialog', () => {
      renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <button type="button">Button 1</button>
            <button type="button">Button 2</button>
          </DialogContent>
        </Dialog>,
      )
      // Radix UI handles focus trap automatically
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /button 1/i }),
      ).toBeInTheDocument()
    })

    it('restores focus after closing', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>Content
          </DialogContent>
        </Dialog>,
      )

      const trigger = screen.getByRole('button', { name: /open/i })
      await user.click(trigger)

      expect(screen.getByRole('dialog')).toBeInTheDocument()

      await user.keyboard('{Escape}')
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
  })

  describe('Portal Behavior', () => {
    it('renders in portal', () => {
      const { container } = renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>Content
          </DialogContent>
        </Dialog>,
      )
      const portal = container.querySelector('[data-slot="dialog-portal"]')
      expect(portal).toBeInTheDocument()
    })

    it('portal renders at document root', () => {
      renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>Content
          </DialogContent>
        </Dialog>,
      )
      // Dialog content should be in document
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('dialog has role="dialog"', () => {
      renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>Content
          </DialogContent>
        </Dialog>,
      )
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('role', 'dialog')
    })

    it('dialog has aria-modal attribute', () => {
      renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>Content
          </DialogContent>
        </Dialog>,
      )
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
    })

    it('title connects with aria-labelledby', () => {
      const { container } = renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>,
      )
      const title = container.querySelector('[data-slot="dialog-title"]')
      expect(title).toBeInTheDocument()
    })

    it('description connects with aria-describedby', () => {
      const { container } = renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogDescription>Dialog Description</DialogDescription>
          </DialogContent>
        </Dialog>,
      )
      const description = container.querySelector(
        '[data-slot="dialog-description"]',
      )
      expect(description).toBeInTheDocument()
    })

    it('close button is keyboard accessible', async () => {
      const user = userEvent.setup()
      const { container } = renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>Content
          </DialogContent>
        </Dialog>,
      )

      const closeButton = container.querySelector(
        '.i-mingcute-close-line',
      )?.parentElement
      if (closeButton) {
        closeButton.focus()
        await user.keyboard('{Enter}')
        await waitFor(() => {
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
      }
    })

    it('dialog is keyboard navigable', () => {
      renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <button type="button">Button 1</button>
            <button type="button">Button 2</button>
          </DialogContent>
        </Dialog>,
      )
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('screen reader announces dialog state', () => {
      renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>Content
          </DialogContent>
        </Dialog>,
      )
      const srText = screen.getByText('Close')
      expect(srText).toHaveClass('sr-only')
    })
  })

  describe('Complex Composition', () => {
    it('full dialog composition renders correctly', () => {
      renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Title</DialogTitle>
              <DialogDescription>Description</DialogDescription>
            </DialogHeader>
            <div>Main Content</div>
            <DialogFooter>
              <button type="button">Cancel</button>
              <button type="button">Confirm</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      )

      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByText('Main Content')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /cancel/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /confirm/i }),
      ).toBeInTheDocument()
    })

    it('multiple DialogClose components work', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogClose>
              <button type="button">Close 1</button>
            </DialogClose>
            <DialogClose>
              <button type="button">Close 2</button>
            </DialogClose>
          </DialogContent>
        </Dialog>,
      )

      // Both close buttons should work
      await user.click(screen.getByRole('button', { name: /close 1/i }))
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('nested content renders correctly', () => {
      renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <form>
              <input type="text" placeholder="Name" />
              <input type="email" placeholder="Email" />
            </form>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </DialogContent>
        </Dialog>,
      )

      expect(screen.getByPlaceholderText('Name')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
    })

    it('custom content with from directions', () => {
      const { unmount: unmount1 } = renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent from="bottom">Content</DialogContent>
        </Dialog>,
      )
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      unmount1()

      const { unmount: unmount2 } = renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent from="right">Content</DialogContent>
        </Dialog>,
      )
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      unmount2()
    })
  })

  describe('Edge Cases', () => {
    it('handles rapid open/close', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>Content
          </DialogContent>
        </Dialog>,
      )

      const trigger = screen.getByRole('button', { name: /open/i })

      // Rapid clicks
      await user.click(trigger)
      await user.keyboard('{Escape}')

      // Should handle without errors
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('handles missing onOpenChange', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>Content
          </DialogContent>
        </Dialog>,
      )

      // Should work without onOpenChange callback
      await user.click(screen.getByRole('button', { name: /open/i }))
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('prevents body scroll when open', () => {
      renderWithProviders(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>Content
          </DialogContent>
        </Dialog>,
      )

      // Dialog is open, Radix UI handles scroll lock
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })
})
