export interface SavedFilter {
  id: string
  name: string
    filters: Filter[]
  isDefault: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Filter {
  id: string
  field: string
  operator: string
  value: any
  type: string
  label: string
}

export interface SavedFilterInput {
  name: string
  filters: Filter[]
  isDefault?: boolean
}
