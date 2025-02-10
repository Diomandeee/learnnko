import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TimeBlock, WeeklySchedule } from '@/types/schedule'
import { ScheduleSettings, DEFAULT_SCHEDULE_SETTINGS } from '@/types/schedule-settings'

interface ScheduleState {
  timeBlocks: TimeBlock[]
  currentSchedule: WeeklySchedule | null
  settings: ScheduleSettings
  addTimeBlock: (block: TimeBlock) => void
  removeTimeBlock: (id: string) => void
  updateSchedule: (schedule: WeeklySchedule) => void
  updateSettings: (settings: Partial<ScheduleSettings>) => void
  clearSchedule: () => void
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set) => ({
      timeBlocks: [],
      currentSchedule: null,
      settings: DEFAULT_SCHEDULE_SETTINGS,

      addTimeBlock: (block) =>
        set((state) => ({
          timeBlocks: [...state.timeBlocks, block]
        })),

      removeTimeBlock: (id) =>
        set((state) => ({
          timeBlocks: state.timeBlocks.filter((block) => block.id !== id)
        })),

      updateSchedule: (schedule) =>
        set({
          currentSchedule: schedule
        }),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        })),

      clearSchedule: () =>
        set({
          currentSchedule: null
        })
    }),
    {
      name: 'schedule-store'
    }
  )
)
