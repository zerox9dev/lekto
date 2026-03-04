import { z } from 'zod'

// Схема для react-hook-form (price как строка — так браузер отдаёт из input[type=number])
export const studentFormSchema = z.object({
  name: z.string().min(1, 'Обязательное поле'),
  contact: z.string().optional(),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional(),
  price_per_hour: z.string().optional(),
  notes: z.string().max(1000, 'Максимум 1000 символов').optional(),
})

export type StudentFormData = z.infer<typeof studentFormSchema>

// Хелпер: конвертация строки в число для API
export function parsePricePerHour(val?: string): number | null {
  if (!val || val.trim() === '') return null
  const n = parseFloat(val)
  return isNaN(n) || n <= 0 ? null : n
}
