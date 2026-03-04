'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { CalendarDays, RefreshCw, Unlink } from 'lucide-react'
import { formatDateTime } from '@/lib/utils/format'
import type { GoogleCalendarToken } from '@/types'

interface Props {
  token: GoogleCalendarToken | null
  students: Array<{ id: string; name: string }>
}

interface SyncResponse {
  totalFetched: number
  filteredNonLesson: number
  processedTimedEvents: number
  createdStudents: number
  imported: number
  updated: number
  cancelled: number
  skippedAllDay: number
  skippedNoStart: number
  skippedNoStudentMatch: number
  failedUpserts: number
  sampleErrors: string[]
  unmappedNames: string[]
  sampleEvents: Array<{
    id: string
    summary: string | null
    status: string
    start: string | null
    allDay: boolean
  }>
}

interface CalendarOption {
  id: string
  name: string
  primary: boolean
}

export function GoogleCalendarBlock({ token, students }: Props) {
  const router = useRouter()
  const [syncing, setSyncing]     = useState(false)
  const [disconnecting, setDis]   = useState(false)
  const [loadingCalendars, setLoadingCalendars] = useState(false)
  const [savingCalendar, setSavingCalendar] = useState(false)
  const [savingMappingFor, setSavingMappingFor] = useState<string | null>(null)
  const [calendarOptions, setCalendarOptions] = useState<CalendarOption[]>([])
  const [selectedCalendarId, setSelectedCalendarId] = useState(token?.calendar_id ?? 'primary')
  const [mappingSelections, setMappingSelections] = useState<Record<string, string>>({})
  const [lastSyncResult, setLastSyncResult] = useState<SyncResponse | null>(null)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    async function loadCalendars() {
      setLoadingCalendars(true)
      const res = await fetch('/api/auth/google/calendars')
      setLoadingCalendars(false)
      if (!res.ok) return

      const data = (await res.json()) as { calendars?: CalendarOption[] }
      if (!cancelled) {
        setCalendarOptions(data.calendars ?? [])
      }
    }
    loadCalendars().catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [token])

  async function handleSync(manualMapping = false) {
    setSyncing(true)
    const res = await fetch('/api/auth/google/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ manualMapping }),
    })
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
          `Импорт: ${data.imported}, обновлено: ${data.updated}, создано учеников: ${data.createdStudents}`
        )
      }
      router.refresh()
    } else {
      const errorData = await res.json().catch(() => ({ error: 'Ошибка синхронизации' }))
      toast.error(errorData.error ?? 'Ошибка синхронизации')
    }
  }

  async function saveMapping(preplyName: string) {
    const studentId = mappingSelections[preplyName]
    if (!studentId) {
      toast.error('Выберите ученика для маппинга')
      return
    }

    setSavingMappingFor(preplyName)
    const res = await fetch('/api/auth/google/preply-mappings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preplyName, studentId }),
    })
    setSavingMappingFor(null)

    if (!res.ok) {
      const payload = await res.json().catch(() => ({ error: 'Ошибка сохранения маппинга' }))
      toast.error(payload.error ?? 'Ошибка сохранения маппинга')
      return
    }

    toast.success(`Маппинг сохранён: ${preplyName}`)
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

  async function handleSaveCalendar() {
    setSavingCalendar(true)
    const res = await fetch('/api/auth/google/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calendarId: selectedCalendarId }),
    })
    setSavingCalendar(false)

    if (!res.ok) {
      const payload = await res.json().catch(() => ({ error: 'Ошибка сохранения календаря' }))
      toast.error(payload.error ?? 'Ошибка сохранения календаря')
      return
    }

    toast.success('Календарь для импорта сохранён')
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
              onClick={() => handleSync(false)}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Синхронизировать (авто)
            </Button>
            <Button
              variant="secondary"
              size="sm"
              loading={syncing}
              onClick={() => handleSync(true)}
            >
              Ручная синхронизация
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

          <div className="space-y-2">
            <Label htmlFor="calendar-id">Календарь для импорта</Label>
            <div className="flex items-center gap-2">
              <select
                id="calendar-id"
                value={selectedCalendarId}
                onChange={(e) => setSelectedCalendarId(e.target.value)}
                className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/15 focus:border-brand-500"
                disabled={loadingCalendars || savingCalendar}
              >
                {calendarOptions.length === 0 ? (
                  <option value={token.calendar_id}>
                    {token.calendar_id}
                  </option>
                ) : (
                  calendarOptions.map((calendar) => (
                    <option key={calendar.id} value={calendar.id}>
                      {calendar.name}
                      {calendar.primary ? ' (primary)' : ''}
                    </option>
                  ))
                )}
              </select>
              <Button
                variant="secondary"
                size="sm"
                loading={savingCalendar}
                onClick={handleSaveCalendar}
                disabled={!selectedCalendarId || selectedCalendarId === token.calendar_id}
              >
                Сохранить
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              {loadingCalendars ? 'Загружаем доступные календари...' : 'Выберите календарь, откуда импортировать уроки'}
            </p>
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
                Автосоздано учеников: {lastSyncResult.createdStudents}
              </p>
              <p className="text-xs text-gray-500">
                Пропущено: весь день {lastSyncResult.skippedAllDay}, без времени начала {lastSyncResult.skippedNoStart}
              </p>
              <p className="text-xs text-gray-500">
                Пропущено: не найден студент {lastSyncResult.skippedNoStudentMatch}, ошибки записи {lastSyncResult.failedUpserts}
              </p>
              {lastSyncResult.sampleErrors.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-red-600">Ошибки импорта (примеры):</p>
                  {lastSyncResult.sampleErrors.map((err, idx) => (
                    <p key={`${idx}-${err}`} className="text-xs text-red-500 truncate">
                      {err}
                    </p>
                  ))}
                </div>
              )}
              {lastSyncResult.unmappedNames.length > 0 && (
                <div className="space-y-2 pt-1">
                  <p className="text-xs font-medium text-gray-600">
                    Ручной маппинг (имя из Preply -&gt; ученик Lekto)
                  </p>
                  {lastSyncResult.unmappedNames.map((name) => (
                    <div key={name} className="flex items-center gap-2">
                      <p className="text-xs text-gray-600 min-w-[140px] truncate">{name}</p>
                      <select
                        value={mappingSelections[name] ?? ''}
                        onChange={(e) =>
                          setMappingSelections((prev) => ({ ...prev, [name]: e.target.value }))
                        }
                        className="h-8 w-full rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-900"
                      >
                        <option value="">Выберите ученика</option>
                        {students.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={savingMappingFor === name}
                        onClick={() => saveMapping(name)}
                      >
                        Сохранить
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
