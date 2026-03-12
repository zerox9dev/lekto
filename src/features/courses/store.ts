import { useState, useCallback, useEffect } from 'react'
import { insert, update, remove, removeWhere, query } from '@/lib/db'
import type { Course } from '@/types/database'

function uid() { return crypto.randomUUID() }
function shareSlug() { return Math.random().toString(36).slice(2, 10) }

// ── Module-level state ──
let _courses: Course[] = []
let _loaded = false
let _loading = false
const _listeners = new Set<() => void>()
const notify = () => _listeners.forEach(fn => fn())

export function useCourses(tutorId?: string) {
  const [, setTick] = useState(0)

  useEffect(() => {
    const fn = () => setTick(t => t + 1)
    _listeners.add(fn)
    return () => { _listeners.delete(fn) }
  }, [])

  useEffect(() => {
    if (_loaded || _loading || !tutorId) return
    _loading = true
    query<Course>('courses', { tutor_id: tutorId }, { col: 'created_at', asc: false })
      .then(data => { _courses = data; _loaded = true; _loading = false; notify() })
      .catch(() => { _loading = false })
  }, [tutorId])

  const addCourse = useCallback(async (title: string, description?: string) => {
    const c: Course = {
      id: uid(), title, description: description || null,
      share_id: shareSlug(),
      tutor_id: tutorId!, created_at: new Date().toISOString(),
    }
    _courses = [c, ..._courses]
    notify()
    await insert('courses', c)
    return c
  }, [tutorId])

  const updateCourse = useCallback(async (id: string, data: Partial<Course>) => {
    _courses = _courses.map(c => c.id === id ? { ...c, ...data } : c)
    notify()
    await update('courses', id, data)
  }, [])

  const deleteCourse = useCallback(async (id: string, deleteLessons = true) => {
    _courses = _courses.filter(c => c.id !== id)
    notify()
    if (deleteLessons) {
      await removeWhere('lessons', 'course_id', id)
    }
    await remove('courses', id)
  }, [])

  return {
    courses: _courses,
    addCourse,
    updateCourse,
    deleteCourse,
  }
}
