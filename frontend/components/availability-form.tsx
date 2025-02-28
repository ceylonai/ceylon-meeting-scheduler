"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { getParticipant, getParticipantTimeSlots, addParticipantTimeSlot } from "@/lib/api"
import type { Participant, TimeSlot } from "@/types"
import { formatTime, formatDate } from "@/lib/utils"

interface AvailabilityFormProps {
  participantId: number
}

export function AvailabilityForm({ participantId }: AvailabilityFormProps) {
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [date, setDate] = useState<Date>(new Date())
  const [startTime, setStartTime] = useState("540") // 9:00 AM in minutes
  const [endTime, setEndTime] = useState("1020") // 5:00 PM in minutes
  const router = useRouter()
  const { toast } = useToast()

  const fetchData = async () => {
    try {
      setLoading(true)
      const [participantData, timeSlotsData] = await Promise.all([
        getParticipant(participantId),
        getParticipantTimeSlots(participantId),
      ])
      setParticipant(participantData)
      setTimeSlots(timeSlotsData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch participant data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participantId])

  const handleAddTimeSlot = async () => {
    if (!date || !startTime || !endTime) {
      toast({
        title: "Error",
        description: "Please select date, start time and end time",
        variant: "destructive",
      })
      return
    }

    const startMinutes = Number.parseInt(startTime)
    const endMinutes = Number.parseInt(endTime)

    if (startMinutes >= endMinutes) {
      toast({
        title: "Error",
        description: "End time must be after start time",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const newTimeSlot = await addParticipantTimeSlot(participantId, {
        date: format(date, "yyyy-MM-dd"),
        start_time: startMinutes,
        end_time: endMinutes,
      })

      setTimeSlots([...timeSlots, newTimeSlot])
      toast({
        title: "Success",
        description: "Time slot added successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add time slot",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Generate time options in 30-minute increments
  const timeOptions = []
  for (let i = 0; i < 24 * 60; i += 30) {
    const hours = Math.floor(i / 60)
    const minutes = i % 60
    const period = hours >= 12 ? "PM" : "AM"
    const formattedHours = hours % 12 || 12
    const formattedMinutes = minutes.toString().padStart(2, "0")
    const label = `${formattedHours}:${formattedMinutes} ${period}`
    timeOptions.push({ value: i.toString(), label })
  }

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Add Availability</CardTitle>
              <CardDescription>Add time slots when {participant?.name} is available for meetings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Time</label>
                  <Select value={startTime} onValueChange={setStartTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select start time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((option) => (
                        <SelectItem key={`start-${option.value}`} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">End Time</label>
                  <Select value={endTime} onValueChange={setEndTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select end time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((option) => (
                        <SelectItem key={`end-${option.value}`} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="mt-6" onClick={handleAddTimeSlot} disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Add Time Slot
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Availability</CardTitle>
              <CardDescription>Time slots when {participant?.name} is available</CardDescription>
            </CardHeader>
            <CardContent>
              {timeSlots.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground">No time slots added yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {timeSlots.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="font-medium">{formatDate(slot.date)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                        </p>
                      </div>
                      <Button variant="outline" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => router.push("/participants")}>
              Back to Participants
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

