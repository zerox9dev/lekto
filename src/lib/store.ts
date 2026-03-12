import { useState, useCallback, useEffect } from "react";
import { supabase } from "./supabase";
import type { Student, Lesson, Homework, HomeworkTemplate, Course } from "@/types/database";

function uid() {
  return crypto.randomUUID();
}

function shareSlug() {
  return Math.random().toString(36).slice(2, 10);
}

// ── localStorage persistence ──
const STORAGE_KEY = "lekto_store";

interface StoreData {
  students: Student[];
  lessons: Lesson[];
  homework: Homework[];
  templates: HomeworkTemplate[];
  courses: Course[];
}

function loadLocal(): StoreData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { students: [], lessons: [], homework: [], templates: [], courses: [] };
}

function saveLocal(data: StoreData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let _data = loadLocal();
let _listeners: Set<() => void> = new Set();
let _supabaseLoaded = false;
let _currentUserId: string = "local";

function notify() {
  saveLocal(_data);
  _listeners.forEach((fn) => fn());
}

// ── Supabase sync helpers (fire-and-forget) ──
const db = () => supabase ? (supabase as any) : null;

function sbInsert(table: string, row: any) {
  const d = db(); if (!d) return;
  d.from(table).upsert(row, { onConflict: "id" }).then(() => {});
}
function sbUpdate(table: string, id: string, patch: any) {
  const d = db(); if (!d) return;
  d.from(table).update(patch).eq("id", id).then(() => {});
}
function sbDelete(table: string, id: string) {
  const d = db(); if (!d) return;
  d.from(table).delete().eq("id", id).then(() => {});
}
function sbDeleteWhere(table: string, col: string, val: string) {
  const d = db(); if (!d) return;
  d.from(table).delete().eq(col, val).then(() => {});
}

// ── Load from Supabase (only this tutor's data) ──
async function loadFromSupabase(userId: string): Promise<StoreData | null> {
  const d = db();
  if (!d) return null;
  try {
    const [sRes, lRes, hRes, cRes] = await Promise.all([
      d.from("students").select().eq("tutor_id", userId).order("created_at", { ascending: false }),
      d.from("lessons").select().eq("tutor_id", userId).order("date", { ascending: false }),
      d.from("homework").select().eq("tutor_id", userId).order("created_at", { ascending: false }),
      d.from("courses").select().eq("tutor_id", userId).order("created_at", { ascending: false }),
    ]);
    if (sRes.error || lRes.error || hRes.error) return null;
    return {
      students: sRes.data || [],
      lessons: lRes.data || [],
      homework: hRes.data || [],
      templates: loadLocal().templates || [],
      courses: cRes.error ? [] : (cRes.data || []),
    };
  } catch { return null; }
}

// Listen for changes from other tabs
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        _data = JSON.parse(e.newValue);
        _listeners.forEach((fn) => fn());
      } catch {}
    }
  });
}

