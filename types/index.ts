export type StudentStatus = 'active' | 'archived'
export type LessonStatus = 'planned' | 'done' | 'cancelled'
export type HomeworkStatus = 'assigned' | 'submitted' | 'reviewed'

export interface TutorSettings {
  id: string
  user_id: string
  display_name: string | null
  default_price: number | null
  default_duration: number
  currency: string
  timezone: string
  created_at: string
  updated_at: string
}

export interface Subject {
  id: string
  tutor_id: string
  name: string
  color: string
  created_at: string
}

export interface Student {
  id: string
  tutor_id: string
  name: string
  contact: string | null
  level: string | null
  subject_id: string | null
  price_per_hour: number | null
  notes: string | null
  status: StudentStatus
  created_at: string
  updated_at: string
  subjects?: Subject
}

export interface Lesson {
  id: string
  student_id: string | null
  subject_id: string | null
  tutor_id: string | null
  scheduled_at: string
  duration_min: number
  topic: string | null
  notes: string | null
  status: LessonStatus
  is_paid: boolean
  google_event_id: string | null
  synced_from_google: boolean
  created_at: string
  updated_at: string
  students?: Pick<Student, 'id' | 'name' | 'level'>
  subjects?: Subject
}

export interface GoogleCalendarToken {
  id: string
  user_id: string
  access_token: string
  refresh_token: string
  expires_at: string
  calendar_id: string
  last_synced_at: string | null
  sync_token: string | null
  created_at: string
  updated_at: string
}

export interface Homework {
  id: string
  student_id: string
  lesson_id: string | null
  description: string
  deadline: string | null
  status: HomeworkStatus
  teacher_comment: string | null
  file_url: string | null
  created_at: string
  updated_at: string
  students?: Pick<Student, 'id' | 'name'>
}
