import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MeetingList } from "@/components/meeting-list"
import { SchedulingStatus } from "@/components/scheduling-status"
import { ParticipantStats } from "@/components/participant-stats"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your meetings and scheduling status</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Meetings</CardTitle>
            <CardDescription>Upcoming and scheduled meetings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">12</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Scheduled</CardTitle>
            <CardDescription>Successfully scheduled meetings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">8</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Pending</CardTitle>
            <CardDescription>Meetings awaiting scheduling</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">4</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <MeetingList />
        <SchedulingStatus />
      </div>

      <ParticipantStats />
    </div>
  )
}

