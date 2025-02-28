"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, CheckCircle, Clock } from "lucide-react"
import { getSchedulingStatus, runScheduling } from "@/lib/api"
import type { MeetingScheduleResult } from "@/types"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

export function SchedulingStatus() {
  const [results, setResults] = useState<MeetingScheduleResult[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const { toast } = useToast()

  const fetchStatus = useCallback(async () => {
    try {
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
    try {
      await runScheduling()
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
      setRunning(false)
    }
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Scheduling Status</CardTitle>
        <CardDescription>Status of your meeting scheduling</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-4 space-y-3">
              {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <p className="mb-4 text-muted-foreground">No scheduling data available</p>
                </div>
              ) : (
                results.slice(0, 3).map((result) => (
                  <div key={result.meeting_id} className="flex items-start rounded-lg border p-3">
                    {result.scheduled ? (
                      <CheckCircle className="mr-3 h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="mr-3 h-5 w-5 text-amber-500" />
                    )}
                    <div>
                      <p className="font-medium">{result.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {result.scheduled ? "Successfully scheduled" : result.error || "Not scheduled yet"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex flex-col space-y-2">
              <Button onClick={handleRunScheduling} disabled={running}>
                {running ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Running Scheduler...
                  </>
                ) : (
                  "Run Scheduling"
                )}
              </Button>
              <Link href="/scheduling">
                <Button variant="outline" className="w-full">
                  View Detailed Status
                </Button>
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

