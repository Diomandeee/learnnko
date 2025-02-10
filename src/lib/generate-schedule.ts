import { generateWeeklySchedule } from "./schedule-generator";
import { usePriorityStore } from "@/store/priority-store";
import { useScheduleStore } from "@/store/schedule-store"; 
import { TimeBlock, WeeklySchedule } from "@/types/schedule";

export async function generateScheduleForWeek(
  startDate: Date = new Date()
): Promise<WeeklySchedule> {
  // Get selected shops from priority store
  const priorityLocations = usePriorityStore.getState().selectedShops;
  
  // Get settings and time blocks from schedule store
  const { settings, timeBlocks } = useScheduleStore.getState();

  // Generate the schedule
  const schedule = await generateWeeklySchedule({
    priorityLocations,
    settings,
    timeBlocks,
    startDate
  });

  return schedule;
}
