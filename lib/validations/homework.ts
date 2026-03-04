import { z } from 'zod'

export const homeworkFormSchema = z.object({
  student_id: z.string().min(1, 'Выберите ученика'),
  lesson_id:  z.string().optional().nullable(),
  description: z.string().min(1, 'Обязательное поле').max(2000, 'Максимум 2000 символов'),
  deadline:   z.string().optional().nullable(),
  file_url:   z.string().optional().nullable(),
  interactive_tasks: z.unknown().optional().nullable(),
})

export type HomeworkFormData = z.infer<typeof homeworkFormSchema>
