import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ParticipantsTable } from "@/components/participants-table"
import { Plus } from "lucide-react"

export default function ParticipantsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Participants</h1>
          <p className="text-muted-foreground">Manage participants and their availability</p>
        </div>
        <Link href="/participants/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Participant
          </Button>
        </Link>
      </div>

      <ParticipantsTable />
    </div>
  )
}

