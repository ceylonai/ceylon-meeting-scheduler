import { SchedulingDashboard } from "@/components/scheduling-dashboard"

export default function SchedulingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scheduling</h1>
        <p className="text-muted-foreground">Run the scheduling algorithm and view results</p>
      </div>

      <SchedulingDashboard />
    </div>
  )
}

