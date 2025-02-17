import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface RecordingSettings {
  maxDuration: number // in seconds
  setMaxDuration: (duration: number) => void
}

export const useRecordingSettings = create<RecordingSettings>()(
  persist(
    (set) => ({
      maxDuration: 30, // default 30 seconds
      setMaxDuration: (duration) => set({ maxDuration: duration }),
    }),
    {
      name: 'recording-settings',
    }
  )
)
