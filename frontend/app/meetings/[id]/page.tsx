import { MeetingForm } from "@/components/meeting-form"

interface MeetingPageProps {
  params: {
    id: string
  }
}

export default function MeetingPage({ params }: MeetingPageProps) {
  const meetingId = Number.parseInt(params.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Meeting</h1>
        <p className="text-muted-foreground">Update meeting details and participants</p>
      </div>

      <MeetingForm meetingId={meetingId} />
    </div>
  )
}

