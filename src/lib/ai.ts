import { supabase } from './supabase'
import type { HomeworkSection, Lesson } from '@/types/database'

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

  const data = await res.json()

  if (data.error) {
    console.error('AI error:', data)
    throw new Error(data.details || data.error || 'Unknown error')
  }

  // Ensure sections have ids
  if (data.sections) {
    data.sections = data.sections.map((s: any) => ({
      ...s,
      id: s.id || crypto.randomUUID(),
    }))
  }

  return data
}