export function useStore(userId?: string) {
  const [, setTick] = useState(0);
  const rerender = useCallback(() => setTick((t) => t + 1), []);

  // Track current user id
  if (userId) _currentUserId = userId;
  const tutorId = _currentUserId;

  useEffect(() => {
    _listeners.add(rerender);
    return () => { _listeners.delete(rerender); };
  }, [rerender]);

  // Load from Supabase once, or push local data if Supabase is empty
  useEffect(() => {
    if (_supabaseLoaded || !supabase || tutorId === "local") return;
    _supabaseLoaded = true;
    loadFromSupabase(tutorId).then(async (remote) => {
      if (!remote) return;
      const remoteHasData = remote.students.length > 0 || remote.lessons.length > 0 || remote.homework.length > 0;
      const localHasData = _data.students.length > 0 || _data.lessons.length > 0 || _data.homework.length > 0;

      if (remoteHasData) {
        _data = { ...remote, templates: _data.templates || [] };
        notify();
      } else if (localHasData) {
        // Migrate local data: stamp tutor_id then push
        const d = db();
        if (d) {
          try {
            const students = _data.students.map((s) => ({ ...s, tutor_id: tutorId }));
            const lessons = _data.lessons.map((l) => ({ ...l, tutor_id: tutorId }));
            const homework = _data.homework.map((h) => ({ ...h, tutor_id: tutorId }));
            const courses = (_data.courses || []).map((c) => ({ ...c, tutor_id: tutorId }));
            _data = { ..._data, students, lessons, homework, courses };
            notify();
            if (students.length > 0) await d.from("students").upsert(students, { onConflict: "id" });
            if (lessons.length > 0) await d.from("lessons").upsert(lessons, { onConflict: "id" });
            if (homework.length > 0) await d.from("homework").upsert(homework, { onConflict: "id" });
            if (courses.length > 0) await d.from("courses").upsert(courses, { onConflict: "id" });
          } catch (e) {
            console.error("Lekto: failed to push local data to Supabase", e);
          }
        }
      }
    });
  }, [tutorId]);

  // ── Students ──
  const students = _data.students;

  const addStudent = useCallback((name: string, telegram?: string) => {
    const s: Student = {
      id: uid(),
      name,
      telegram: telegram || null,
      share_id: shareSlug(),
      tutor_id: _currentUserId,
      created_at: new Date().toISOString(),
    };
    _data = { ..._data, students: [s, ..._data.students] };
    notify();
    sbInsert("students", s);
    return s;
  }, []);

  const updateStudent = useCallback((id: string, data: Partial<Student>) => {
    _data = { ..._data, students: _data.students.map((s) => (s.id === id ? { ...s, ...data } : s)) };
    notify();
    sbUpdate("students", id, data);
  }, []);

  const deleteStudent = useCallback((id: string) => {
    _data = {
      students: _data.students.filter((s) => s.id !== id),
      lessons: _data.lessons.filter((l) => l.student_id !== id),
      homework: _data.homework.filter((h) => h.student_id !== id),
      templates: _data.templates,
    };
    notify();
    sbDelete("students", id);
    sbDeleteWhere("lessons", "student_id", id);
    sbDeleteWhere("homework", "student_id", id);
  }, []);

  // ── Lessons ──
  const lessons = _data.lessons;

  const addLesson = useCallback((studentId: string, title: string, date: string, notes?: string, sections?: Lesson["sections"]) => {
    const l: Lesson = {
      id: uid(),
      student_id: studentId,
      tutor_id: _currentUserId,
      title,
      date,
      notes: notes || null,
      materials_url: null,
      sections: sections && sections.length > 0 ? sections : undefined,
      created_at: new Date().toISOString(),
    };
    _data = { ..._data, lessons: [l, ..._data.lessons] };
    notify();
    sbInsert("lessons", l);
    return l;
  }, []);

  const updateLesson = useCallback((id: string, data: Partial<Lesson>) => {
    _data = { ..._data, lessons: _data.lessons.map((l) => (l.id === id ? { ...l, ...data } : l)) };
    notify();
    sbUpdate("lessons", id, data);
  }, []);

  const deleteLesson = useCallback((id: string) => {
    _data = {
      ..._data,
      homework: _data.homework.filter((h) => h.lesson_id !== id),
      lessons: _data.lessons.filter((l) => l.id !== id),
    };
    notify();
    sbDelete("lessons", id);
    sbDeleteWhere("homework", "lesson_id", id);
  }, []);

  // ── Homework ──
  const homework = _data.homework;

  const addHomework = useCallback((data: Omit<Homework, "id" | "created_at">) => {
    const h: Homework = {
      ...data,
      id: uid(),
      tutor_id: _currentUserId,
      created_at: new Date().toISOString(),
    };
    _data = { ..._data, homework: [h, ..._data.homework] };
    notify();
    sbInsert("homework", h);
    return h;
  }, []);

  const updateHomework = useCallback((id: string, data: Partial<Homework>) => {
    _data = { ..._data, homework: _data.homework.map((h) => (h.id === id ? { ...h, ...data } : h)) };
    notify();
    sbUpdate("homework", id, data);
  }, []);

  const deleteHomework = useCallback((id: string) => {
    _data = { ..._data, homework: _data.homework.filter((h) => h.id !== id) };
    notify();
  }, []);

  // ── Templates (local only) ──
  const templates = _data.templates || [];

  const addTemplate = useCallback((title: string, sections: Homework["sections"]) => {
    const t: HomeworkTemplate = {
      id: uid(),
      title,
      sections: sections.map((s) => ({ ...s, id: uid() })),
      created_at: new Date().toISOString(),
    };
    _data = { ..._data, templates: [t, ...(_data.templates || [])] };
    notify();
    return t;
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    _data = { ..._data, templates: (_data.templates || []).filter((t) => t.id !== id) };
    notify();
  }, []);

  // ── Courses ──
  const courses = _data.courses || [];

  const addCourse = useCallback((title: string, description?: string) => {
    const c: Course = {
      id: uid(),
      title,
      description: description || null,
      tutor_id: _currentUserId,
      created_at: new Date().toISOString(),
    };
    _data = { ..._data, courses: [c, ...(_data.courses || [])] };
    notify();
    sbInsert("courses", c);
    return c;
  }, []);

  const updateCourse = useCallback((id: string, data: Partial<Course>) => {
    _data = { ..._data, courses: (_data.courses || []).map((c) => (c.id === id ? { ...c, ...data } : c)) };
    notify();
    sbUpdate("courses", id, data);
  }, []);

  const deleteCourse = useCallback((id: string) => {
    // Unlink lessons from this course (don't delete them)
    const updatedLessons = _data.lessons.map((l) =>
      l.course_id === id ? { ...l, course_id: null, order_index: 0 } : l
    );
    _data = { ..._data, courses: (_data.courses || []).filter((c) => c.id !== id), lessons: updatedLessons };
    notify();
    sbDelete("courses", id);
    // Supabase ON DELETE SET NULL handles course_id, but update order_index
    updatedLessons.filter((l) => l.course_id === null).forEach((l) => {
      sbUpdate("lessons", l.id, { order_index: 0 });
    });
  }, []);

  return {
    students, addStudent, updateStudent, deleteStudent,
    lessons, addLesson, updateLesson, deleteLesson,
    homework, addHomework, updateHomework, deleteHomework,
    templates, addTemplate, deleteTemplate,
    courses, addCourse, updateCourse, deleteCourse,
  };
}
