export interface PaginationData {
  previous?: PaginationPreviousNext,
  next?: PaginationPreviousNext,
  items: PageItem[]
}

export interface PaginationPreviousNext {
  href: string,
  text: string
}

export interface PageItem {
  number?: number,
  href?: string,
  current?: boolean,
  ellipsis?: boolean
}