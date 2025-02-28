import { MeetingForm } from "@/components/meeting-form"

export default function NewMeetingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Meeting</h1>
        <p className="text-muted-foreground">Set up a new meeting with participants</p>
      </div>

      <MeetingForm />
    </div>
  )
}

