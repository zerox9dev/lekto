import Link from 'next/link'
import { Plus } from 'lucide-react'
import { subDays } from 'date-fns'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { LessonsClient } from './LessonsClient'

export const metadata = { title: 'Уроки — Lekto' }

export default async function LessonsPage() {
  const supabase = await createClient()
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString()

  const [lessonsResult, studentsResult] = await Promise.all([
    supabase
      .from('lessons')
      .select('*, students(id, name, level)')
      .gte('scheduled_at', thirtyDaysAgo)
      .order('scheduled_at', { ascending: false }),
    supabase
      .from('students')
      .select('id, name')
      .eq('status', 'active')
      .order('name'),
  ])

  const lessons = lessonsResult.data ?? []
  const students = studentsResult.data ?? []

  return (
    <>
      <PageHeader
        title="Уроки"
        description={`${lessons.length} за последние 30 дней`}
        action={
          <Button asChild variant="primary" size="sm">
            <Link href="/lessons/new">
              <Plus className="w-4 h-4" />
              Создать
            </Link>
          </Button>
        }
      />
      <LessonsClient lessons={lessons} students={students} />
    </>
  )
}
