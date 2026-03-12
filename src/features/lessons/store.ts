import { useState, useCallback, useEffect } from 'react'
import { insert, update, remove, removeWhere, query } from '@/lib/db'
import type { Lesson } from '@/types/database'

function uid() { return crypto.randomUUID() }

// ── Module-level state ──
let _lessons: Lesson[] = []
let _loaded = false
let _loading = false
const _listeners = new Set<() => void>()
const notify = () => _listeners.forEach(fn => fn())

export function useLessons(tutorId?: string) {
  const [, setTick] = useState(0)

  useEffect(() => {
    const fn = () => setTick(t => t + 1)
    _listeners.add(fn)
    return () => { _listeners.delete(fn) }
  }, [])

  useEffect(() => {
    if (_loaded || _loading || !tutorId) return
    _loading = true
    query<Lesson>('lessons', { tutor_id: tutorId }, { col: 'date', asc: false })
      .then(data => { _lessons = data; _loaded = true; _loading = false; notify() })
      .catch(() => { _loading = false })
  }, [tutorId])

  const addLesson = useCallback(async (
    studentId: string | null,
    title: string,
    date: string,
    notes?: string,
    sections?: Lesson['sections'],
    courseId?: string,
    orderIndex?: number,
  ) => {
    const l: Lesson = {
      id: uid(),
      student_id: studentId ?? (null as any),
      tutor_id: tutorId!,
      title, date,
      notes: notes || null,
      materials_url: null,
      sections: sections && sections.length > 0 ? sections : undefined,
      course_id: courseId || null,
      order_index: orderIndex ?? 0,
      created_at: new Date().toISOString(),
    }
    _lessons = [l, ..._lessons]
    notify()
    await insert('lessons', l)
    return l
  }, [tutorId])

  const updateLesson = useCallback(async (id: string, data: Partial<Lesson>) => {
    _lessons = _lessons.map(l => l.id === id ? { ...l, ...data } : l)
    notify()
    await update('lessons', id, data)
  }, [])

  const deleteLesson = useCallback(async (id: string) => {
    _lessons = _lessons.filter(l => l.id !== id)
    notify()
    await remove('lessons', id)
    await removeWhere('homework', 'lesson_id', id).catch(() => {})
  }, [])

  /** Remove lessons for a deleted student (called from students store) */
  const removeLessonsForStudent = useCallback((studentId: string) => {
    _lessons = _lessons.filter(l => l.student_id !== studentId)
    notify()
  }, [])

  /** Unlink lessons from a deleted course */
  const unlinkCourse = useCallback((courseId: string) => {
    _lessons = _lessons.map(l =>
      l.course_id === courseId ? { ...l, course_id: null } : l,
    )
    notify()
  }, [])

  return {
    lessons: _lessons,
    addLesson,
    updateLesson,
    deleteLesson,
    removeLessonsForStudent,
    unlinkCourse,
  }
}
