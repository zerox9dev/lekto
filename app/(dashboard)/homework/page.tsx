import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { HomeworkClient } from './HomeworkClient'

export const metadata = { title: 'Домашние задания — Lekto' }

export default async function HomeworkPage() {
  const supabase = await createClient()

  const [hwResult, studentsResult] = await Promise.all([
    supabase
      .from('homework')
      .select('*, students(id, name, level)')
      .order('deadline', { ascending: true, nullsFirst: false }),
    supabase
      .from('students')
      .select('id, name')
      .eq('status', 'active')
      .order('name'),
  ])

  const homework = hwResult.data ?? []
  const students = studentsResult.data ?? []

  const pendingCount = homework.filter((h) => h.status === 'submitted').length

  return (
    <>
      <PageHeader
        title="Домашние задания"
        description={pendingCount > 0 ? `${pendingCount} ожидают проверки` : undefined}
        action={
          <Button asChild variant="primary" size="sm">
            <Link href="/homework/new">
              <Plus className="w-4 h-4" />
              Добавить
            </Link>
          </Button>
        }
      />
      <HomeworkClient homework={homework} students={students} />
    </>
  )
}
