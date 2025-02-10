"use client"

import { createContext, useContext, useState } from 'react'

type ViewMode = 'list' | 'schedule'

interface ScheduleViewContextType {
  viewMode: ViewMode
  toggleView: () => void
}

const ScheduleViewContext = createContext<ScheduleViewContextType | undefined>(undefined)

export function ScheduleViewProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  const toggleView = () => {
    setViewMode(prev => prev === 'list' ? 'schedule' : 'list')
  }

  return (
    <ScheduleViewContext.Provider value={{ viewMode, toggleView }}>
      {children}
    </ScheduleViewContext.Provider>
  )
}

export function useScheduleView() {
  const context = useContext(ScheduleViewContext)
  if (!context) {
    throw new Error('useScheduleView must be used within a ScheduleViewProvider')
  }
  return context
}
