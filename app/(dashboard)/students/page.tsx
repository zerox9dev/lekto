import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { StudentsClient } from './StudentsClient'

export const metadata = { title: 'Ученики — Lekto' }

export default async function StudentsPage() {
  const supabase = await createClient()

  const [studentsResult, settingsResult] = await Promise.all([
    supabase
      .from('students')
      .select('*')
      .order('name'),
    supabase
      .from('tutor_settings')
      .select('currency')
      .single(),
  ])

  const students = studentsResult.data ?? []
  const currency = settingsResult.data?.currency ?? 'USD'

  return (
    <>
      <PageHeader
        title="Ученики"
        description={`${students.filter((s) => s.status === 'active').length} активных`}
        action={
          <Button asChild variant="primary" size="sm">
            <Link href="/students/new">
              <Plus className="w-4 h-4" />
              Добавить
            </Link>
          </Button>
        }
      />
      <StudentsClient students={students} currency={currency} />
    </>
  )
}
