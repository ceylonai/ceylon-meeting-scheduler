"use client"

import { useState, useEffect, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Edit, Trash2, Calendar } from "lucide-react"
import type { Participant } from "@/types"
import { getParticipants, deleteParticipant } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function ParticipantsTable() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const { toast } = useToast()

  const fetchParticipants = useCallback(async () => {
    try {
      setLoading(true)
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
  }, [toast])

  useEffect(() => {
    fetchParticipants()
  }, [fetchParticipants])

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await deleteParticipant(deleteId)
      setParticipants(participants.filter((participant) => participant.id !== deleteId))
      toast({
        title: "Success",
        description: "Participant deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete participant",
        variant: "destructive",
      })
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time Slots</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-9 w-20 float-right" />
                  </TableCell>
                </TableRow>
              ))
            ) : participants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No participants found
                </TableCell>
              </TableRow>
            ) : (
              participants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell className="font-medium">{participant.name}</TableCell>
                  <TableCell>{participant.email}</TableCell>
                  <TableCell>
                    <Badge variant={participant.is_active ? "default" : "outline"}>
                      {participant.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{participant.available_slots?.length || 0} slots</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Link href={`/participants/${participant.id}/availability`}>
                        <Button variant="outline" size="icon">
                          <Calendar className="h-4 w-4" />
                          <span className="sr-only">Availability</span>
                        </Button>
                      </Link>
                      <Link href={`/participants/${participant.id}`}>
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </Link>
                      <Button variant="outline" size="icon" onClick={() => setDeleteId(participant.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the participant and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

