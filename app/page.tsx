import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArrowRight, GraduationCap } from 'lucide-react'

export const metadata = { title: 'Lekto — платформа для репетиторов' }

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 h-14">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900 tracking-tight">Lekto</span>
          </div>
          <Link
            href="/login"
            className="h-8 px-4 inline-flex items-center rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Войти
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <main className="flex flex-1 items-center justify-center relative overflow-hidden px-6">
        {/* Dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Glow */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-brand-500/8 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-2xl text-center py-32">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            Для репетиторов всех предметов
          </div>

          <h1 className="mb-5 text-5xl font-bold tracking-tight leading-[1.15] text-gray-900">
            Всё для репетитора —{' '}
            <span className="bg-gradient-to-r from-brand-600 to-brand-500 bg-clip-text text-transparent">
              в одном месте
            </span>
          </h1>

          <p className="mb-10 text-base text-gray-500 leading-relaxed max-w-md mx-auto">
            Ученики, расписание, домашние задания и Google Calendar.
            Меньше рутины — больше времени на обучение.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link
              href="/login"
              className="h-10 px-6 inline-flex items-center gap-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors shadow-sm"
            >
              Начать бесплатно
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="h-10 px-6 inline-flex items-center rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Войти
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
