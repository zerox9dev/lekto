import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { BookOpen, CheckCircle2, Circle, ChevronRight, ArrowLeft, Loader2, ClipboardList } from "lucide-react";
import { useStore } from "@/features/store";
import { supabase } from "@/lib/supabase";
import { SectionPlayer } from "@/components/section-player";
import type { Homework, Lesson, Student, Course } from "@/types/database";

// ── Lesson View (full page for one lesson) ──

function LessonView({ lesson, homeworkItems, onBack }: { lesson: Lesson; homeworkItems: Homework[]; onBack: () => void }) {
  const { updateHomework } = useStore();
  const [tab, setTab] = useState<"lesson" | "homework">("lesson");
  const completedHw = homeworkItems.filter((h) => h.completed).length;
  const hasLesson = !!(lesson.notes || (lesson.sections && lesson.sections.length > 0));
  const hasHomework = homeworkItems.length > 0;

  const handleScore = (hw: Homework, sectionId: string, score: number) => {
    const scores = { ...(hw.scores || {}), [sectionId]: score };
    const gradable = (hw.sections || []).filter((s) => s.type !== "text" && s.type !== "cards").length;
    updateHomework(hw.id, { scores, completed: Object.keys(scores).length >= gradable });
  };

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Back + title */}
      <div>
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-[13px] text-[#888] hover:text-[#666] mb-3 md:mb-4 cursor-pointer min-h-[44px]">
          <ArrowLeft className="h-4 w-4" /> Все уроки
        </button>
        <h2 className="text-[20px] md:text-[22px] font-bold tracking-tight">{lesson.title}</h2>
        <p className="text-[13px] text-[#888] mt-1">{lesson.date}</p>
      </div>

      {/* Tabs */}
      {hasLesson && hasHomework && (
        <div className="flex gap-1 bg-[#f0ede6] rounded-xl p-1">
          <button onClick={() => setTab("lesson")}
            className={`flex-1 py-2.5 rounded-lg text-[13px] md:text-[14px] font-medium transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 ${
              tab === "lesson" ? "bg-white text-[#1a1a1a]" : "text-[#888] hover:text-[#666]"
            }`}>
            <BookOpen className="h-3.5 w-3.5" /> Урок
          </button>
          <button onClick={() => setTab("homework")}
            className={`flex-1 py-2.5 rounded-lg text-[13px] md:text-[14px] font-medium transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 ${
              tab === "homework" ? "bg-white text-[#1a1a1a]" : "text-[#888] hover:text-[#666]"
            }`}>
            <ClipboardList className="h-3.5 w-3.5" /> Домашка {completedHw > 0 && <span className="text-emerald-500 ml-1">{completedHw}/{homeworkItems.length}</span>}
          </button>
        </div>
      )}

      {/* Lesson tab */}
      {(tab === "lesson" || !hasHomework) && (
        <div className="space-y-4 md:space-y-6">
          {lesson.notes && (
            <div className="rounded-2xl bg-white border border-[#e8e5de] p-4 md:p-6">
              <p className="text-[12px] font-semibold text-[#888] uppercase tracking-wider mb-2 md:mb-3">Конспект</p>
              <p className="text-[14px] md:text-[15px] text-[#666] whitespace-pre-wrap leading-relaxed break-words">{lesson.notes}</p>
            </div>
          )}
          {lesson.sections && lesson.sections.length > 0 && (
            <div className="rounded-2xl bg-white border border-[#e8e5de] p-4 md:p-6 space-y-4 md:space-y-6">
              {lesson.sections.map((sec, i) => (
                <div key={sec.id}>
                  {i > 0 && <div className="border-t border-[#e8e5de] mb-4 md:mb-6" />}
                  <SectionPlayer section={sec} onScore={() => {}} />
                </div>
              ))}
            </div>
          )}
          {!hasLesson && !hasHomework && (
            <div className="rounded-2xl border border-dashed border-[#e8e5de] bg-white p-8 md:p-12 text-center">
              <p className="text-[15px] text-[#888]">Материалов пока нет</p>
            </div>
          )}
        </div>
      )}

      {/* Homework tab */}
      {tab === "homework" && hasHomework && (
        <div className="space-y-4 md:space-y-6">
          {homeworkItems.map((hw) => {
            const sections = hw.sections || [];
            const scores = hw.scores || {};
            const avgScore = Object.keys(scores).length > 0
              ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length) : null;

            return (
              <div key={hw.id} className="rounded-2xl bg-white border border-[#e8e5de] p-4 md:p-6 space-y-4 md:space-y-6">
                <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                  {hw.completed ? <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> : <Circle className="h-5 w-5 text-[#ccc] shrink-0" />}
                  <h3 className="text-[16px] md:text-[17px] font-bold min-w-0 break-words">{hw.title}</h3>
                  {avgScore !== null && (
                    <span className={`ml-auto text-[14px] font-semibold shrink-0 ${avgScore >= 80 ? "text-emerald-500" : avgScore >= 50 ? "text-amber-500" : "text-red-500"}`}>
                      {avgScore}%
                    </span>
                  )}
                </div>
                {sections.map((sec, i) => (
                  <div key={sec.id}>
                    {i > 0 && <div className="border-t border-[#e8e5de] mb-4 md:mb-6" />}
                    <SectionPlayer section={sec} onScore={(sid, score) => handleScore(hw, sid, score)} />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main ──

export function StudentView() {
  const { shareId } = useParams<{ shareId: string }>();
  const store = useStore();
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // Try Supabase first (for public student access), fallback to localStorage
  const [remoteStudent, setRemoteStudent] = useState<Student | null>(null);
  const [remoteLessons, setRemoteLessons] = useState<Lesson[]>([]);
  const [remoteHomework, setRemoteHomework] = useState<Homework[]>([]);
  const [remoteCourses, setRemoteCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!shareId || !supabase) { setLoading(false); setTried(true); return; }
    let cancelled = false;
    (async () => {
      try {
        const { data: s } = await (supabase as any).from("students").select().eq("share_id", shareId).single();
        if (cancelled || !s) { setLoading(false); setTried(true); return; }
        setRemoteStudent(s);
        const [lsRes, hwRes, cRes] = await Promise.all([
          (supabase as any).from("lessons").select().eq("student_id", s.id).order("date", { ascending: false }),
          (supabase as any).from("homework").select().eq("student_id", s.id).order("created_at", { ascending: false }),
          (supabase as any).from("courses").select().eq("tutor_id", s.tutor_id).order("created_at", { ascending: false }),
        ]);
        if (!cancelled) {
          setRemoteLessons(lsRes.data || []);
          setRemoteHomework(hwRes.data || []);
          setRemoteCourses(cRes.error ? [] : (cRes.data || []));
        }
      } catch {}
      if (!cancelled) { setLoading(false); setTried(true); }
    })();
    return () => { cancelled = true; };
  }, [shareId]);

  // Use remote data if available, otherwise fallback to localStorage
  const localStudent = store.students.find((s) => s.share_id === shareId) || null;
  const student = remoteStudent || localStudent;
  const studentLessons = student
    ? (remoteStudent ? remoteLessons : store.lessons.filter((l) => l.student_id === student.id)).sort((a, b) => b.date.localeCompare(a.date))
    : [];
  const studentHomework = student
    ? (remoteStudent ? remoteHomework : store.homework.filter((h) => h.student_id === student.id))
    : [];
  const allCourses = remoteStudent ? remoteCourses : (store.courses || []);

  // Group lessons by course
  const groupedLessons = useMemo(() => {
    const courseMap = new Map<string | null, Lesson[]>();
    for (const l of studentLessons) {
      const key = l.course_id || null;
      if (!courseMap.has(key)) courseMap.set(key, []);
      courseMap.get(key)!.push(l);
    }
    const groups: { course: Course | null; lessons: Lesson[] }[] = [];
    // Courses with lessons first
    for (const c of allCourses) {
      const cls = courseMap.get(c.id);
      if (cls && cls.length > 0) {
        groups.push({ course: c, lessons: cls.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)) });
      }
    }
    // Lessons without course
    const uncategorized = courseMap.get(null);
    if (uncategorized && uncategorized.length > 0) {
      groups.push({ course: null, lessons: uncategorized });
    }
    return groups;
  }, [studentLessons, allCourses]);
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
  const totalHw = studentHomework.length;
  const completedHw = studentHomework.filter((h) => h.completed).length;

  return (
    <div className="min-h-screen bg-[#f5f3ee]">
      <header className="bg-white border-b border-[#e8e5de] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 md:px-6 h-14 flex items-center gap-2.5">
          <span className="font-bold font-serif text-[18px] tracking-tight text-[#1a1a1a]">Lekto</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-6 py-5 md:py-8">
        {selectedLesson ? (
          <LessonView
            lesson={selectedLesson}
            homeworkItems={studentHomework.filter((h) => h.lesson_id === selectedLesson.id)}
            onBack={() => setSelectedLessonId(null)}
          />
        ) : (
          <div className="space-y-4 md:space-y-6">
            {/* Student header */}
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

            {/* Lessons list */}
            {studentLessons.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#e8e5de] bg-white p-8 md:p-12 text-center">
                <p className="text-[14px] md:text-[15px] text-[#888]">Уроков пока нет. Ваш репетитор добавит их сюда.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {groupedLessons.map((group, gi) => (
                  <div key={group.course?.id || "uncategorized"} className="space-y-2">
                    {hasCourseGrouping && (
                      <h3 className="text-[13px] font-semibold text-[#888] uppercase tracking-wider px-1">
                        {group.course ? group.course.title : "Без курса"}
                      </h3>
                    )}
                    {group.lessons.map((l) => {
                      const lhw = studentHomework.filter((h) => h.lesson_id === l.id);
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
                              {l.sections && l.sections.length > 0 && ` · 🎯 ${l.sections.length} секций`}
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
