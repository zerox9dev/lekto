import Link from 'next/link'
import { notFound } from 'next/navigation'
import { GraduationCap } from 'lucide-react'
import { getPortalStudentByToken } from '@/lib/student-portal'

export const metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      noarchive: true,
    },
  },
}

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const student = await getPortalStudentByToken(token)
  if (!student) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={`/portal/${token}/homework`} className="inline-flex items-center gap-2 text-gray-900">
            <GraduationCap className="w-5 h-5 text-brand-600" />
            <span className="font-semibold tracking-tight">Lekto</span>
          </Link>
          <span className="text-sm text-gray-500">{student.name}</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-1">
          <Link href={`/portal/${token}/homework`} className="h-8 rounded-md px-3 inline-flex items-center text-sm text-gray-600 hover:bg-gray-100">
            ДЗ
          </Link>
          <Link href={`/portal/${token}/lessons`} className="h-8 rounded-md px-3 inline-flex items-center text-sm text-gray-600 hover:bg-gray-100">
            Уроки
          </Link>
          <Link href={`/portal/${token}/chat`} className="h-8 rounded-md px-3 inline-flex items-center text-sm text-gray-600 hover:bg-gray-100">
            Чат
          </Link>
        </nav>
      </div>

      <main className="max-w-5xl mx-auto px-4 pb-8">{children}</main>
    </div>
  )
}
