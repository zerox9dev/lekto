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

interface SyncResponse {
  totalFetched: number
  filteredNonLesson: number
  processedTimedEvents: number
  imported: number
  updated: number
  cancelled: number
  skippedAllDay: number
  skippedNoStart: number
  skippedNoStudentMatch: number
  failedUpserts: number
  sampleEvents: Array<{
    id: string
    summary: string | null
    status: string
    start: string | null
    allDay: boolean
  }>
}

export function GoogleCalendarBlock({ token }: Props) {
  const router = useRouter()
  const [syncing, setSyncing]     = useState(false)
  const [disconnecting, setDis]   = useState(false)
  const [lastSyncResult, setLastSyncResult] = useState<SyncResponse | null>(null)

  async function handleSync() {
    setSyncing(true)
    const res = await fetch('/api/auth/google/sync', { method: 'POST' })
    setSyncing(false)
    if (res.ok) {
      const data = (await res.json()) as SyncResponse
      setLastSyncResult(data)
      if (data.totalFetched === 0) {
        toast.message('Событий не найдено в выбранном диапазоне')
      } else if (data.imported + data.updated + data.cancelled === 0) {
        toast.message('События получены, но не было изменений в уроках')
      } else {
        toast.success(
          `Импорт: ${data.imported}, обновлено: ${data.updated}, отменено: ${data.cancelled}`
        )
      }
      router.refresh()
    } else {
      const errorData = await res.json().catch(() => ({ error: 'Ошибка синхронизации' }))
      toast.error(errorData.error ?? 'Ошибка синхронизации')
    }
  }

  async function handleDisconnect() {
    setDis(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('google_calendar_tokens')
      .delete()
      .eq('user_id', token?.user_id ?? '')
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

          {lastSyncResult && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-2">
              <p className="text-xs font-medium text-gray-600">
                Результат последней синхронизации
              </p>
              <p className="text-xs text-gray-500">
                Получено событий: {lastSyncResult.totalFetched}, с временем: {lastSyncResult.processedTimedEvents}
              </p>
              <p className="text-xs text-gray-500">
                Отфильтровано как не уроки Preply: {lastSyncResult.filteredNonLesson}
              </p>
              <p className="text-xs text-gray-500">
                Импортировано: {lastSyncResult.imported}, обновлено: {lastSyncResult.updated}, отменено: {lastSyncResult.cancelled}
              </p>
              <p className="text-xs text-gray-500">
                Пропущено: весь день {lastSyncResult.skippedAllDay}, без времени начала {lastSyncResult.skippedNoStart}
              </p>
              <p className="text-xs text-gray-500">
                Пропущено: не найден студент {lastSyncResult.skippedNoStudentMatch}, ошибки записи {lastSyncResult.failedUpserts}
              </p>
              {lastSyncResult.sampleEvents.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600">Примеры событий из Google:</p>
                  {lastSyncResult.sampleEvents.map((event) => (
                    <p key={event.id} className="text-xs text-gray-500 truncate">
                      {event.start ?? 'без даты'} · {event.summary ?? 'Без названия'} · {event.status}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
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
