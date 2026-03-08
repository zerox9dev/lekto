import { useState, useCallback, useEffect } from "react";
import type { Student, Lesson, Homework, HomeworkTemplate } from "@/types/database";

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
}

function load(): StoreData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { students: [], lessons: [], homework: [], templates: [] };
}

function save(data: StoreData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let _data = load();
let _listeners: Set<() => void> = new Set();

function notify() {
  save(_data);
  _listeners.forEach((fn) => fn());
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

export function useStore() {
  const [, setTick] = useState(0);
  const rerender = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    _listeners.add(rerender);
    return () => { _listeners.delete(rerender); };
  }, [rerender]);

  // ── Students ──
  const students = _data.students;

  const addStudent = useCallback((name: string, telegram?: string) => {
    const s: Student = {
      id: uid(),
      name,
      telegram: telegram || null,
      share_id: shareSlug(),
      tutor_id: "local",
      created_at: new Date().toISOString(),
    };
    _data = { ..._data, students: [s, ..._data.students] };
    notify();
    return s;
  }, []);

  const updateStudent = useCallback((id: string, data: Partial<Student>) => {
    _data = { ..._data, students: _data.students.map((s) => (s.id === id ? { ...s, ...data } : s)) };
    notify();
  }, []);

  const deleteStudent = useCallback((id: string) => {
    _data = {
      students: _data.students.filter((s) => s.id !== id),
      lessons: _data.lessons.filter((l) => l.student_id !== id),
      homework: _data.homework.filter((h) => h.student_id !== id),
      templates: _data.templates,
    };
    notify();
  }, []);

  // ── Lessons ──
  const lessons = _data.lessons;

  const addLesson = useCallback((studentId: string, title: string, date: string, notes?: string) => {
    const l: Lesson = {
      id: uid(),
      student_id: studentId,
      tutor_id: "local",
      title,
      date,
      notes: notes || null,
      materials_url: null,
      created_at: new Date().toISOString(),
    };
    _data = { ..._data, lessons: [l, ..._data.lessons] };
    notify();
    return l;
  }, []);

  const updateLesson = useCallback((id: string, data: Partial<Lesson>) => {
    _data = { ..._data, lessons: _data.lessons.map((l) => (l.id === id ? { ...l, ...data } : l)) };
    notify();
  }, []);

  const deleteLesson = useCallback((id: string) => {
    _data = {
      ..._data,
      homework: _data.homework.filter((h) => h.lesson_id !== id),
      lessons: _data.lessons.filter((l) => l.id !== id),
    };
    notify();
  }, []);

  // ── Homework ──
  const homework = _data.homework;

  const addHomework = useCallback((data: Omit<Homework, "id" | "created_at">) => {
    const h: Homework = {
      ...data,
      id: uid(),
      created_at: new Date().toISOString(),
    };
    _data = { ..._data, homework: [h, ..._data.homework] };
    notify();
    return h;
  }, []);

  const updateHomework = useCallback((id: string, data: Partial<Homework>) => {
    _data = { ..._data, homework: _data.homework.map((h) => (h.id === id ? { ...h, ...data } : h)) };
    notify();
  }, []);

  const deleteHomework = useCallback((id: string) => {
    _data = { ..._data, homework: _data.homework.filter((h) => h.id !== id) };
    notify();
  }, []);

  // ── Templates ──
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

  return {
    students, addStudent, updateStudent, deleteStudent,
    lessons, addLesson, updateLesson, deleteLesson,
    homework, addHomework, updateHomework, deleteHomework,
    templates, addTemplate, deleteTemplate,
  };
}
