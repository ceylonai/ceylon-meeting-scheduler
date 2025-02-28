"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getParticipants } from "@/lib/api"
import type { Participant } from "@/types"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function ParticipantStats() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const data = await getParticipants()
        setParticipants(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch participants",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchParticipants()
  }, [toast])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Participants</CardTitle>
        <CardDescription>People available for meetings</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : participants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="mb-4 text-muted-foreground">No participants found</p>
            <Link href="/participants/new">
              <Button>Add Participant</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {participants.slice(0, 8).map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center space-x-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <Avatar>
                    <AvatarFallback>
                      {participant.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{participant.name}</p>
                    <p className="text-sm text-muted-foreground">{participant.email}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-center">
              <Link href="/participants">
                <Button variant="outline">View All Participants</Button>
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

