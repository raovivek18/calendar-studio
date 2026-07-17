import { CalendarView } from "@/components/calendar/calendar-view";

export default function CalendarPage() {
  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Calendar</h2>
          <p className="text-muted-foreground">Manage your content schedule and timeline.</p>
        </div>
      </div>
      <div className="flex-1 rounded-xl border bg-card text-card-foreground shadow">
        <CalendarView />
      </div>
    </div>
  );
}
