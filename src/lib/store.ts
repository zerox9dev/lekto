import { useState, useCallback, useEffect } from "react";
import { supabase } from "./supabase";
import type { Student, Lesson, Homework, HomeworkTemplate, Course } from "@/types/database";

function uid() {
  return crypto.randomUUID();
}

function shareSlug() {
  return Math.random().toString(36).slice(2, 10);
}

// ── In-memory state (loaded from Supabase) ──
interface StoreData {
  students: Student[];
  lessons: Lesson[];
  homework: Homework[];
  courses: Course[];
  templates: HomeworkTemplate[]; // templates stay local (no table)
}

let _data: StoreData = { students: [], lessons: [], homework: [], courses: [], templates: [] };
let _listeners: Set<() => void> = new Set();
let _loaded = false;
let _loading = false;
let _currentUserId: string = "local";

function notify() {
  _listeners.forEach((fn) => fn());
}

// ── Supabase helpers ──
const db = () => {
  if (!supabase) throw new Error("Supabase not configured");
  return supabase as any;
};

async function loadFromSupabase(userId: string): Promise<Omit<StoreData, "templates"> | null> {
  try {
    const d = db();
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
      courses: cRes.error ? [] : (cRes.data || []),
    };
  } catch { return null; }
}

export function useStore(userId?: string) {
  const [, setTick] = useState(0);
  const rerender = useCallback(() => setTick((t) => t + 1), []);

  if (userId) _currentUserId = userId;
  const tutorId = _currentUserId;

  useEffect(() => {
    _listeners.add(rerender);
    return () => { _listeners.delete(rerender); };
  }, [rerender]);

  // Load from Supabase once
  useEffect(() => {
    if (_loaded || _loading || tutorId === "local") return;
    _loading = true;
    loadFromSupabase(tutorId).then((remote) => {
      _loading = false;
      _loaded = true;
      if (!remote) return;
      _data = { ...remote, templates: _data.templates };
      notify();
    });
  }, [tutorId]);

  // ── Students ──
  const students = _data.students;

  const addStudent = useCallback((name: string, telegram?: string) => {
    const s: Student = {
      id: uid(), name, telegram: telegram || null,
      share_id: shareSlug(), tutor_id: _currentUserId,
      created_at: new Date().toISOString(),
    };
    _data = { ..._data, students: [s, ..._data.students] };
    notify();
    db().from("students").upsert(s, { onConflict: "id" }).then(() => {});
    return s;
  }, []);

  const updateStudent = useCallback((id: string, data: Partial<Student>) => {
    _data = { ..._data, students: _data.students.map((s) => (s.id === id ? { ...s, ...data } : s)) };
    notify();
    db().from("students").update(data).eq("id", id).then(() => {});
  }, []);

  const deleteStudent = useCallback((id: string) => {
    _data = {
      students: _data.students.filter((s) => s.id !== id),
      lessons: _data.lessons.filter((l) => l.student_id !== id),
      homework: _data.homework.filter((h) => h.student_id !== id),
      courses: _data.courses,
      templates: _data.templates,
    };
    notify();
    db().from("students").delete().eq("id", id).then(() => {});
    db().from("lessons").delete().eq("student_id", id).then(() => {});
    db().from("homework").delete().eq("student_id", id).then(() => {});
  }, []);

  // ── Lessons ──
  const lessons = _data.lessons;

  const addLesson = useCallback((studentId: string | null, title: string, date: string, notes?: string, sections?: Lesson["sections"]) => {
    const l: Lesson = {
      id: uid(), student_id: studentId || "", tutor_id: _currentUserId,
      title, date, notes: notes || null, materials_url: null,
      sections: sections && sections.length > 0 ? sections : undefined,
      created_at: new Date().toISOString(),
    };
    _data = { ..._data, lessons: [l, ..._data.lessons] };
    notify();
    db().from("lessons").upsert(l, { onConflict: "id" }).then(() => {});
    return l;
  }, []);

  const updateLesson = useCallback((id: string, data: Partial<Lesson>) => {
    _data = { ..._data, lessons: _data.lessons.map((l) => (l.id === id ? { ...l, ...data } : l)) };
    notify();
    db().from("lessons").update(data).eq("id", id).then(() => {});
  }, []);

  const deleteLesson = useCallback((id: string) => {
    _data = {
      ..._data,
      homework: _data.homework.filter((h) => h.lesson_id !== id),
      lessons: _data.lessons.filter((l) => l.id !== id),
    };
    notify();
    db().from("lessons").delete().eq("id", id).then(() => {});
    db().from("homework").delete().eq("lesson_id", id).then(() => {});
  }, []);

  // ── Homework ──
  const homework = _data.homework;

  const addHomework = useCallback((data: Omit<Homework, "id" | "created_at">) => {
    const h: Homework = {
      ...data, id: uid(), tutor_id: _currentUserId,
      created_at: new Date().toISOString(),
    };
    _data = { ..._data, homework: [h, ..._data.homework] };
    notify();
    db().from("homework").upsert(h, { onConflict: "id" }).then(() => {});
    return h;
  }, []);

  const updateHomework = useCallback((id: string, data: Partial<Homework>) => {
    _data = { ..._data, homework: _data.homework.map((h) => (h.id === id ? { ...h, ...data } : h)) };
    notify();
    db().from("homework").update(data).eq("id", id).then(() => {});
  }, []);

  const deleteHomework = useCallback((id: string) => {
    _data = { ..._data, homework: _data.homework.filter((h) => h.id !== id) };
    notify();
    db().from("homework").delete().eq("id", id).then(() => {});
  }, []);

  // ── Courses ──
  const courses = _data.courses || [];

  const addCourse = useCallback((title: string, description?: string) => {
    const c: Course = {
      id: uid(), title, description: description || null,
      share_id: Math.random().toString(36).slice(2, 10),
      tutor_id: _currentUserId, created_at: new Date().toISOString(),
    };
    _data = { ..._data, courses: [c, ...(_data.courses || [])] };
    notify();
    db().from("courses").upsert(c, { onConflict: "id" }).then(() => {});
    return c;
  }, []);

  const updateCourse = useCallback((id: string, data: Partial<Course>) => {
    _data = { ..._data, courses: (_data.courses || []).map((c) => (c.id === id ? { ...c, ...data } : c)) };
    notify();
    db().from("courses").update(data).eq("id", id).then(() => {});
  }, []);

  const deleteCourse = useCallback((id: string) => {
    const updatedLessons = _data.lessons.map((l) => l.course_id === id ? { ...l, course_id: null } : l);
    _data = { ..._data, courses: (_data.courses || []).filter((c) => c.id !== id), lessons: updatedLessons };
    notify();
    db().from("courses").delete().eq("id", id).then(() => {});
    db().from("lessons").update({ course_id: null }).eq("course_id", id).then(() => {});
  }, []);

  // ── Templates (in-memory only, no DB table) ──
  const templates = _data.templates || [];

  const addTemplate = useCallback((title: string, sections: Homework["sections"]) => {
    const t: HomeworkTemplate = {
      id: uid(), title,
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

  return {
    students, addStudent, updateStudent, deleteStudent,
    lessons, addLesson, updateLesson, deleteLesson,
    homework, addHomework, updateHomework, deleteHomework,
    courses, addCourse, updateCourse, deleteCourse,
    templates, addTemplate, deleteTemplate,
    loading: _loading, loaded: _loaded,
  };
}
