import { z } from 'zod'

export const lessonFormSchema = z.object({
  student_id: z.string().min(1, 'Выберите ученика'),
  date: z.string().min(1, 'Укажите дату'),
  time: z.string().min(1, 'Укажите время'),
  duration_min: z.string().min(1, 'Укажите длительность'),
  topic: z.string().max(200, 'Максимум 200 символов').optional(),
  status: z.enum(['planned', 'done', 'cancelled']),
  is_paid: z.boolean(),
})

export type LessonFormData = z.infer<typeof lessonFormSchema>

export const DURATION_OPTIONS = [
  { value: '30',  label: '30 мин' },
  { value: '45',  label: '45 мин' },
  { value: '60',  label: '60 мин' },
  { value: '75',  label: '75 мин' },
  { value: '90',  label: '90 мин' },
  { value: '120', label: '2 часа' },
]

export const STATUS_OPTIONS = [
  { value: 'planned',   label: 'Запланирован' },
  { value: 'done',      label: 'Проведён' },
  { value: 'cancelled', label: 'Отменён' },
]

/** Склеить дату + время в ISO строку */
export function buildScheduledAt(date: string, time: string): string {
  return new Date(`${date}T${time}`).toISOString()
}

/** Разобрать ISO в date + time для формы */
export function splitScheduledAt(iso: string): { date: string; time: string } {
  const d = new Date(iso)
  const date = d.toISOString().split('T')[0]
  const time = d.toTimeString().slice(0, 5)
  return { date, time }
}
