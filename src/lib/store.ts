import { useState, useCallback, useEffect } from "react";
import { supabase } from "./supabase";
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

function loadLocal(): StoreData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { students: [], lessons: [], homework: [], templates: [] };
}

function saveLocal(data: StoreData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let _data = loadLocal();
let _listeners: Set<() => void> = new Set();
let _supabaseLoaded = false;

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

// ── Load from Supabase on first mount ──
async function loadFromSupabase(): Promise<StoreData | null> {
  const d = db();
  if (!d) return null;
  try {
    const [sRes, lRes, hRes] = await Promise.all([
      d.from("students").select().order("created_at", { ascending: false }),
      d.from("lessons").select().order("date", { ascending: false }),
      d.from("homework").select().order("created_at", { ascending: false }),
    ]);
    if (sRes.error || lRes.error || hRes.error) return null;
    return {
      students: sRes.data || [],
      lessons: lRes.data || [],
      homework: hRes.data || [],
      templates: loadLocal().templates || [], // templates stay local only
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

export function useStore() {
  const [, setTick] = useState(0);
  const rerender = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    _listeners.add(rerender);
    return () => { _listeners.delete(rerender); };
  }, [rerender]);

  // Load from Supabase once, or push local data if Supabase is empty
  useEffect(() => {
    if (_supabaseLoaded || !supabase) return;
    _supabaseLoaded = true;
    loadFromSupabase().then((remote) => {
      if (!remote) return;
      const remoteHasData = remote.students.length > 0 || remote.lessons.length > 0 || remote.homework.length > 0;
      const localHasData = _data.students.length > 0 || _data.lessons.length > 0 || _data.homework.length > 0;

      if (remoteHasData) {
        // Supabase has data — use it as source of truth
        _data = { ...remote, templates: _data.templates || [] };
        notify();
      } else if (localHasData) {
        // Supabase is empty but localStorage has data — push to Supabase
        for (const s of _data.students) sbInsert("students", s);
        for (const l of _data.lessons) sbInsert("lessons", l);
        for (const h of _data.homework) sbInsert("homework", h);
      }
    });
  }, []);

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
      tutor_id: "local",
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
    sbDelete("homework", id);
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

  return {
    students, addStudent, updateStudent, deleteStudent,
    lessons, addLesson, updateLesson, deleteLesson,
    homework, addHomework, updateHomework, deleteHomework,
    templates, addTemplate, deleteTemplate,
  };
}
