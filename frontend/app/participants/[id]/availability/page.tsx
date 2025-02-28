import { AvailabilityForm } from "@/components/availability-form"

interface AvailabilityPageProps {
  params: {
    id: string
  }
}

export default function AvailabilityPage({ params }: AvailabilityPageProps) {
  const participantId = Number.parseInt(params.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Availability</h1>
        <p className="text-muted-foreground">Set available time slots for this participant</p>
      </div>

      <AvailabilityForm participantId={participantId} />
    </div>
  )
}

