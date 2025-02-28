import type { Meeting, Participant, TimeSlot, MeetingScheduleResult } from "../types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Participant API calls
export async function getParticipants(): Promise<Participant[]> {
  const response = await fetch(`${API_URL}/participants`)
  if (!response.ok) {
    throw new Error("Failed to fetch participants")
  }
  return response.json()
}

export async function getParticipant(id: number): Promise<Participant> {
  const response = await fetch(`${API_URL}/participants/${id}`)
  if (!response.ok) {
    throw new Error("Failed to fetch participant")
  }
  return response.json()
}

export async function createParticipant(
  participant: Omit<Participant, "id" | "available_slots">,
): Promise<Participant> {
  const response = await fetch(`${API_URL}/participants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(participant),
  })
  if (!response.ok) {
    throw new Error("Failed to create participant")
  }
  return response.json()
}

export async function updateParticipant(
  id: number,
  participant: Omit<Participant, "id" | "available_slots">,
): Promise<Participant> {
  const response = await fetch(`${API_URL}/participants/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(participant),
  })
  if (!response.ok) {
    throw new Error("Failed to update participant")
  }
  return response.json()
}

export async function deleteParticipant(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/participants/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    throw new Error("Failed to delete participant")
  }
}

export async function getParticipantTimeSlots(id: number): Promise<TimeSlot[]> {
  const response = await fetch(`${API_URL}/participants/${id}/timeslots`)
  if (!response.ok) {
    throw new Error("Failed to fetch time slots")
  }
  return response.json()
}

export async function addParticipantTimeSlot(id: number, timeSlot: Omit<TimeSlot, "id">): Promise<TimeSlot> {
  const response = await fetch(`${API_URL}/participants/${id}/timeslots`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(timeSlot),
  })
  if (!response.ok) {
    throw new Error("Failed to add time slot")
  }
  return response.json()
}

// Meeting API calls
export async function getMeetings(): Promise<Meeting[]> {
  const response = await fetch(`${API_URL}/meetings`)
  if (!response.ok) {
    throw new Error("Failed to fetch meetings")
  }
  return response.json()
}

export async function getMeeting(id: number): Promise<Meeting> {
  const response = await fetch(`${API_URL}/meetings/${id}`)
  if (!response.ok) {
    throw new Error("Failed to fetch meeting")
  }
  return response.json()
}

export async function createMeeting(
  meeting: Omit<Meeting, "id" | "scheduled_slot"> & { participant_ids: number[] },
): Promise<Meeting> {
  const response = await fetch(`${API_URL}/meetings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(meeting),
  })
  if (!response.ok) {
    throw new Error("Failed to create meeting")
  }
  return response.json()
}

export async function updateMeeting(
  id: number,
  meeting: Omit<Meeting, "id" | "scheduled_slot"> & { participant_ids: number[] },
): Promise<Meeting> {
  const response = await fetch(`${API_URL}/meetings/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(meeting),
  })
  if (!response.ok) {
    throw new Error("Failed to update meeting")
  }
  return response.json()
}

export async function deleteMeeting(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/meetings/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    throw new Error("Failed to delete meeting")
  }
}

// Scheduling API calls
export async function runScheduling(): Promise<MeetingScheduleResult[]> {
  const response = await fetch(`${API_URL}/scheduling/run`, {
    method: "POST",
  })
  if (!response.ok) {
    throw new Error("Failed to run scheduling")
  }
  return response.json()
}

export async function getSchedulingStatus(): Promise<MeetingScheduleResult[]> {
  const response = await fetch(`${API_URL}/scheduling/status`)
  if (!response.ok) {
    throw new Error("Failed to fetch scheduling status")
  }
  return response.json()
}

