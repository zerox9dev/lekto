import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Check, ChevronDown, ChevronUp, Circle, CopyPlus, Bookmark, Sparkles } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { typeLabels } from "@/components/sections-editor";
import type { Homework, Lesson } from "@/types/database";

export function LessonCard({ lesson, homeworkItems, studentId, onEditLesson, onDeleteLesson, onNewHw, onGenerateHw, onEditHw, onDeleteHw, onDuplicateHw, onSaveAsTemplate }: {
  lesson: Lesson; homeworkItems: Homework[]; studentId: string;
  onEditLesson: () => void; onDeleteLesson: () => void;
  onNewHw: () => void; onGenerateHw: () => void; onEditHw: (h: Homework) => void; onDeleteHw: (id: string) => void; onDuplicateHw: (h: Homework) => void;
  onSaveAsTemplate: (h: Homework) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();
  const completedHw = homeworkItems.filter((h) => h.completed).length;
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-[#e8e5de] bg-white overflow-hidden">
      <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-3 group">
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 md:gap-3 flex-1 min-w-0 text-left cursor-pointer">
          <div className={`h-2 w-2 rounded-full shrink-0 ${completedHw === homeworkItems.length && homeworkItems.length > 0 ? "bg-[#2d5a3d]" : "bg-[#ccc]"}`} />
          <p className="text-[13px] font-medium truncate flex-1">{lesson.title}</p>
          <span className="text-[12px] text-[#888] shrink-0">{lesson.date}</span>
          {expanded ? <ChevronUp className="h-4 w-4 text-[#888] shrink-0" /> : <ChevronDown className="h-4 w-4 text-[#888] shrink-0" />}
        </button>
        <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button onClick={onEditLesson} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#f0ede6] cursor-pointer"><Pencil className="h-3.5 w-3.5 text-[#888]" /></button>
          <button onClick={onDeleteLesson} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#fef2f2] cursor-pointer"><Trash2 className="h-3.5 w-3.5 text-[#888] hover:text-red-500" /></button>
        </div>
      </div>
      {expanded && (
        <div className="px-3 md:px-4 pb-3 md:pb-4 space-y-3 border-t border-[#f0ede6]">
          {lesson.sections && lesson.sections.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {lesson.sections.map((sec, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg text-[11px] font-medium border border-[#e8e5de] text-[#666] bg-white">
                  {typeLabels[sec.type] || sec.type}
                </span>
              ))}
            </div>
          )}
          {lesson.sections?.some((sec) => sec.type === "cards") && (() => {
            const cardSec = lesson.sections!.find((sec) => sec.type === "cards");
            const cards = (cardSec?.content as any)?.cards || [];
            return cards.length > 0 ? (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {cards.slice(0, 4).map((c: any, i: number) => (
                  <div key={i} className={`min-w-[120px] h-[72px] rounded-xl border border-[#e8e5de] flex items-center justify-center text-[12px] font-medium shrink-0 ${i % 2 === 1 ? "bg-[#faf8f5] text-[#888]" : "bg-white text-[#1a1a1a]"}`}>
                    {i % 2 === 0 ? c.front : c.back}
                  </div>
                ))}
              </div>
            ) : null;
          })()}
          {lesson.notes && (
            <div className="rounded-lg bg-[#f5f3ee] px-3 py-2.5">
              <p className="text-[13px] text-[#666] whitespace-pre-wrap leading-relaxed break-words">{lesson.notes}</p>
            </div>
          )}
          {lesson.sections && lesson.sections.length > 0 ? (
            <button onClick={() => navigate(`/app/students/${studentId}/lesson/${lesson.id}/edit`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer">
              <Pencil className="h-3 w-3" /> {t("editSections")} ({lesson.sections.length})
            </button>
          ) : (
            <button onClick={() => navigate(`/app/students/${studentId}/lesson/${lesson.id}/edit`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-[#888] hover:bg-[#f0ede6] transition-colors cursor-pointer">
              <Plus className="h-3 w-3" /> {t("addInteractiveContent")}
            </button>
          )}
          {homeworkItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-[#888] uppercase tracking-wider">{t("homeworkSection")}</p>
              {homeworkItems.map((h) => {
                const scores = h.scores || {};
                const avgScore = Object.keys(scores).length > 0
                  ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length) : null;
                return (
                  <div key={h.id} className="rounded-lg border border-[#e8e5de] px-3 py-2.5 flex items-center gap-2 md:gap-3 group/hw">
                    {h.completed ? (
                      <div className="h-5 w-5 rounded-md bg-[#2d5a3d] flex items-center justify-center shrink-0"><Check className="h-3 w-3 text-white" /></div>
                    ) : <Circle className="h-4 w-4 text-[#ccc] shrink-0" />}
                    <p className="text-[12px] font-medium truncate flex-1">{h.title}</p>
                    {avgScore !== null && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#ddefd7] text-[#2d5a3d] shrink-0">{avgScore}%</span>}
                    <div className="flex items-center gap-0.5 md:opacity-0 md:group-hover/hw:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => onSaveAsTemplate(h)} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-amber-50 cursor-pointer" title="Сохранить как шаблон"><Bookmark className="h-3 w-3 text-[#888] hover:text-amber-500" /></button>
                      <button onClick={() => onDuplicateHw(h)} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-[#f0ede6] cursor-pointer hidden sm:flex" title="Дублировать"><CopyPlus className="h-3 w-3 text-[#888]" /></button>
                      <button onClick={() => onEditHw(h)} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-[#f0ede6] cursor-pointer"><Pencil className="h-3 w-3 text-[#888]" /></button>
                      <button onClick={() => onDeleteHw(h.id)} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-[#fef2f2] cursor-pointer"><Trash2 className="h-3 w-3 text-[#888] hover:text-red-500" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={onNewHw} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-[#888] hover:bg-[#f0ede6] transition-colors cursor-pointer">
              <Plus className="h-3.5 w-3.5" /> {t("addHomework")}
            </button>
            <button onClick={onGenerateHw} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-[#888] hover:bg-[#f0ede6] transition-colors cursor-pointer">
              <Sparkles className="h-3.5 w-3.5" /> AI
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
