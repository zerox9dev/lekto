import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { HomeworkForm } from '@/components/homework/HomeworkForm'

export const metadata = { title: 'Редактировать задание — Lekto' }

export default async function EditHomeworkPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [hwResult, studentsResult] = await Promise.all([
    supabase.from('homework').select('*').eq('id', id).single(),
    supabase.from('students').select('id, name').eq('status', 'active').order('name'),
  ])

  if (!hwResult.data) notFound()

  return (
    <div className="">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/homework/${id}`}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Редактировать задание</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <HomeworkForm homework={hwResult.data} students={studentsResult.data ?? []} />
      </div>
    </div>
  )
}
