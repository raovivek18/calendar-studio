"use client";

import { useDroppable } from "@dnd-kit/core";
import { format, isSameDay } from "date-fns";
import { memo } from "react";

interface CalendarDayProps {
  day: Date;
  currentDate: Date;
  children: React.ReactNode;
}

export const CalendarDay = memo(function CalendarDay({ day, currentDate, children }: CalendarDayProps) {
  const isToday = isSameDay(day, new Date());
  const isCurrentMonth = day.getMonth() === currentDate.getMonth();

  const { isOver, setNodeRef } = useDroppable({
    id: format(day, 'yyyy-MM-dd'),
    data: {
      type: 'Day',
      date: format(day, 'yyyy-MM-dd')
    }
  });

  return (
    <div 
      ref={setNodeRef}
      className={`min-h-[120px] p-2 border-r border-b border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer group ${
        !isCurrentMonth ? 'bg-zinc-50 dark:bg-zinc-900/50 text-zinc-400' : 'bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
      } ${isOver ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
          isToday ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : ''
        }`}>
          {format(day, 'd')}
        </span>
      </div>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
});
