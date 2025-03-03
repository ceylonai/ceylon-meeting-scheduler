import { MeetingCalendar } from "@/components/meeting-calendar"

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">View scheduled meetings and available time slots</p>
      </div>

      <MeetingCalendar />
    </div>
  )
}

