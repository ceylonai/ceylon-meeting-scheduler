import { ParticipantForm } from "@/components/participant-form"

interface ParticipantPageProps {
  params: {
    id: string
  }
}

export default function ParticipantPage({ params }: ParticipantPageProps) {
  const participantId = Number.parseInt(params.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Participant</h1>
        <p className="text-muted-foreground">Update participant details</p>
      </div>

      <ParticipantForm participantId={participantId} />
    </div>
  )
}

