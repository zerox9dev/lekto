'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { CalendarDays, RefreshCw, Unlink } from 'lucide-react'
import { formatDateTime } from '@/lib/utils/format'
import type { GoogleCalendarToken } from '@/types'

interface Props {
  token: GoogleCalendarToken | null
}

export function GoogleCalendarBlock({ token }: Props) {
  const router = useRouter()
  const [syncing, setSyncing]     = useState(false)
  const [disconnecting, setDis]   = useState(false)

  async function handleSync() {
    setSyncing(true)
    const res = await fetch('/api/auth/google/sync', { method: 'POST' })
    setSyncing(false)
    if (res.ok) {
      toast.success('Синхронизация запущена')
      router.refresh()
    } else {
      toast.error('Ошибка синхронизации')
    }
  }

  async function handleDisconnect() {
    setDis(true)
    const supabase = createClient()
    const { error } = await supabase.from('google_calendar_tokens').delete().neq('id', '')
    setDis(false)
    if (error) { toast.error(error.message); return }
    toast.success('Google Calendar отключён')
    router.refresh()
  }

  return (
    <div>
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
        Google Calendar
      </h2>

      {token ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">Подключён</span>
          </div>

          {token.last_synced_at && (
            <p className="text-xs text-gray-400">
              Последняя синхронизация:{' '}
              {formatDateTime(token.last_synced_at)}
            </p>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              loading={syncing}
              onClick={handleSync}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Синхронизировать сейчас
            </Button>
            <Button
              variant="destructive"
              size="sm"
              loading={disconnecting}
              onClick={handleDisconnect}
            >
              <Unlink className="w-3.5 h-3.5" />
              Отключить
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Импортируйте уроки из Google Calendar. Lekto читает события только для чтения.
          </p>
          <Button asChild variant="secondary" size="sm">
            <a href="/api/auth/google/connect">
              <CalendarDays className="w-3.5 h-3.5" />
              Подключить Google Calendar
            </a>
          </Button>
        </div>
      )}
    </div>
  )
}
