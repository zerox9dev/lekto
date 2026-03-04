import Link from 'next/link'
import { addDays, startOfMonth, format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CheckCircle2, CalendarDays, BookOpen, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { StatCard } from './StatCard'
import { HomeworkCard } from '@/components/homework/HomeworkCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDuration, formatRelativeDay } from '@/lib/utils/format'
import type { Lesson, Student, Homework } from '@/types'

export const metadata = { title: 'Главная — Lekto' }

function getGreeting(): string {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'Доброе утро'
  if (h >= 12 && h < 18) return 'Добрый день'
  return 'Добрый вечер'
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const weekEnd = addDays(now, 7).toISOString()
  const monthStart = startOfMonth(now).toISOString()

  // Все запросы параллельно
  const [
    todayLessonsRes,
    upcomingRes,
    unreviewedHwRes,
    doneThisMonthRes,
    activeStudentsRes,
    settingsRes,
  ] = await Promise.all([
    // 1. Уроки сегодня
    supabase
      .from('lessons')
      .select('*, students(id, name, level)')
      .gte('scheduled_at', `${today}T00:00:00`)
      .lte('scheduled_at', `${today}T23:59:59`)
      .order('scheduled_at'),

    // 2. Ближайшие уроки (7 дней, кроме сегодня)
    supabase
      .from('lessons')
      .select('*, students(id, name, level)')
      .gt('scheduled_at', `${today}T23:59:59`)
      .lte('scheduled_at', weekEnd)
      .eq('status', 'planned')
      .order('scheduled_at')
      .limit(5),

    // 3. Непроверенные ДЗ
    supabase
      .from('homework')
      .select('*, students(id, name, level)')
      .eq('status', 'submitted')
      .order('deadline', { nullsFirst: false }),

    // 4. Уроки в месяце (для дохода/оплат)
    supabase
      .from('lessons')
      .select('*, students(id, name, price_per_hour)')
      .gte('scheduled_at', monthStart),

    // 5. Активные ученики
    supabase
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active'),

    // 6. Настройки репетитора
    supabase.from('tutor_settings').select('currency, display_name').single(),
  ])

  const todayLessons = (todayLessonsRes.data ?? []) as (Lesson & { students: Pick<Student, 'id' | 'name' | 'level'> | null })[]
  const upcomingLessons = (upcomingRes.data ?? []) as (Lesson & { students: Pick<Student, 'id' | 'name' | 'level'> | null })[]
  const unreviewedHw = (unreviewedHwRes.data ?? []) as (Homework & { students: Pick<Student, 'id' | 'name' | 'level'> | null })[]
  const monthLessons = (doneThisMonthRes.data ?? []) as (Lesson & { students: { price_per_hour: number | null } | null })[]

  const currency = settingsRes.data?.currency ?? 'USD'
  const displayName = settingsRes.data?.display_name

  const activeStudentsCount = activeStudentsRes.count ?? 0
  const doneCount = monthLessons.filter((l) => l.status === 'done').length

  // Доход за месяц: учитываем любые оплаченные уроки, включая cancelled.
  const monthIncome = monthLessons
    .filter((l) => l.is_paid)
    .reduce((sum, l) => {
      const price = l.students?.price_per_hour ?? 0
      return sum + price * (l.duration_min / 60)
    }, 0)

  // Неоплаченные уроки (как и раньше — только проведённые)
  const unpaidLessons = monthLessons.filter((l) => l.status === 'done' && !l.is_paid)

  // Долг (неоплаченная сумма по проведённым)
  const unpaidAmount = unpaidLessons.reduce((sum, l) => {
    const price = l.students?.price_per_hour ?? 0
    return sum + price * (l.duration_min / 60)
  }, 0)

  const greeting = getGreeting()
  const dateLabel = format(now, 'EEEE, d MMMM', { locale: ru })

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
          {greeting}{displayName ? `, ${displayName.split(' ')[0]}` : ''}!
        </h1>
        <p className="text-sm text-gray-400 mt-0.5 capitalize">{dateLabel}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Учеников"
          value={activeStudentsCount}
          sub="активных"
        />
        <StatCard
          label="Уроков в месяце"
          value={doneCount}
          sub="проведено"
        />
        <StatCard
          label="Доход в месяце"
          value={monthIncome > 0 ? formatCurrency(monthIncome, currency) : '—'}
          sub={unpaidAmount > 0 ? `${formatCurrency(unpaidAmount, currency)} не оплачено` : 'всё оплачено'}
        />
      </div>

      {/* Today's lessons */}
      <Section
        title="Уроки сегодня"
        count={todayLessons.length}
        action={
          <Button asChild variant="secondary" size="sm">
            <Link href="/lessons/new"><Plus className="w-3.5 h-3.5" />Создать</Link>
          </Button>
        }
      >
        {todayLessons.length === 0 ? (
          <EmptySection icon={<CalendarDays className="w-4 h-4 text-gray-400" />} text="Уроков сегодня нет" />
        ) : (
          <div className="divide-y divide-gray-50">
            {todayLessons.map((lesson) => (
              <LessonCompactRow key={lesson.id} lesson={lesson} currency={currency} showTime />
            ))}
          </div>
        )}
      </Section>

      {/* Upcoming lessons */}
      {upcomingLessons.length > 0 && (
        <Section title="Ближайшие уроки" count={upcomingLessons.length}>
          <div className="divide-y divide-gray-50">
            {upcomingLessons.map((lesson) => (
              <LessonCompactRow key={lesson.id} lesson={lesson} currency={currency} showDate />
            ))}
          </div>
        </Section>
      )}

      {/* Bottom 2-column grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Unreviewed HW */}
        <Section title="Ожидают проверки" count={unreviewedHw.length}>
          {unreviewedHw.length === 0 ? (
            <div className="flex items-center gap-2 py-4 text-sm text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              Всё проверено
            </div>
          ) : (
            <div className="space-y-2">
              {unreviewedHw.slice(0, 4).map((hw) => (
                <HomeworkCard key={hw.id} homework={hw} />
              ))}
              {unreviewedHw.length > 4 && (
                <Link href="/homework" className="block text-xs text-brand-600 hover:underline pt-1">
                  Ещё {unreviewedHw.length - 4} заданий →
                </Link>
              )}
            </div>
          )}
        </Section>

        {/* Unpaid lessons */}
        <Section title="Не оплачено" count={unpaidLessons.length}>
          {unpaidLessons.length === 0 ? (
            <div className="flex items-center gap-2 py-4 text-sm text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              Все уроки оплачены
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {unpaidLessons.slice(0, 5).map((lesson) => (
                <UnpaidRow key={lesson.id} lesson={lesson} currency={currency} />
              ))}
              {unpaidLessons.length > 5 && (
                <Link href="/lessons" className="block text-xs text-brand-600 hover:underline pt-2">
                  Ещё {unpaidLessons.length - 5} →
                </Link>
              )}
            </div>
          )}
        </Section>
      </div>
    </div>
  )
}

