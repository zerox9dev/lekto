import { useState, useCallback, useEffect } from 'react'
import { insert, update, remove, removeWhere, query } from '@/lib/db'
import type { Student } from '@/types/database'

function uid() { return crypto.randomUUID() }
function shareSlug() { return Math.random().toString(36).slice(2, 10) }

// ── Module-level state ──
let _students: Student[] = []
let _loaded = false
let _loading = false
const _listeners = new Set<() => void>()
const notify = () => _listeners.forEach(fn => fn())

export function useStudents(tutorId?: string) {
  const [, setTick] = useState(0)

  useEffect(() => {
    const fn = () => setTick(t => t + 1)
    _listeners.add(fn)
    return () => { _listeners.delete(fn) }
  }, [])

  // Load once from Supabase
  useEffect(() => {
    if (_loaded || _loading || !tutorId) return
    _loading = true
    query<Student>('students', { tutor_id: tutorId }, { col: 'created_at', asc: false })
      .then(data => { _students = data; _loaded = true; _loading = false; notify() })
      .catch(() => { _loading = false })
  }, [tutorId])

  const addStudent = useCallback(async (name: string, telegram?: string) => {
    const s: Student = {
      id: uid(), name, telegram: telegram || null,
      share_id: shareSlug(), tutor_id: tutorId!,
      created_at: new Date().toISOString(),
    }
    _students = [s, ..._students]
    notify()
    await insert('students', s)
    return s
  }, [tutorId])

  const updateStudent = useCallback(async (id: string, data: Partial<Student>) => {
    _students = _students.map(s => s.id === id ? { ...s, ...data } : s)
    notify()
    await update('students', id, data)
  }, [])

  const deleteStudent = useCallback(async (id: string) => {
    _students = _students.filter(s => s.id !== id)
    notify()
    await remove('students', id)
    await removeWhere('lessons', 'student_id', id).catch(() => {})
    await removeWhere('homework', 'student_id', id).catch(() => {})
  }, [])

  return {
    students: _students,
    addStudent,
    updateStudent,
    deleteStudent,
    loading: _loading,
    loaded: _loaded,
  }
}
