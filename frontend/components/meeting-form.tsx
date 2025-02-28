"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { createMeeting, getParticipants, getMeeting, updateMeeting } from "@/lib/api"
import type { Participant } from "@/types"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Meeting name must be at least 2 characters.",
  }),
  date: z.date({
    required_error: "Please select a date.",
  }),
  duration: z.coerce.number().min(15, {
    message: "Duration must be at least 15 minutes.",
  }),
  minimum_participants: z.coerce.number().min(1, {
    message: "Minimum participants must be at least 1.",
  }),
  participant_ids: z.array(z.coerce.number()).min(1, {
    message: "Please select at least one participant.",
  }),
})

type FormValues = z.infer<typeof formSchema>

interface MeetingFormProps {
  meetingId?: number
}

export function MeetingForm({ meetingId }: MeetingFormProps = {}) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(!!meetingId)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      duration: 60,
      minimum_participants: 1,
      participant_ids: [],
    },
  })

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
      }
    }

    const fetchMeeting = async () => {
      if (!meetingId) return

      try {
        const meeting = await getMeeting(meetingId)
        form.reset({
          name: meeting.name,
          date: new Date(meeting.date),
          duration: meeting.duration,
          minimum_participants: meeting.minimum_participants,
          participant_ids: meeting.participants,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch meeting details",
          variant: "destructive",
        })
      } finally {
        setInitialLoading(false)
      }
    }

    fetchParticipants()
    fetchMeeting()
  }, [meetingId, form, toast])

  async function onSubmit(values: FormValues) {
    setLoading(true)
    try {
      if (meetingId) {
        await updateMeeting(meetingId, {
          ...values,
          date: format(values.date, "yyyy-MM-dd"),
        })
        toast({
          title: "Success",
          description: "Meeting updated successfully",
        })
      } else {
        await createMeeting({
          ...values,
          date: format(values.date, "yyyy-MM-dd"),
        })
        toast({
          title: "Success",
          description: "Meeting created successfully",
        })
      }
      router.push("/meetings")
    } catch (error) {
      toast({
        title: "Error",
        description: meetingId ? "Failed to update meeting" : "Failed to create meeting",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meeting Name</FormLabel>
                <FormControl>
                  <Input placeholder="Team Standup" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" min={15} step={15} {...field} />
                </FormControl>
                <FormDescription>Duration of the meeting in minutes</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minimum_participants"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Participants</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select minimum participants" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Minimum number of participants required</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="participant_ids"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Participants</FormLabel>
                <FormDescription>Select the participants for this meeting</FormDescription>
              </div>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {participants.length === 0 ? (
                  <p className="col-span-full text-sm text-muted-foreground">
                    No participants available. Please add participants first.
                  </p>
                ) : (
                  participants.map((participant) => (
                    <FormField
                      key={participant.id}
                      control={form.control}
                      name="participant_ids"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={participant.id}
                            className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(participant.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, participant.id])
                                    : field.onChange(field.value?.filter((value) => value !== participant.id))
                                }}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-medium">{participant.name}</FormLabel>
                              <FormDescription className="text-xs">{participant.email}</FormDescription>
                            </div>
                          </FormItem>
                        )
                      }}
                    />
                  ))
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.push("/meetings")}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {meetingId ? "Update Meeting" : "Create Meeting"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

