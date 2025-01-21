"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { addDays, startOfWeek } from "date-fns";

interface ScheduleContextType {
  currentDate: Date;
  weekStart: Date;
  view: "day" | "week";
  setCurrentDate: (date: Date) => void;
  setWeekStart: (date: Date) => void;
  setView: (view: "day" | "week") => void;
  navigateWeek: (direction: "prev" | "next") => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(currentDate));
  const [view, setView] = useState<"day" | "week">("week");

  const navigateWeek = useCallback((direction: "prev" | "next") => {
    const days = direction === "prev" ? -7 : 7;
    const newWeekStart = addDays(weekStart, days);
    setWeekStart(newWeekStart);
    setCurrentDate(newWeekStart);
  }, [weekStart]);

  return (
    <ScheduleContext.Provider
      value={{
        currentDate,
        weekStart,
        view,
        setCurrentDate,
        setWeekStart,
        setView,
        navigateWeek,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error("useSchedule must be used within a ScheduleProvider");
  }
  return context;
};
