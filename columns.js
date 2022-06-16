import { useMemo } from 'react'

import { ActionsCell } from './Cells'

export function useColumns() {
  return useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
        Cell: renderName,
        width: 1.5,
      },
      {
        Header: 'Category',
        Cell: renderCategory,
        accessor: 'category',
        width: 1,
      },
      {
        Header: 'Subcategory',
        accessor: 'subCategory',
        Cell: renderSubCategory,
        width: 1,
      },
      {
        Header: 'Actions',
        Cell: ActionsCell,
        width: 0.5,
        cellRight: true,
        headerRight: true,
      },
    ],
    [],
  )
}

function renderName({ value }) {
  return `${value || '—'}`
}

function renderCategory({ value }) {
  return `${value || '—'}`
}

function renderSubCategory({ value }) {
  return `${value || '—'}`
}
