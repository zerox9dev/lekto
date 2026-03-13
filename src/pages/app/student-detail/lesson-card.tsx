import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Check, Circle } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import type { Homework, Lesson } from "@/types/database";

export function LessonCard({ lesson, homeworkItems, studentId, onEditLesson, onDeleteLesson, onNewHw, onEditHw }: {
  lesson: Lesson; homeworkItems: Homework[]; studentId: string;
  onEditLesson: () => void; onDeleteLesson: () => void;
  onNewHw: () => void; onEditHw: (h: Homework) => void;
}) {
  const { t } = useTranslation();
  const completedHw = homeworkItems.filter((h) => h.completed).length;
  const hasLessonContent = Boolean(lesson.notes || lesson.sections?.length);
  const hasHomework = homeworkItems.length > 0;
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-[#e8e5de] bg-white overflow-hidden">
      <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-3 group">
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          <div className={`h-2 w-2 rounded-full shrink-0 ${completedHw === homeworkItems.length && homeworkItems.length > 0 ? "bg-[#2d5a3d]" : "bg-[#ccc]"}`} />
          <span className="text-[12px] text-[#888] shrink-0">{lesson.date}</span>
          <p className="text-[13px] font-medium truncate flex-1">{lesson.title}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => navigate(`/app/students/${studentId}/lesson/${lesson.id}/edit`)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border border-[#e8e5de] hover:bg-[#f5f3ee] transition-colors cursor-pointer ${
              hasLessonContent ? "text-[#1a1a1a]" : "text-[#666]"
            }`}>
            {hasLessonContent ? <Check className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
            {t("lessonNotesButton")}
          </button>
          <button onClick={hasHomework ? () => onEditHw(homeworkItems[0]) : onNewHw}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border border-[#e8e5de] hover:bg-[#f5f3ee] transition-colors cursor-pointer ${
              hasHomework ? "text-[#1a1a1a]" : "text-[#666]"
            }`}>
            {hasHomework ? <Check className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
            {t("homeworkTitle")}
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onEditLesson} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#f0ede6] cursor-pointer"><Pencil className="h-3.5 w-3.5 text-[#888]" /></button>
          <button onClick={onDeleteLesson} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#fef2f2] cursor-pointer"><Trash2 className="h-3.5 w-3.5 text-[#888] hover:text-red-500" /></button>
        </div>
      </div>
    </div>
  );
}
