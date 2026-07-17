"use client";

import { useDroppable } from "@dnd-kit/core";
import { format, isSameMonth, isToday } from "date-fns";

interface CalendarDayProps {
  day: Date;
  currentDate: Date;
  children: React.ReactNode;
}

export function CalendarDay({ day, currentDate, children }: CalendarDayProps) {
  const dateStr = format(day, "yyyy-MM-dd");
  const { isOver, setNodeRef } = useDroppable({
    id: dateStr,
    data: {
      type: 'CalendarDay',
      date: dateStr,
    }
  });

  const isCurrentMonth = isSameMonth(day, currentDate);
  const today = isToday(day);

  return (
    <div
      ref={setNodeRef}
      className={`border-r border-b border-zinc-200 dark:border-zinc-800 p-2 flex flex-col gap-1 min-h-[120px] transition-colors 
      ${!isCurrentMonth ? 'opacity-50 bg-zinc-50 dark:bg-zinc-900/50' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/50'}
      ${isOver ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500 ring-inset' : ''}
      `}
    >
      <div className="flex justify-between items-center">
        <span className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${today ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'text-zinc-700 dark:text-zinc-300'}`}>
          {format(day, 'd')}
        </span>
      </div>
      <div className="flex-1 flex flex-col gap-1 mt-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
