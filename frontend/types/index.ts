export interface TimeSlot {
  id: number
  date: string
  start_time: number
  end_time: number
  participant_id?: number
}

export interface Participant {
  id: number
  name: string
  email: string
  is_active: boolean
  available_slots: TimeSlot[]
}

export interface ScheduledSlot {
  id: number
  date: string
  start_time: number
  end_time: number
}

export interface Meeting {
  id: number
  name: string
  date: string
  duration: number
  minimum_participants: number
  participants: number[]
  scheduled_slot?: ScheduledSlot
}

export interface MeetingScheduleResult {
  meeting_id: number
  name: string
  scheduled: boolean
  time_slot?: ScheduledSlot
  participants: number[]
  error?: string
}

