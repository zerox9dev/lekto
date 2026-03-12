import { supabase } from './supabase'
import { aiLessonSchema, aiHomeworkSchema } from './schemas'
import type { HomeworkSection } from '@/types/database'

const FUNCTION_URL = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-content`
  : null

interface GenerateOptions {
  type: 'lesson' | 'homework'
  topic: string
  language?: string
  level?: string
  lessonContent?: string
}

interface LessonResult {
  notes?: string
  sections: HomeworkSection[]
}

export async function generateContent(opts: GenerateOptions): Promise<LessonResult> {
  if (!FUNCTION_URL) throw new Error('Supabase not configured')

  const session = await (supabase as any).auth.getSession()
  const token = session?.data?.session?.access_token

  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    },
    body: JSON.stringify({
      type: opts.type,
      topic: opts.topic,
      language: opts.language || 'polish',
      level: opts.level || 'A1',
      lessonContent: opts.lessonContent,
    }),
  })

  const raw = await res.json()

  if (raw.error) {
    console.error('AI error:', raw)
    throw new Error(raw.details || raw.error || 'Unknown error')
  }

  // Validate with Zod
  const schema = opts.type === 'homework' ? aiHomeworkSchema : aiLessonSchema
  const parsed = schema.safeParse(raw)

  if (!parsed.success) {
    console.error('AI response validation failed:', parsed.error.issues)
    throw new Error('AI вернул некорректный формат. Попробуйте еще раз.')
  }

  return parsed.data as LessonResult
}
