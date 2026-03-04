import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { LessonForm } from '@/components/lessons/LessonForm'

export const metadata = { title: 'Новый урок — Lekto' }

export default async function NewLessonPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>
}) {
  const { studentId } = await searchParams
  const supabase = await createClient()

  const { data: students } = await supabase
    .from('students')
    .select('id, name')
    .eq('status', 'active')
    .order('name')

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/lessons"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Уроки
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Новый урок</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <LessonForm students={students ?? []} defaultStudentId={studentId} />
      </div>
    </div>
  )
}
