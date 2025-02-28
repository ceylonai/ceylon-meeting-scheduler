"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, CheckCircle, Clock, RefreshCw } from "lucide-react"
import { getSchedulingStatus, runScheduling } from "@/lib/api"
import type { MeetingScheduleResult } from "@/types"
import { useToast } from "@/components/ui/use-toast"
import { formatDate, formatTime } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

export function SchedulingDashboard() {
  const [results, setResults] = useState<MeetingScheduleResult[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getSchedulingStatus()
      setResults(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch scheduling status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const handleRunScheduling = async () => {
    setRunning(true)
    setProgress(0)

    // Simulate progress updates
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 10
        return newProgress >= 100 ? 100 : newProgress
      })
    }, 500)

    try {
      await runScheduling()
      setProgress(100)
      toast({
        title: "Success",
        description: "Scheduling process completed",
      })
      fetchStatus()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run scheduling",
        variant: "destructive",
      })
    } finally {
      clearInterval(interval)
      setRunning(false)
    }
  }

  // Calculate statistics
  const totalMeetings = results.length
  const scheduledMeetings = results.filter((r) => r.scheduled).length
  const pendingMeetings = totalMeetings - scheduledMeetings

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Meetings</CardTitle>
            <CardDescription>All meetings in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-10 w-16" /> : <div className="text-4xl font-bold">{totalMeetings}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Scheduled</CardTitle>
            <CardDescription>Successfully scheduled meetings</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-10 w-16" />
            ) : (
              <div className="text-4xl font-bold text-green-600 dark:text-green-500">{scheduledMeetings}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Pending</CardTitle>
            <CardDescription>Meetings awaiting scheduling</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-10 w-16" />
            ) : (
              <div className="text-4xl font-bold text-amber-600 dark:text-amber-500">{pendingMeetings}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Run Scheduling</CardTitle>
          <CardDescription>Run the scheduling algorithm to find optimal meeting times</CardDescription>
        </CardHeader>
        <CardContent>
          {running && (
            <div className="mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          <Button onClick={handleRunScheduling} disabled={running} className="w-full">
            {running ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Running Scheduler...
              </>
            ) : (
              <>
                <Clock className="mr-2 h-4 w-4" />
                Run Scheduling Algorithm
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduling Results</CardTitle>
          <CardDescription>Results of the scheduling process</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="mb-4 text-muted-foreground">No scheduling data available</p>
              <Button onClick={handleRunScheduling} disabled={running}>
                Run Scheduling
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <div key={result.meeting_id} className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center">
                    {result.scheduled ? (
                      <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="mr-2 h-5 w-5 text-amber-500" />
                    )}
                    <h3 className="font-semibold">{result.name}</h3>
                  </div>

                  {result.scheduled && result.time_slot ? (
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Date:</span> {formatDate(result.time_slot.date)}
                      </p>
                      <p>
                        <span className="font-medium">Time:</span> {formatTime(result.time_slot.start_time)} -{" "}
                        {formatTime(result.time_slot.end_time)}
                      </p>
                      <p>
                        <span className="font-medium">Participants:</span> {result.participants.length}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{result.error || "Not scheduled yet"}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

