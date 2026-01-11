import * as React from 'react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders, screen } from '../../../../test/utils/render'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './Table'

describe('Table', () => {
  describe('Rendering', () => {
    it('renders table correctly', () => {
      const { container } = renderWithProviders(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      )
      const table = container.querySelector('table')
      expect(table).toBeInTheDocument()
    })

    it('renders table container wrapper', () => {
      const { container } = renderWithProviders(<Table />)
      const tableContainer = container.querySelector(
        '[data-slot="table-container"]',
      )
      expect(tableContainer).toBeInTheDocument()
    })

    it('renders TableHeader correctly', () => {
      const { container } = renderWithProviders(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>,
      )
      const thead = container.querySelector('thead')
      expect(thead).toBeInTheDocument()
    })

    it('renders TableBody correctly', () => {
      const { container } = renderWithProviders(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      )
      const tbody = container.querySelector('tbody')
      expect(tbody).toBeInTheDocument()
    })

    it('renders TableFooter correctly', () => {
      const { container } = renderWithProviders(
        <Table>
          <TableFooter>
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </Table>,
      )
      const tfoot = container.querySelector('tfoot')
      expect(tfoot).toBeInTheDocument()
    })

    it('renders TableCaption correctly', () => {
      renderWithProviders(
        <Table>
          <TableCaption>Table Caption</TableCaption>
        </Table>,
      )
      expect(screen.getByText('Table Caption')).toBeInTheDocument()
    })
  })

  describe('Table Variants', () => {
    it('applies default variant styling', () => {
      const { container } = renderWithProviders(<Table variant="default" />)
      const table = container.querySelector('table')
      expect(table).toBeInTheDocument()
    })

    it('applies striped variant styling', () => {
      const { container } = renderWithProviders(<Table variant="striped" />)
      const table = container.querySelector('table')
      expect(table).toHaveClass('[&_tbody_tr:nth-child(even)]:bg-fill')
    })

    it('applies bordered variant styling', () => {
      const { container } = renderWithProviders(<Table variant="bordered" />)
      const table = container.querySelector('table')
      expect(table).toHaveClass('border', 'border-border')
    })

    it('applies hover variant styling', () => {
      const { container } = renderWithProviders(<Table variant="hover" />)
      const table = container.querySelector('table')
      expect(table).toHaveClass('[&_tbody_tr]:hover:bg-fill')
    })

    it('renders all variants without crashing', () => {
      const variants = ['default', 'striped', 'bordered', 'hover'] as const

      variants.forEach((variant) => {
        const { container, unmount } = renderWithProviders(
          <Table variant={variant} />,
        )
        const table = container.querySelector('table')
        expect(table).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('Size Variants', () => {
    it('applies small size classes', () => {
      const { container } = renderWithProviders(<Table size="sm" />)
      const table = container.querySelector('table')
      expect(table).toHaveClass('text-xs')
    })

    it('applies medium size classes by default', () => {
      const { container } = renderWithProviders(<Table />)
      const table = container.querySelector('table')
      expect(table).toHaveClass('text-sm')
    })

    it('applies large size classes', () => {
      const { container } = renderWithProviders(<Table size="lg" />)
      const table = container.querySelector('table')
      expect(table).toHaveClass('text-base')
    })

    it('renders all sizes without crashing', () => {
      const sizes = ['sm', 'md', 'lg'] as const

      sizes.forEach((size) => {
        const { container, unmount } = renderWithProviders(
          <Table size={size} />,
        )
        const table = container.querySelector('table')
        expect(table).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('TableRow Variants', () => {
    it('applies default row variant styling', () => {
      const { container } = renderWithProviders(
        <Table>
          <TableBody>
            <TableRow variant="default">
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      )
      const row = container.querySelector('tr')
      expect(row).toHaveClass('border-b', 'border-border')
    })

    it('applies hover row variant styling', () => {
      const { container } = renderWithProviders(
        <Table>
          <TableBody>
            <TableRow variant="hover">
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      )
      const row = container.querySelector('tr')
      expect(row).toHaveClass('hover:bg-fill', 'cursor-pointer')
    })

    it('applies clickable row variant styling', () => {
      const { container } = renderWithProviders(
        <Table>
          <TableBody>
            <TableRow variant="clickable">
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      )
      const row = container.querySelector('tr')
      expect(row).toHaveClass(
        'hover:bg-fill',
        'cursor-pointer',
        'active:bg-fill-secondary',
      )
    })
  })

  describe('Data Attributes', () => {
    it('table has data-slot attribute', () => {
      const { container } = renderWithProviders(<Table />)
      const table = container.querySelector('[data-slot="table"]')
      expect(table).toBeInTheDocument()
    })

    it('table-container has data-slot attribute', () => {
      const { container } = renderWithProviders(<Table />)
      const tableContainer = container.querySelector(
        '[data-slot="table-container"]',
      )
      expect(tableContainer).toBeInTheDocument()
    })

    it('TableHeader has data-slot attribute', () => {
      const { container } = renderWithProviders(
        <Table>
          <TableHeader />
        </Table>,
      )
      const header = container.querySelector('[data-slot="table-header"]')
      expect(header).toBeInTheDocument()
    })

    it('TableBody has data-slot attribute', () => {
      const { container } = renderWithProviders(
        <Table>
          <TableBody />
        </Table>,
      )
      const body = container.querySelector('[data-slot="table-body"]')
      expect(body).toBeInTheDocument()
    })

    it('TableFooter has data-slot attribute', () => {
      const { container } = renderWithProviders(
        <Table>
          <TableFooter />
        </Table>,
      )
      const footer = container.querySelector('[data-slot="table-footer"]')
      expect(footer).toBeInTheDocument()
    })

    it('TableRow has data-slot attribute', () => {
      const { container } = renderWithProviders(
        <Table>
          <TableBody>
            <TableRow />
          </TableBody>
        </Table>,
      )
      const row = container.querySelector('[data-slot="table-row"]')
      expect(row).toBeInTheDocument()
    })

    it('TableHead has data-slot attribute', () => {
      const { container } = renderWithProviders(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead />
            </TableRow>
          </TableHeader>
        </Table>,
      )
      const head = container.querySelector('[data-slot="table-head"]')
      expect(head).toBeInTheDocument()
    })

    it('TableCell has data-slot attribute', () => {
      const { container } = renderWithProviders(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>,
      )
      const cell = container.querySelector('[data-slot="table-cell"]')
      expect(cell).toBeInTheDocument()
    })

    it('TableCaption has data-slot attribute', () => {
      const { container } = renderWithProviders(
        <Table>
          <TableCaption>Caption</TableCaption>
        </Table>,
      )
      const caption = container.querySelector('[data-slot="table-caption"]')
      expect(caption).toBeInTheDocument()
    })
  })

  describe('Composition', () => {
    it('renders full table structure correctly', () => {
      const { container } = renderWithProviders(
        <Table>
          <TableCaption>Table Caption</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Header 1</TableHead>
              <TableHead>Header 2</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Cell 1</TableCell>
              <TableCell>Cell 2</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Cell 3</TableCell>
              <TableCell>Cell 4</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Footer 1</TableCell>
              <TableCell>Footer 2</TableCell>
            </TableRow>
          </TableFooter>
        </Table>,
      )

      expect(screen.getByText('Table Caption')).toBeInTheDocument()
      expect(screen.getByText('Header 1')).toBeInTheDocument()
      expect(screen.getByText('Header 2')).toBeInTheDocument()
      expect(screen.getByText('Cell 1')).toBeInTheDocument()
      expect(screen.getByText('Cell 2')).toBeInTheDocument()
      expect(screen.getByText('Cell 3')).toBeInTheDocument()
      expect(screen.getByText('Cell 4')).toBeInTheDocument()
      expect(screen.getByText('Footer 1')).toBeInTheDocument()
      expect(screen.getByText('Footer 2')).toBeInTheDocument()

      const table = container.querySelector('table')
      expect(table?.querySelector('caption')).toBeInTheDocument()
      expect(table?.querySelector('thead')).toBeInTheDocument()
      expect(table?.querySelector('tbody')).toBeInTheDocument()
      expect(table?.querySelector('tfoot')).toBeInTheDocument()
    })

    it('renders multiple rows in tbody', () => {
      renderWithProviders(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Row 1</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Row 2</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Row 3</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      )

      expect(screen.getByText('Row 1')).toBeInTheDocument()
      expect(screen.getByText('Row 2')).toBeInTheDocument()
      expect(screen.getByText('Row 3')).toBeInTheDocument()
    })

    it('renders cells with different content types', () => {
      renderWithProviders(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Text</TableCell>
              <TableCell>
                <button type="button">Button</button>
              </TableCell>
              <TableCell>
                <span>Span</span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      )

      expect(screen.getByText('Text')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /button/i }),
      ).toBeInTheDocument()
      expect(screen.getByText('Span')).toBeInTheDocument()
    })
  })

  describe('Custom className', () => {
    it('Table merges custom className with defaults', () => {
      const { container } = renderWithProviders(
        <Table className="custom-table-class" />,
      )
      const table = container.querySelector('table')
      expect(table).toHaveClass('custom-table-class')
      expect(table).toHaveClass('w-full')
    })

    it('TableRow merges custom className with defaults', () => {
      const { container } = renderWithProviders(
        <Table>
          <TableBody>
            <TableRow className="custom-row-class">
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      )
      const row = container.querySelector('tr')
      expect(row).toHaveClass('custom-row-class')
      expect(row).toHaveClass('border-b')
    })

    it('TableCell merges custom className with defaults', () => {
      const { container } = renderWithProviders(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="custom-cell-class">Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      )
      const cell = container.querySelector('td')
      expect(cell).toHaveClass('custom-cell-class')
      expect(cell).toHaveClass('p-2')
    })

    it('TableHead merges custom className with defaults', () => {
      const { container } = renderWithProviders(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="custom-head-class">Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>,
      )
      const head = container.querySelector('th')
      expect(head).toHaveClass('custom-head-class')
      expect(head).toHaveClass('h-10')
    })
  })

  describe('Semantic HTML', () => {
    it('uses proper HTML table structure', () => {
      const { container } = renderWithProviders(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      )

      const table = container.querySelector('table')
      expect(table?.tagName).toBe('TABLE')

      const thead = table?.querySelector('thead')
      expect(thead?.tagName).toBe('THEAD')

      const tbody = table?.querySelector('tbody')
      expect(tbody?.tagName).toBe('TBODY')

      const th = thead?.querySelector('th')
      expect(th?.tagName).toBe('TH')

      const td = tbody?.querySelector('td')
      expect(td?.tagName).toBe('TD')
    })

    it('caption is positioned correctly', () => {
      const { container } = renderWithProviders(
        <Table>
          <TableCaption>Caption</TableCaption>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      )

      const caption = container.querySelector('caption')
      expect(caption).toBeInTheDocument()
      expect(caption?.tagName).toBe('CAPTION')
    })
  })
})
