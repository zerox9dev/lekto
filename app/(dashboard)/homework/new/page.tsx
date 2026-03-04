import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { HomeworkForm } from '@/components/homework/HomeworkForm'

export const metadata = { title: 'Новое задание — Lekto' }

export default async function NewHomeworkPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string; lessonId?: string }>
}) {
  const { studentId, lessonId } = await searchParams
  const supabase = await createClient()

  const { data: students } = await supabase
    .from('students')
    .select('id, name')
    .eq('status', 'active')
    .order('name')

  return (
    <div className="">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/homework"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Домашние задания
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Новое задание</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <HomeworkForm
          students={students ?? []}
          defaultStudentId={studentId}
          defaultLessonId={lessonId}
        />
      </div>
    </div>
  )
}
