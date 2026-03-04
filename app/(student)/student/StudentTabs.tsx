'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/student/homework', label: 'ДЗ' },
  { href: '/student/lessons', label: 'Уроки' },
  { href: '/student/chat', label: 'Чат' },
]

export function StudentTabs() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1">
      {tabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={[
              'h-8 rounded-md px-3 inline-flex items-center text-sm transition-colors',
              active
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800',
            ].join(' ')}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
