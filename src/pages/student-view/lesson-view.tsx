import { useState } from "react";
import { BookOpen, CheckCircle2, Circle, ArrowLeft, ClipboardList } from "lucide-react";
import { useStore } from "@/features/store";
import { useTranslation } from "@/lib/i18n";
import { SectionPlayer } from "@/components/section-player";
import type { Homework, Lesson } from "@/types/database";

export function LessonView({ lesson, homeworkItems, onBack }: { lesson: Lesson; homeworkItems: Homework[]; onBack: () => void }) {
  const { updateHomework } = useStore();
  const { t } = useTranslation();
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
      <div>
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-[13px] text-[#888] hover:text-[#666] mb-3 md:mb-4 cursor-pointer min-h-[44px]">
          <ArrowLeft className="h-4 w-4" /> {t("allLessons")}
        </button>
        <h2 className="text-[20px] md:text-[22px] font-bold tracking-tight">{lesson.title}</h2>
        <p className="text-[13px] text-[#888] mt-1">{lesson.date}</p>
      </div>

      {hasLesson && hasHomework && (
        <div className="flex gap-1 bg-[#f0ede6] rounded-xl p-1">
          <button onClick={() => setTab("lesson")}
            className={`flex-1 py-2.5 rounded-lg text-[13px] md:text-[14px] font-medium transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 ${
              tab === "lesson" ? "bg-white text-[#1a1a1a]" : "text-[#888] hover:text-[#666]"}`}>
            <BookOpen className="h-3.5 w-3.5" /> {t("lessonTab")}
          </button>
          <button onClick={() => setTab("homework")}
            className={`flex-1 py-2.5 rounded-lg text-[13px] md:text-[14px] font-medium transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 ${
              tab === "homework" ? "bg-white text-[#1a1a1a]" : "text-[#888] hover:text-[#666]"}`}>
            <ClipboardList className="h-3.5 w-3.5" /> Домашка {completedHw > 0 && <span className="text-emerald-500 ml-1">{completedHw}/{homeworkItems.length}</span>}
          </button>
        </div>
      )}

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
