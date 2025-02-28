"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Clock, Users } from "lucide-react"
import { getMeetings } from "@/lib/api"
import type { Meeting } from "@/types"
import { formatDate, formatDuration } from "@/lib/utils"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

export function MeetingList() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const data = await getMeetings()
        setMeetings(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch meetings",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMeetings()
  }, [toast])

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Recent Meetings</CardTitle>
        <CardDescription>Your upcoming and recent meetings</CardDescription>
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
        ) : meetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="mb-4 text-muted-foreground">No meetings found</p>
            <Link href="/meetings/new">
              <Button>Create Meeting</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.slice(0, 5).map((meeting) => (
              <div key={meeting.id} className="rounded-lg border p-4 transition-colors hover:bg-muted/50">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold">{meeting.name}</h3>
                  <Badge variant={meeting.scheduled_slot ? "default" : "outline"}>
                    {meeting.scheduled_slot ? "Scheduled" : "Pending"}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>{formatDate(meeting.date)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>{formatDuration(meeting.duration)}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    <span>
                      {meeting.participants.length} participants (min: {meeting.minimum_participants})
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-center pt-2">
              <Link href="/meetings">
                <Button variant="outline">View All Meetings</Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

