import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { GraduationCap, BookOpen, ChevronDown, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SectionPlayer } from "@/components/section-player";
import type { Course, Lesson } from "@/types/database";

export function CourseView() {
  const { shareId } = useParams<{ shareId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!shareId || !supabase) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const { data: c } = await (supabase as any).from("courses").select().eq("share_id", shareId).single();
        if (cancelled || !c) { setLoading(false); return; }
        setCourse(c);
        const { data: ls } = await (supabase as any).from("lessons").select().eq("course_id", c.id).order("order_index", { ascending: true });
        if (!cancelled) setLessons(ls || []);
      } catch {}
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f3ee] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#888]" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#f5f3ee] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[15px] font-medium text-[#1a1a1a] mb-1">Курс не найден</p>
          <p className="text-[13px] text-[#888]">Проверьте ссылку</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f3ee]">
      <header className="bg-white border-b border-[#e8e5de] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 md:px-6 h-14 flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
            <GraduationCap className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-semibold text-[14px] tracking-tight">Lekto</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-6 py-5 md:py-8 space-y-4 md:space-y-6">
        {/* Course header */}
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight font-serif">{course.title}</h1>
          {course.description && <p className="text-[14px] text-[#888] mt-1">{course.description}</p>}
          <p className="text-[13px] text-[#aaa] mt-2">{lessons.length} уроков</p>
        </div>

        {/* Lessons */}
        {lessons.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#e8e5de] bg-white py-12 text-center">
            <BookOpen className="h-6 w-6 text-[#ccc] mx-auto mb-2" />
            <p className="text-[14px] text-[#888]">Уроки пока не добавлены</p>
          </div>
        ) : (
          <div className="space-y-2">
            {lessons.map((l, idx) => (
              <div key={l.id}>
                <button onClick={() => setExpandedId(expandedId === l.id ? null : l.id)}
                  className="w-full rounded-xl border border-[#e8e5de] bg-white px-4 py-3 flex items-center gap-3 hover:border-[#d0ccc4] transition-colors cursor-pointer text-left">
                  <span className="text-[13px] font-medium text-[#aaa] w-6 text-center shrink-0">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium truncate">{l.title}</p>
                    {l.notes && <p className="text-[12px] text-[#888] truncate">{l.notes}</p>}
                  </div>
                  <ChevronDown className={`h-4 w-4 text-[#aaa] transition-transform shrink-0 ${expandedId === l.id ? "rotate-180" : ""}`} />
                </button>
                {expandedId === l.id && (
                  <div className="rounded-xl border border-[#e8e5de] bg-[#faf9f6] px-4 py-4 mt-1 space-y-3">
                    {l.notes && <p className="text-[13px] text-[#666] italic">{l.notes}</p>}
                    {l.sections && l.sections.length > 0 ? (
                      l.sections.map((sec) => (
                        <div key={sec.id} className="bg-white rounded-xl border border-[#e8e5de] p-3">
                          <SectionPlayer section={sec} onScore={() => {}} />
                        </div>
                      ))
                    ) : (
                      <p className="text-[13px] text-[#aaa] text-center py-2">Контент пока не добавлен</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
