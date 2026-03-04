import { createServiceClient } from '@/lib/supabase/service'
import { getAccessToken } from './getAccessToken'

interface GoogleEvent {
  id: string
  status: string
  summary?: string
  description?: string
  start?: { dateTime?: string; date?: string }
  end?: { dateTime?: string; date?: string }
}

interface GoogleEventsResponse {
  items?: GoogleEvent[]
  nextSyncToken?: string
}

export interface GoogleSyncResult {
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
  syncRange: { from: string; to: string } | null
  nextSyncTokenReceived: boolean
  sampleEvents: Array<{
    id: string
    summary: string | null
    status: string
    start: string | null
    allDay: boolean
  }>
}

function normalizeText(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, ' ')
}

function isPreplyLessonTitle(summary?: string): boolean {
  if (!summary) return false
  return /-\s*preply lesson\s*$/i.test(summary.trim())
}

function extractPreplyStudentName(summary?: string): string | null {
  if (!summary) return null
  const match = summary.trim().match(/^(.*?)\s*-\s*preply lesson\s*$/i)
  if (!match?.[1]) return null
  return match[1].trim()
}

interface ImportOptions {
  manualMapping?: boolean
}

export async function importGoogleEvents(
  userId: string,
  options: ImportOptions = {}
): Promise<GoogleSyncResult> {
  const supabase = createServiceClient()
  const accessToken = await getAccessToken(userId)

  const { data: tokenRow } = await supabase
    .from('google_calendar_tokens')
    .select('calendar_id, sync_token')
    .eq('user_id', userId)
    .single()

  if (!tokenRow) throw new Error('Token row not found')

  const initialFrom = new Date(Date.now() - 30 * 86400000).toISOString()
  const initialTo = new Date(Date.now() + 90 * 86400000).toISOString()
  const syncRange = tokenRow.sync_token ? null : { from: initialFrom, to: initialTo }

  const params = new URLSearchParams({
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
    ...(tokenRow.sync_token
      ? { syncToken: tokenRow.sync_token }
      : {
          timeMin: initialFrom,
          timeMax: initialTo,
        }),
  })

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(tokenRow.calendar_id)}/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  // syncToken expired -> full re-sync
  if (res.status === 410) {
    await supabase
      .from('google_calendar_tokens')
      .update({ sync_token: null })
      .eq('user_id', userId)
    return importGoogleEvents(userId)
  }

  if (!res.ok) throw new Error(`Google Calendar API error: ${res.status}`)

  const data = (await res.json()) as GoogleEventsResponse
  const events = data.items ?? []

  const { data: students } = await supabase
    .from('students')
    .select('id, name')
    .eq('tutor_id', userId)
    .eq('status', 'active')

  const knownStudents = [...(students ?? [])]

  const { data: mappings } = await supabase
    .from('preply_student_mappings')
    .select('preply_name, student_id')
    .eq('user_id', userId)

  const mappingByName = new Map(
    (mappings ?? []).map((m) => [normalizeText(m.preply_name), m.student_id] as const)
  )

  const result: GoogleSyncResult = {
    totalFetched: events.length,
    filteredNonLesson: 0,
    processedTimedEvents: 0,
    createdStudents: 0,
    imported: 0,
    updated: 0,
    cancelled: 0,
    skippedAllDay: 0,
    skippedNoStart: 0,
    skippedNoStudentMatch: 0,
    failedUpserts: 0,
    sampleErrors: [],
    unmappedNames: [],
    syncRange,
    nextSyncTokenReceived: Boolean(data.nextSyncToken),
    sampleEvents: events.slice(0, 5).map((event) => ({
      id: event.id,
      summary: event.summary ?? null,
      status: event.status,
      start: event.start?.dateTime ?? event.start?.date ?? null,
      allDay: Boolean(event.start?.date && !event.start?.dateTime),
    })),
  }

  const lessonCandidates = events.filter((event) => {
    const isLesson = isPreplyLessonTitle(event.summary)
    if (!isLesson) result.filteredNonLesson += 1
    return isLesson
  })

  const timedEvents = lessonCandidates.filter((event) => {
    if (!event.start) {
      result.skippedNoStart += 1
      return false
    }
    if (!event.start.dateTime) {
      result.skippedAllDay += 1
      return false
    }
    return true
  })

  result.processedTimedEvents = timedEvents.length

  const timedEventIds = timedEvents.map((e) => e.id)
  const existingIds = new Set<string>()

  if (timedEventIds.length > 0) {
    const { data: existingLessons } = await supabase
      .from('lessons')
      .select('google_event_id')
      .in('google_event_id', timedEventIds)

    for (const row of existingLessons ?? []) {
      if (row.google_event_id) existingIds.add(row.google_event_id)
    }
  }

  for (const event of timedEvents) {
    if (event.status === 'cancelled') {
      const { error, count } = await supabase
        .from('lessons')
        .update({ status: 'cancelled' }, { count: 'exact' })
        .eq('google_event_id', event.id)

      if (!error && (count ?? 0) > 0) {
        result.cancelled += 1
      }
      continue
    }

    const scheduledAt = event.start!.dateTime!
    const endAt = event.end?.dateTime ?? scheduledAt
    const durationMin = Math.max(
      1,
      Math.round((new Date(endAt).getTime() - new Date(scheduledAt).getTime()) / 60000)
    )

    const preplyStudentName = extractPreplyStudentName(event.summary)
    const normalizedCandidate = preplyStudentName ? normalizeText(preplyStudentName) : null

    let matchedStudent =
      (normalizedCandidate && mappingByName.has(normalizedCandidate)
        ? knownStudents.find((s) => s.id === mappingByName.get(normalizedCandidate))
        : null) ??
      knownStudents.find((s) => normalizeText(s.name) === normalizedCandidate) ??
      knownStudents.find((s) => event.summary?.toLowerCase().includes(s.name.toLowerCase())) ??
      null

    if (!matchedStudent) {
      if (options.manualMapping) {
        result.skippedNoStudentMatch += 1
        if (preplyStudentName && !result.unmappedNames.includes(preplyStudentName)) {
          result.unmappedNames.push(preplyStudentName)
        }
        continue
      }

      const studentName = preplyStudentName ?? event.summary?.trim() ?? 'Preply student'
      const { data: createdStudent, error: createStudentError } = await supabase
        .from('students')
        .insert({
          tutor_id: userId,
          name: studentName,
          status: 'active',
        })
        .select('id, name')
        .single()

      if (createStudentError || !createdStudent) {
        result.skippedNoStudentMatch += 1
        continue
      }

      knownStudents.push(createdStudent)
      matchedStudent = createdStudent
      result.createdStudents += 1
    }

    const lessonPayload = {
      google_event_id: event.id,
      synced_from_google: true,
      tutor_id: userId,
      student_id: matchedStudent?.id ?? null,
      scheduled_at: scheduledAt,
      duration_min: durationMin,
      topic: event.summary ?? null,
      notes: event.description ?? null,
      status: 'planned',
      is_paid: false,
    }

    const { error } = existingIds.has(event.id)
      ? await supabase
          .from('lessons')
          .update(lessonPayload)
          .eq('google_event_id', event.id)
      : await supabase
          .from('lessons')
          .insert(lessonPayload)

    if (error) {
      // Continue processing rest of events and surface aggregate progress in UI.
      result.failedUpserts += 1
      if (result.sampleErrors.length < 5) {
        result.sampleErrors.push(error.message)
      }
      continue
    }

    if (existingIds.has(event.id)) {
      result.updated += 1
    } else {
      result.imported += 1
    }
  }

  await supabase
    .from('google_calendar_tokens')
    .update({
      sync_token: data.nextSyncToken ?? null,
      last_synced_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  return result
}
