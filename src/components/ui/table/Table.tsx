import * as React from 'react'
import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

import { clsxm } from '~/lib/cn'

const tableContainerVariants = tv({
  base: 'relative w-full overflow-x-auto',
})

const tableVariants = tv({
  base: 'w-full caption-bottom text-sm',
  variants: {
    variant: {
      default: '',
      striped: '[&_tbody_tr:nth-child(even)]:bg-fill',
      bordered: 'border border-border',
      hover: '[&_tbody_tr]:hover:bg-fill transition-colors',
    },
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})

const tableRowVariants = tv({
  base: [
    'border-b border-border transition-colors',
    'hover:bg-fill data-[state=selected]:bg-fill-secondary',
  ],
  variants: {
    variant: {
      default: '',
      hover: 'hover:bg-fill cursor-pointer',
      clickable: 'hover:bg-fill cursor-pointer active:bg-fill-secondary',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const tableHeaderVariants = tv({
  base: '[&_tr]:border-b [&_tr]:border-border',
})

const tableHeadVariants = tv({
  base: [
    'h-10 px-2 text-left align-middle font-medium whitespace-nowrap',
    'text-text-secondary',
    '[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
  ],
})

const tableCellVariants = tv({
  base: [
    'p-2 align-middle whitespace-nowrap text-text',
    '[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
  ],
})

const tableFooterVariants = tv({
  base: [
    'bg-fill border-t border-border font-medium',
    '[&>tr]:last:border-b-0',
  ],
})

const tableCaptionVariants = tv({
  base: 'mt-4 text-sm text-text-tertiary',
})

export interface TableProps
  extends React.ComponentProps<'table'>,
    VariantProps<typeof tableVariants> {}

function Table({ className, variant, size, ...props }: TableProps) {
  return (
    <div data-slot="table-container" className={tableContainerVariants()}>
      <table
        data-slot="table"
        className={clsxm(tableVariants({ variant, size }), className)}
        {...props}
      />
    </div>
  )
}

export interface TableHeaderProps extends React.ComponentProps<'thead'> {}

function TableHeader({ className, ...props }: TableHeaderProps) {
  return (
    <thead
      data-slot="table-header"
      className={clsxm(tableHeaderVariants(), className)}
      {...props}
    />
  )
}

export interface TableBodyProps extends React.ComponentProps<'tbody'> {}

function TableBody({ className, ...props }: TableBodyProps) {
  return (
    <tbody
      data-slot="table-body"
      className={clsxm('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  )
}

export interface TableFooterProps extends React.ComponentProps<'tfoot'> {}

function TableFooter({ className, ...props }: TableFooterProps) {
  return (
    <tfoot
      data-slot="table-footer"
      className={clsxm(tableFooterVariants(), className)}
      {...props}
    />
  )
}

export interface TableRowProps
  extends React.ComponentProps<'tr'>,
    VariantProps<typeof tableRowVariants> {}

function TableRow({ className, variant, ...props }: TableRowProps) {
  return (
    <tr
      data-slot="table-row"
      className={clsxm(tableRowVariants({ variant }), className)}
      {...props}
    />
  )
}

export interface TableHeadProps extends React.ComponentProps<'th'> {}

function TableHead({ className, ...props }: TableHeadProps) {
  return (
    <th
      data-slot="table-head"
      className={clsxm(tableHeadVariants(), className)}
      {...props}
    />
  )
}

export interface TableCellProps extends React.ComponentProps<'td'> {}

function TableCell({ className, ...props }: TableCellProps) {
  return (
    <td
      data-slot="table-cell"
      className={clsxm(tableCellVariants(), className)}
      {...props}
    />
  )
}

export interface TableCaptionProps extends React.ComponentProps<'caption'> {}

function TableCaption({ className, ...props }: TableCaptionProps) {
  return (
    <caption
      data-slot="table-caption"
      className={clsxm(tableCaptionVariants(), className)}
      {...props}
    />
  )
}

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
}
