import Link from 'next/link'
import { redirect } from 'next/navigation'
import { GraduationCap } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { StudentSignOutButton } from './StudentSignOutButton'
import { StudentTabs } from './StudentTabs'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: student } = await supabase
    .from('students')
    .select('id, name')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!student) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/student/homework" className="inline-flex items-center gap-2 text-gray-900">
            <GraduationCap className="w-5 h-5 text-brand-600" />
            <span className="font-semibold tracking-tight">Lekto</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">{student.name}</span>
            <StudentSignOutButton />
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-4">
        <StudentTabs />
      </div>

      <main className="max-w-5xl mx-auto px-4 pb-8">{children}</main>
    </div>
  )
}
