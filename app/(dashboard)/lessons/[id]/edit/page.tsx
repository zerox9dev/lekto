import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { LessonForm } from '@/components/lessons/LessonForm'

export const metadata = { title: 'Редактировать урок — Lekto' }

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [lessonResult, studentsResult] = await Promise.all([
    supabase.from('lessons').select('*').eq('id', id).single(),
    supabase.from('students').select('id, name').eq('status', 'active').order('name'),
  ])

  if (!lessonResult.data) notFound()

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/lessons/${id}`}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Редактировать урок</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <LessonForm lesson={lessonResult.data} students={studentsResult.data ?? []} />
      </div>
    </div>
  )
}
