import { supabase } from "./supabase";
import type { Student, Lesson, Homework } from "@/types/database";

// ── Helpers ──
function unwrap<T>(res: { data: T | null; error: any }): T {
  if (res.error) throw res.error;
  return res.data!;
}

function db() {
  if (!supabase) throw new Error("Supabase not configured");
  return supabase;
}

// ── Students ──
export const studentsApi = {
  list: async () => unwrap(await db().from("students").select().order("created_at", { ascending: false })) as Student[],
  get: async (id: string) => unwrap(await db().from("students").select().eq("id", id).single()) as Student,
  getByShareId: async (shareId: string) => unwrap(await db().from("students").select().eq("share_id", shareId).single()) as Student,
  create: async (data: any) => unwrap(await db().from("students").insert(data).select().single()) as Student,
  update: async (id: string, data: any) => unwrap(await db().from("students").update(data).eq("id", id).select().single()) as Student,
  delete: async (id: string) => { await db().from("students").delete().eq("id", id); },
};

// ── Lessons ──
export const lessonsApi = {
  list: async () => unwrap(await db().from("lessons").select().order("date", { ascending: false })) as Lesson[],
  listByStudent: async (studentId: string) => unwrap(await db().from("lessons").select().eq("student_id", studentId).order("date", { ascending: false })) as Lesson[],
  get: async (id: string) => unwrap(await db().from("lessons").select().eq("id", id).single()) as Lesson,
  create: async (data: any) => unwrap(await db().from("lessons").insert(data).select().single()) as Lesson,
  update: async (id: string, data: any) => unwrap(await db().from("lessons").update(data).eq("id", id).select().single()) as Lesson,
  delete: async (id: string) => { await db().from("lessons").delete().eq("id", id); },
};

// ── Homework ──
export const homeworkApi = {
  list: async () => unwrap(await db().from("homework").select().order("created_at", { ascending: false })) as Homework[],
  listByStudent: async (studentId: string) => unwrap(await db().from("homework").select().eq("student_id", studentId).order("created_at", { ascending: false })) as Homework[],
  listByLesson: async (lessonId: string) => unwrap(await db().from("homework").select().eq("lesson_id", lessonId).order("created_at", { ascending: false })) as Homework[],
  get: async (id: string) => unwrap(await db().from("homework").select().eq("id", id).single()) as Homework,
  create: async (data: any) => unwrap(await db().from("homework").insert(data).select().single()) as Homework,
  update: async (id: string, data: any) => unwrap(await db().from("homework").update(data).eq("id", id).select().single()) as Homework,
  delete: async (id: string) => { await db().from("homework").delete().eq("id", id); },
};