// ─── Локальные sub-компоненты ──────────────────────────────────────────────

function Section({
  title,
  count,
  action,
  children,
}: {
  title: string
  count?: number
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          {count !== undefined && count > 0 && (
            <span className="text-xs text-gray-400">{count}</span>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

function EmptySection({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 py-4 text-sm text-gray-400">
      {icon}
      {text}
    </div>
  )
}

type LessonRow = Lesson & { students: Pick<Student, 'id' | 'name' | 'level'> | null }

function LessonCompactRow({
  lesson,
  currency,
  showTime,
  showDate,
}: {
  lesson: LessonRow
  currency: string
  showTime?: boolean
  showDate?: boolean
}) {
  const time = new Date(lesson.scheduled_at).toLocaleTimeString('ru', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Link
      href={`/lessons/${lesson.id}`}
      className="flex items-center gap-3 py-3 hover:bg-gray-50/50 -mx-5 px-5 transition-colors"
    >
      {/* Time / Date */}
      <div className="w-20 shrink-0">
        {showDate && (
          <p className="text-xs text-gray-500">{formatRelativeDay(lesson.scheduled_at)}</p>
        )}
        {showTime && <p className="text-sm font-medium text-gray-900">{time}</p>}
        {showDate && <p className="text-xs text-gray-400">{time}</p>}
      </div>

      {/* Student + topic */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {lesson.students?.name ?? '—'}
          {lesson.students?.level && (
            <span className="text-xs text-gray-400 ml-1.5 font-normal">{lesson.students.level}</span>
          )}
        </p>
        {lesson.topic && (
          <p className="text-xs text-gray-400 truncate">{lesson.topic}</p>
        )}
      </div>

      {/* Duration + status */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-gray-400">{formatDuration(lesson.duration_min)}</span>
        <StatusBadge status={lesson.status} />
      </div>
    </Link>
  )
}

type UnpaidLesson = Lesson & { students: { id?: string; name?: string; price_per_hour: number | null } | null }

function UnpaidRow({ lesson, currency }: { lesson: UnpaidLesson; currency: string }) {
  const price = lesson.students?.price_per_hour ?? 0
  const amount = price * (lesson.duration_min / 60)

  return (
    <Link
      href={`/lessons/${lesson.id}`}
      className="flex items-center justify-between py-3 hover:bg-gray-50/50 -mx-5 px-5 transition-colors"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {(lesson.students as { name?: string } | null)?.name ?? '—'}
        </p>
        <p className="text-xs text-gray-400">{formatRelativeDay(lesson.scheduled_at)}</p>
      </div>
      {amount > 0 && (
        <span className="text-sm font-medium text-gray-700 shrink-0 ml-3">
          {formatCurrency(amount, currency)}
        </span>
      )}
    </Link>
  )
}
