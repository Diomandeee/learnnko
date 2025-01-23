export interface Visit {
  id: string
  shopId: string
  date: Date
  visitNumber: number
  managerPresent: boolean
  managerName?: string
  managerContact?: string
  samplesDropped: boolean
  sampleDetails?: string
  notes?: string
  nextVisitDate?: Date
  photos?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface VisitFormData {
  date: Date
  managerPresent: boolean
  managerName?: string
  managerContact?: string
  samplesDropped: boolean
  sampleDetails?: string
  notes?: string
  nextVisitDate?: Date
  photos?: File[]
}
