// src/components/coffee-shops/table/filter-configs.ts

import { CoffeeShop } from "@prisma/client"

export type FilterOperator = 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'startsWith'
export type FilterDataType = 'text' | 'number' | 'boolean' | 'date' | 'rating' | 'volume' | 'priority' | 'email' | 'instagram' | 'phone'

export interface FilterConfig {
  field: keyof CoffeeShop
  label: string
  type: FilterDataType
  operators: FilterOperator[]
  placeholder?: string
  help?: string
}

export const FILTER_CONFIGS: FilterConfig[] = [
  {
    field: 'title',
    label: 'Name',
    type: 'text',
    operators: ['contains', 'equals', 'startsWith'],
    placeholder: 'Enter shop name...'
  },
  {
    field: 'area',
    label: 'Area',
    type: 'text',
    operators: ['contains', 'equals', 'startsWith'],
    placeholder: 'Enter area...'
  },
  {
    field: 'address',
    label: 'Address',
    type: 'text',
    operators: ['contains', 'equals'],
    placeholder: 'Enter address...'
  },
  {
    field: 'priority',
    label: 'Priority',
    type: 'priority',
    operators: ['equals', 'greaterThan', 'lessThan', 'between'],
    placeholder: 'Enter priority (1-5)...',
    help: 'Priority ranges from 1 to 5'
  },
  {
    field: 'isPartner',
    label: 'Partner Status',
    type: 'boolean',
    operators: ['equals'],
  },
  {
    field: 'manager_present',
    label: 'Manager',
    type: 'text',
    operators: ['contains', 'equals'],
    placeholder: "Enter manager's name..."
  },
  {
    field: 'contact_name',
    label: 'Contact Name',
    type: 'text',
    operators: ['contains', 'equals'],
    placeholder: "Enter contact's name..."
  },
  {
    field: 'contact_email',
    label: 'Contact Email',
    type: 'email',
    operators: ['contains', 'equals'],
    placeholder: 'Enter email address...'
  },
  {
    field: 'volume',
    label: 'Volume',
    type: 'volume',
    operators: ['equals', 'greaterThan', 'lessThan', 'between'],
    placeholder: 'Enter weekly volume...',
    help: 'Weekly volume in units'
  },
  {
    field: 'first_visit',
    label: 'First Visit',
    type: 'date',
    operators: ['equals', 'greaterThan', 'lessThan', 'between']
  },
  {
    field: 'second_visit',
    label: 'Second Visit',
    type: 'date',
    operators: ['equals', 'greaterThan', 'lessThan', 'between']
  },
  {
    field: 'third_visit',
    label: 'Third Visit',
    type: 'date',
    operators: ['equals', 'greaterThan', 'lessThan', 'between']
  },
  {
    field: 'visited',
    label: 'Visit Status',
    type: 'boolean',
    operators: ['equals']
  },
  {
    field: 'rating',
    label: 'Rating',
    type: 'rating',
    operators: ['equals', 'greaterThan', 'lessThan', 'between'],
    placeholder: 'Enter rating (1-5)...',
    help: 'Rating ranges from 1 to 5'
  },
  {
    field: 'reviews',
    label: 'Reviews',
    type: 'number',
    operators: ['equals', 'greaterThan', 'lessThan', 'between'],
    placeholder: 'Enter number of reviews...'
  },
  {
    field: 'instagram',
    label: 'Instagram',
    type: 'instagram',
    operators: ['contains', 'equals', 'startsWith'],
    placeholder: 'Enter Instagram handle...'
  },
  {
    field: 'followers',
    label: 'Followers',
    type: 'number',
    operators: ['equals', 'greaterThan', 'lessThan', 'between'],
    placeholder: 'Enter number of followers...'
  },
  {
    field: 'parlor_coffee_leads',
    label: 'Lead Status',
    type: 'boolean',
    operators: ['equals']
  },
  {
    field: 'notes',
    label: 'Notes',
    type: 'text',
    operators: ['contains'],
    placeholder: 'Search in notes...'
  }
]

export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  equals: 'Equals',
  contains: 'Contains',
  greaterThan: 'Greater than',
  lessThan: 'Less than',
  between: 'Between',
  startsWith: 'Starts with'
}

export const FILTER_TYPE_CONFIGS = {
  text: {
    component: 'Input',
    props: {
      type: 'text'
    }
  },
  number: {
    component: 'Input',
    props: {
      type: 'number'
    }
  },
  boolean: {
    component: 'Select',
    options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' }
    ]
  },
  date: {
    component: 'DatePicker'
  },
  rating: {
    component: 'Input',
    props: {
      type: 'number',
      min: 1,
      max: 5
    }
  },
  volume: {
    component: 'Input',
    props: {
      type: 'number',
      min: 0
    }
  },
  priority: {
    component: 'Input',
    props: {
      type: 'number',
      min: 1,
      max: 5
    }
  },
  email: {
    component: 'Input',
    props: {
      type: 'email'
    }
  },
  instagram: {
    component: 'Input',
    props: {
      type: 'text'
    }
  },
  phone: {
    component: 'Input',
    props: {
      type: 'tel'
    }
  }
} as const

// Helper functions for filter validation
export const validateFilterValue = (type: FilterDataType, value: any): boolean => {
  switch (type) {
    case 'rating':
    case 'priority':
      const num = Number(value)
      return !isNaN(num) && num >= 1 && num <= 5
    case 'volume':
    case 'number':
      return !isNaN(Number(value))
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    case 'date':
      return !isNaN(Date.parse(value))
    default:
      return true
  }
}

export const formatFilterValue = (type: FilterDataType, value: any): any => {
  switch (type) {
    case 'rating':
    case 'priority':
    case 'volume':
    case 'number':
      return Number(value)
    case 'date':
      return new Date(value).toISOString()
    case 'boolean':
      return value === 'true'
    default:
      return value
  }
}