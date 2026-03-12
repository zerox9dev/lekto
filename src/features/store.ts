/**
 * Unified store — composes all feature stores into a single useStore() hook.
 * Pages import { useStore } from "@/features/store" and get the same API
 * they had before, but backed by feature-scoped modules + lib/db.ts.
 */
import { useStudents } from '@/features/students/store'
import { useLessons } from '@/features/lessons/store'
import { useCourses } from '@/features/courses/store'
import { useHomework } from '@/features/homework/store'
import type { Homework, HomeworkTemplate } from '@/types/database'

function uid() { return crypto.randomUUID() }

// ── Templates (in-memory only, no DB table) ──
let _templates: HomeworkTemplate[] = []
const _tplListeners = new Set<() => void>()
const notifyTpl = () => _tplListeners.forEach(fn => fn())

function addTemplate(title: string, sections: Homework['sections']) {
  const t: HomeworkTemplate = {
    id: uid(), title,
    sections: sections.map(s => ({ ...s, id: uid() })),
    created_at: new Date().toISOString(),
  }
  _templates = [t, ..._templates]
  notifyTpl()
  return t
}

function deleteTemplate(id: string) {
  _templates = _templates.filter(t => t.id !== id)
  notifyTpl()
}

// ── Track current tutor id (set once from layout) ──
let _tutorId: string | undefined

export function useStore(userId?: string) {
  if (userId) _tutorId = userId
  const tid = _tutorId

  const studentStore = useStudents(tid)
  const lessonStore = useLessons(tid)
  const courseStore = useCourses(tid)
  const homeworkStore = useHomework(tid)

  return {
    // Students
    students: studentStore.students,
    addStudent: studentStore.addStudent,
    updateStudent: studentStore.updateStudent,
    deleteStudent: studentStore.deleteStudent,

    // Lessons
    lessons: lessonStore.lessons,
    addLesson: lessonStore.addLesson,
    updateLesson: lessonStore.updateLesson,
    deleteLesson: lessonStore.deleteLesson,

    // Courses
    courses: courseStore.courses,
    addCourse: courseStore.addCourse,
    updateCourse: courseStore.updateCourse,
    deleteCourse: courseStore.deleteCourse,

    // Homework
    homework: homeworkStore.homework,
    addHomework: homeworkStore.addHomework,
    updateHomework: homeworkStore.updateHomework,
    deleteHomework: homeworkStore.deleteHomework,

    // Templates (in-memory)
    templates: _templates,
    addTemplate,
    deleteTemplate,

    // Loading state
    loading: studentStore.loading,
    loaded: studentStore.loaded,
  }
}
