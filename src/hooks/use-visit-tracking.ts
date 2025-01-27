
// src/hooks/use-visit-tracking.ts

import { useState, useCallback } from 'react'
import { VisitReport } from '@/types/route'

export function useVisitTracking() {
  const [currentVisit, setCurrentVisit] = useState<VisitReport | null>(null)

  const startVisit = useCallback((locationId: string) => {
    setCurrentVisit({
      visitId: crypto.randomUUID(),
      locationId,
      visitDate: new Date(),
    })
  }, [])

  const updateVisit = useCallback((updates: Partial<VisitReport>) => {
    setCurrentVisit(prev => prev ? { ...prev, ...updates } : null)
  }, [])

  const completeVisit = useCallback(async () => {
    if (!currentVisit) return

    try {
      // Save visit report to backend
      const response = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentVisit)
      })

      if (!response.ok) throw new Error('Failed to save visit')

      setCurrentVisit(null)
      return await response.json()
    } catch (error) {
      console.error('Failed to save visit:', error)
      throw error
    }
  }, [currentVisit])

  return {
    currentVisit,
    startVisit,
    updateVisit,
    completeVisit
  }
}