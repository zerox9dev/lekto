import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { BookOpen, ChevronRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Homework, Lesson, Student, Course } from "@/types/database";
import { LessonView } from "./lesson-view";

export function StudentView() {
  const { shareId } = useParams<{ shareId: string }>();
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const [student, setStudent] = useState<Student | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shareId || !supabase) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const { data: s } = await (supabase as any).from("students").select().eq("share_id", shareId).single();
        if (cancelled || !s) { setLoading(false); return; }
        setStudent(s);
        const [lsRes, hwRes, cRes] = await Promise.all([
          (supabase as any).from("lessons").select().eq("student_id", s.id).order("date", { ascending: false }),
          (supabase as any).from("homework").select().eq("student_id", s.id).order("created_at", { ascending: false }),
          (supabase as any).from("courses").select().eq("tutor_id", s.tutor_id).order("created_at", { ascending: false }),
        ]);
        if (!cancelled) {
          setLessons(lsRes.data || []);
          setHomework(hwRes.data || []);
          setCourses(cRes.error ? [] : (cRes.data || []));
        }
      } catch {}
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [shareId]);

  const studentLessons = useMemo(() =>
    [...lessons].sort((a, b) => b.date.localeCompare(a.date)), [lessons]);

  const groupedLessons = useMemo(() => {
    const courseMap = new Map<string | null, Lesson[]>();
    for (const l of studentLessons) {
      const key = l.course_id || null;
      if (!courseMap.has(key)) courseMap.set(key, []);
      courseMap.get(key)!.push(l);
    }
    const groups: { course: Course | null; lessons: Lesson[] }[] = [];
    for (const c of courses) {
      const cls = courseMap.get(c.id);
      if (cls && cls.length > 0) groups.push({ course: c, lessons: cls.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)) });
    }
    const uncategorized = courseMap.get(null);
    if (uncategorized && uncategorized.length > 0) groups.push({ course: null, lessons: uncategorized });
    return groups;
  }, [studentLessons, courses]);

  const hasCourseGrouping = groupedLessons.some((g) => g.course !== null);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f3ee] flex items-center justify-center px-4">
        <Loader2 className="h-6 w-6 animate-spin text-[#888]" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-[#f5f3ee] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[15px] font-medium text-[#1a1a1a] mb-1">Ученик не найден</p>
          <p className="text-[13px] text-[#888]">Проверьте ссылку</p>
        </div>
      </div>
    );
  }

  const selectedLesson = selectedLessonId ? studentLessons.find((l) => l.id === selectedLessonId) : null;
  const totalHw = homework.length;
  const completedHw = homework.filter((h) => h.completed).length;

  return (
    <div className="min-h-screen bg-[#f5f3ee]">
      <header className="bg-white border-b border-[#e8e5de] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 md:px-6 h-14 flex items-center gap-2.5">
          <span className="font-bold font-serif text-[18px] tracking-tight text-[#1a1a1a]">Lekto</span>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 md:px-6 py-5 md:py-8">
        {selectedLesson ? (
          <LessonView lesson={selectedLesson}
            homeworkItems={homework.filter((h) => h.lesson_id === selectedLesson.id)}
            onBack={() => setSelectedLessonId(null)} />
        ) : (
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 md:gap-4">
              <img src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(student.name)}`}
                alt={student.name} className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-[#f0ede6] shrink-0" />
              <div className="min-w-0">
                <h1 className="text-lg md:text-xl font-bold tracking-tight truncate">{student.name}</h1>
                <p className="text-[13px] text-[#888] mt-0.5">
                  {studentLessons.length} уроков · {completedHw}/{totalHw} заданий выполнено
                </p>
              </div>
            </div>
            {studentLessons.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#e8e5de] bg-white p-8 md:p-12 text-center">
                <p className="text-[14px] md:text-[15px] text-[#888]">Уроков пока нет. Ваш репетитор добавит их сюда.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {groupedLessons.map((group) => (
                  <div key={group.course?.id || "uncategorized"} className="space-y-2">
                    {hasCourseGrouping && (
                      <h3 className="text-[13px] font-semibold text-[#888] uppercase tracking-wider px-1">
                        {group.course ? group.course.title : "Без курса"}
                      </h3>
                    )}
                    {group.lessons.map((l) => {
                      const lhw = homework.filter((h) => h.lesson_id === l.id);
                      const lhwDone = lhw.filter((h) => h.completed).length;
                      return (
                        <button key={l.id} onClick={() => setSelectedLessonId(l.id)}
                          className="w-full rounded-xl border border-[#e8e5de] bg-white px-3 md:px-5 py-3 md:py-4 flex items-center gap-3 md:gap-4 text-left hover:border-[#d0ccc4] transition-colors cursor-pointer group min-h-[56px]">
                          <div className="h-10 w-10 rounded-xl bg-[#f0ede6] flex items-center justify-center shrink-0">
                            <BookOpen className="h-4.5 w-4.5 text-[#888]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] md:text-[15px] font-medium truncate">{l.title}</p>
                            <p className="text-[12px] md:text-[13px] text-[#888] mt-0.5">
                              {l.date}
                              {l.sections && l.sections.length > 0 && ` · ${l.sections.length} секций`}
                              {lhw.length > 0 && (
                                <span className={lhwDone === lhw.length && lhw.length > 0 ? "text-emerald-500" : ""}>
                                  {" "}· {lhwDone}/{lhw.length} заданий
                                </span>
                              )}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-[#ccc] group-hover:text-[#888] shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
