import { ParticipantForm } from "@/components/participant-form"

export default function NewParticipantPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Participant</h1>
        <p className="text-muted-foreground">Add a new participant to schedule meetings with</p>
      </div>

      <ParticipantForm />
    </div>
  )
}

