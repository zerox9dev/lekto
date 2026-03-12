import { useState, useCallback, useEffect } from 'react'
import { insert, update, remove, removeWhere, query } from '@/lib/db'
import type { Homework } from '@/types/database'

function uid() { return crypto.randomUUID() }

// ── Module-level state ──
let _homework: Homework[] = []
let _loaded = false
let _loading = false
const _listeners = new Set<() => void>()
const notify = () => _listeners.forEach(fn => fn())

export function useHomework(tutorId?: string) {
  const [, setTick] = useState(0)

  useEffect(() => {
    const fn = () => setTick(t => t + 1)
    _listeners.add(fn)
    return () => { _listeners.delete(fn) }
  }, [])

  useEffect(() => {
    if (_loaded || _loading || !tutorId) return
    _loading = true
    query<Homework>('homework', { tutor_id: tutorId }, { col: 'created_at', asc: false })
      .then(data => { _homework = data; _loaded = true; _loading = false; notify() })
      .catch(() => { _loading = false })
  }, [tutorId])

  const addHomework = useCallback(async (data: Omit<Homework, 'id' | 'created_at'>) => {
    const h: Homework = {
      ...data,
      id: uid(),
      tutor_id: tutorId!,
      created_at: new Date().toISOString(),
    }
    _homework = [h, ..._homework]
    notify()
    await insert('homework', h)
    return h
  }, [tutorId])

  const updateHomework = useCallback(async (id: string, data: Partial<Homework>) => {
    _homework = _homework.map(h => h.id === id ? { ...h, ...data } : h)
    notify()
    await update('homework', id, data)
  }, [])

  const deleteHomework = useCallback(async (id: string) => {
    _homework = _homework.filter(h => h.id !== id)
    notify()
    await remove('homework', id)
  }, [])

  /** Remove homework for a deleted student */
  const removeHomeworkForStudent = useCallback((studentId: string) => {
    _homework = _homework.filter(h => h.student_id !== studentId)
    notify()
  }, [])

  /** Remove homework for a deleted lesson */
  const removeHomeworkForLesson = useCallback((lessonId: string) => {
    _homework = _homework.filter(h => h.lesson_id !== lessonId)
    notify()
  }, [])

  return {
    homework: _homework,
    addHomework,
    updateHomework,
    deleteHomework,
    removeHomeworkForStudent,
    removeHomeworkForLesson,
  }
}
