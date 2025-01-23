import { create } from 'zustand'
import { Visit, VisitFormData } from '@/types/visit'

interface VisitState {
  visits: Visit[]
  loading: boolean
  error: string | null
  fetchVisits: (shopId: string) => Promise<void>
  addVisit: (shopId: string, data: VisitFormData) => Promise<void>
  updateVisit: (visitId: string, data: Partial<VisitFormData>) => Promise<void>
}

export const useVisitStore = create<VisitState>((set) => ({
  visits: [],
  loading: false,
  error: null,

  fetchVisits: async (shopId) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/shops/${shopId}/visits`)
      if (!response.ok) throw new Error('Failed to fetch visits')

      const visits = await response.json()
      set({ visits, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false,
      })
    }
  },

  addVisit: async (shopId, data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/shops/${shopId}/visits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to add visit')

      const newVisit = await response.json()
      set((state) => ({
        visits: [...state.visits, newVisit],
        loading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false,
      })
    }
  },

  updateVisit: async (visitId, data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/visits/${visitId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to update visit')

      const updatedVisit = await response.json()
      set((state) => ({
        visits: state.visits.map((visit) =>
          visit.id === visitId ? updatedVisit : visit
        ),
        loading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false,
      })
    }
  },
}))
