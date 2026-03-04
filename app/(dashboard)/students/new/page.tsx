import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { StudentForm } from '@/components/students/StudentForm'

export const metadata = { title: 'Новый ученик — Lekto' }

export default function NewStudentPage() {
  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/students"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Новый ученик</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <StudentForm />
      </div>
    </div>
  )
}
