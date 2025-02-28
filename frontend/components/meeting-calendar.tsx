"use client"

import { useState, useEffect } from "react"
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay } from "date-fns"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { getMeetings, getParticipants } from "@/lib/api"
import type { Meeting, Participant, TimeSlot } from "@/types"
import { formatTime, cn } from "@/lib/utils"

export function MeetingCalendar() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [meetingsData, participantsData] = await Promise.all([getMeetings(), getParticipants()])
        setMeetings(meetingsData)
        setParticipants(participantsData)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch calendar data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const nextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1))
  }

  const prevWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1))
  }

  // Generate days of the week
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i))

  // Hours for the day (8 AM to 8 PM)
  const hours = Array.from({ length: 13 }, (_, i) => i + 8)

  // Get meetings for a specific day
  const getMeetingsForDay = (day: Date) => {
    return meetings.filter((meeting) => {
      if (!meeting.scheduled_slot) return false
      return isSameDay(new Date(meeting.date), day)
    })
  }

  // Get available slots for a specific day
  const getAvailableSlotsForDay = (day: Date) => {
    const slots: TimeSlot[] = []
    participants.forEach((participant) => {
      participant.available_slots?.forEach((slot) => {
        if (isSameDay(new Date(slot.date), day)) {
          slots.push(slot)
        }
      })
    })
    return slots
  }

  if (loading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{format(currentWeek, "MMMM yyyy")}</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={prevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-8 gap-1">
        {/* Time column */}
        <div className="pt-10">
          {hours.map((hour) => (
            <div key={hour} className="h-20 border-t px-2 py-1 text-right text-sm text-muted-foreground">
              {hour === 12 ? "12 PM" : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
            </div>
          ))}
        </div>

        {/* Days columns */}
        {weekDays.map((day) => (
          <div key={day.toString()} className="flex flex-col">
            <div className="border-b p-2 text-center">
              <div className="font-medium">{format(day, "EEE")}</div>
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-sm",
                  isSameDay(day, new Date()) && "bg-primary text-primary-foreground",
                )}
              >
                {format(day, "d")}
              </div>
            </div>
            <div className="relative">
              {hours.map((hour) => (
                <div key={hour} className="h-20 border-t border-r"></div>
              ))}

              {/* Render meetings */}
              {getMeetingsForDay(day).map((meeting) => {
                if (!meeting.scheduled_slot) return null

                const startMinutes = meeting.scheduled_slot.start_time
                const endMinutes = meeting.scheduled_slot.end_time
                const startHour = startMinutes / 60
                const duration = (endMinutes - startMinutes) / 60

                // Calculate position and height
                const top = (startHour - 8) * 80 // 8 AM is the start time, each hour is 80px
                const height = duration * 80

                return (
                  <div
                    key={meeting.id}
                    className="absolute left-0 right-0 mx-1 rounded bg-primary p-1 text-xs text-primary-foreground"
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                    }}
                  >
                    <div className="overflow-hidden text-ellipsis whitespace-nowrap font-medium">{meeting.name}</div>
                    <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                      {formatTime(meeting.scheduled_slot.start_time)} - {formatTime(meeting.scheduled_slot.end_time)}
                    </div>
                  </div>
                )
              })}

              {/* Render available slots */}
              {getAvailableSlotsForDay(day).map((slot) => {
                const startHour = slot.start_time / 60
                const duration = (slot.end_time - slot.start_time) / 60

                // Calculate position and height
                const top = (startHour - 8) * 80 // 8 AM is the start time, each hour is 80px
                const height = duration * 80

                return (
                  <div
                    key={slot.id}
                    className="absolute left-0 right-0 mx-1 rounded border border-dashed border-green-500 bg-green-100 p-1 text-xs dark:bg-green-950 dark:bg-opacity-30"
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                    }}
                  >
                    <div className="overflow-hidden text-ellipsis whitespace-nowrap text-green-800 dark:text-green-300">
                      Available
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

