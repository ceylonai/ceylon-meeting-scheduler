"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { createParticipant, getParticipant, updateParticipant } from "@/lib/api"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  is_active: z.boolean().default(true),
})

type FormValues = z.infer<typeof formSchema>

interface ParticipantFormProps {
  participantId?: number
}

export function ParticipantForm({ participantId }: ParticipantFormProps = {}) {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(!!participantId)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      is_active: true,
    },
  })

  useEffect(() => {
    const fetchParticipant = async () => {
      if (!participantId) return

      try {
        const participant = await getParticipant(participantId)
        form.reset({
          name: participant.name,
          email: participant.email,
          is_active: participant.is_active,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch participant details",
          variant: "destructive",
        })
      } finally {
        setInitialLoading(false)
      }
    }

    fetchParticipant()
  }, [participantId, form, toast])

  async function onSubmit(values: FormValues) {
    setLoading(true)
    try {
      if (participantId) {
        await updateParticipant(participantId, values)
        toast({
          title: "Success",
          description: "Participant updated successfully",
        })
      } else {
        await createParticipant(values)
        toast({
          title: "Success",
          description: "Participant created successfully",
        })
      }
      router.push("/participants")
    } catch (error) {
      toast({
        title: "Error",
        description: participantId ? "Failed to update participant" : "Failed to create participant",
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
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="john.doe@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <FormDescription>Determine if this participant is active and available for meetings</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.push("/participants")}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {participantId ? "Update Participant" : "Create Participant"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

