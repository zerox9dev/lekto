'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  BookOpen,
  Settings,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const navItems = [
  { href: '/dashboard', label: 'Главная',   icon: LayoutDashboard },
  { href: '/students',  label: 'Ученики',   icon: Users },
  { href: '/lessons',   label: 'Уроки',     icon: CalendarDays },
  { href: '/homework',  label: 'Домашние задания', icon: BookOpen },
]

const bottomItems = [
  { href: '/settings', label: 'Настройки', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  async function handleSignOut() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Ошибка при выходе')
      return
    }
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-60 shrink-0 h-screen bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-200">
        <span className="text-base font-semibold text-gray-900 tracking-tight">Lekto</span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={[
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
              isActive(href)
                ? 'bg-white border border-gray-200 text-gray-900 font-medium shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
            ].join(' ')}
          >
            <Icon
              className={`w-4 h-4 shrink-0 ${isActive(href) ? 'text-brand-600' : 'text-gray-400'}`}
            />
            {label}
          </Link>
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="px-3 pb-4 space-y-0.5 border-t border-gray-200 pt-3">
        {bottomItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={[
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
              isActive(href)
                ? 'bg-white border border-gray-200 text-gray-900 font-medium shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
            ].join(' ')}
          >
            <Icon
              className={`w-4 h-4 shrink-0 ${isActive(href) ? 'text-brand-600' : 'text-gray-400'}`}
            />
            {label}
          </Link>
        ))}

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0 text-gray-400" />
          Выйти
        </button>
      </div>
    </aside>
  )
}
