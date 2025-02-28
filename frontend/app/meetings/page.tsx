import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MeetingsTable } from "@/components/meetings-table"
import { Plus } from "lucide-react"

export default function MeetingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meetings</h1>
          <p className="text-muted-foreground">Manage your meetings and their schedules</p>
        </div>
        <Link href="/meetings/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Meeting
          </Button>
        </Link>
      </div>

      <MeetingsTable />
    </div>
  )
}

