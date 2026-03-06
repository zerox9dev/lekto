import { useState, useCallback } from "react";
import type { Student, Lesson, Homework } from "@/types/database";

function uid() {
  return crypto.randomUUID();
}

function shareSlug() {
  return Math.random().toString(36).slice(2, 10);
}

// ── Global in-memory store (persists during session, resets on reload) ──

let _students: Student[] = [];
let _lessons: Lesson[] = [];
let _homework: Homework[] = [];
let _listeners: Set<() => void> = new Set();

function notify() {
  _listeners.forEach((fn) => fn());
}

export function useStore() {
  const [, setTick] = useState(0);

  // Subscribe to changes
  const rerender = useCallback(() => setTick((t) => t + 1), []);
  if (!_listeners.has(rerender)) _listeners.add(rerender);

  // ── Students ──
  const students = _students;

  const addStudent = useCallback((name: string, email?: string) => {
    const s: Student = {
      id: uid(),
      name,
      email: email || null,
      share_id: shareSlug(),
      tutor_id: "local",
      created_at: new Date().toISOString(),
    };
    _students = [s, ..._students];
    notify();
    return s;
  }, []);

  const updateStudent = useCallback((id: string, data: Partial<Student>) => {
    _students = _students.map((s) => (s.id === id ? { ...s, ...data } : s));
    notify();
  }, []);

  const deleteStudent = useCallback((id: string) => {
    _students = _students.filter((s) => s.id !== id);
    _lessons = _lessons.filter((l) => l.student_id !== id);
    _homework = _homework.filter((h) => h.student_id !== id);
    notify();
  }, []);

  // ── Lessons ──
  const lessons = _lessons;

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
    _lessons = [l, ..._lessons];
    notify();
    return l;
  }, []);

  const updateLesson = useCallback((id: string, data: Partial<Lesson>) => {
    _lessons = _lessons.map((l) => (l.id === id ? { ...l, ...data } : l));
    notify();
  }, []);

  const deleteLesson = useCallback((id: string) => {
    _homework = _homework.filter((h) => h.lesson_id !== id);
    _lessons = _lessons.filter((l) => l.id !== id);
    notify();
  }, []);

  // ── Homework ──
  const homework = _homework;

  const addHomework = useCallback((data: Omit<Homework, "id" | "created_at">) => {
    const h: Homework = {
      ...data,
      id: uid(),
      created_at: new Date().toISOString(),
    };
    _homework = [h, ..._homework];
    notify();
    return h;
  }, []);

  const updateHomework = useCallback((id: string, data: Partial<Homework>) => {
    _homework = _homework.map((h) => (h.id === id ? { ...h, ...data } : h));
    notify();
  }, []);

  const deleteHomework = useCallback((id: string) => {
    _homework = _homework.filter((h) => h.id !== id);
    notify();
  }, []);

  return {
    students, addStudent, updateStudent, deleteStudent,
    lessons, addLesson, updateLesson, deleteLesson,
    homework, addHomework, updateHomework, deleteHomework,
  };
}
