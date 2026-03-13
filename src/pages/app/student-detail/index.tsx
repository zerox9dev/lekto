import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Check, Copy, ExternalLink, Sparkles, Loader } from "lucide-react";
import { useStore } from "@/features/store";
import { generateContent } from "@/lib/ai";
import { useTranslation } from "@/lib/i18n";
import type { Homework, Lesson } from "@/types/database";
import { LessonCard } from "./lesson-card";
import { StatsBar } from "./stats-bar";
import { LessonDialog } from "./lesson-dialog";

export function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { students, lessons, homework, addLesson, updateLesson, deleteLesson, addHomework, updateHomework, deleteHomework, templates, addTemplate, deleteTemplate } = useStore();

  const student = students.find((s) => s.id === id);
  const studentLessons = student ? lessons.filter((l) => l.student_id === student.id).sort((a, b) => b.date.localeCompare(a.date)) : [];
  const studentHomework = student ? homework.filter((h) => h.student_id === student.id) : [];

  const [lessonOpen, setLessonOpen] = useState(false);
  const [editLessonId, setEditLessonId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!student) {
    return (
      <div className="py-20 text-center">
        <p className="text-[14px] text-[#888]">{t("studentNotFound")}</p>
        <Link to="/app" className="text-[13px] text-[#888] underline mt-2 inline-block">{t("back")}</Link>
      </div>
    );
  }

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/s/${student.share_id}`);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  const openNewLesson = () => { setEditLessonId(null); setLessonOpen(true); };
  const openEditLesson = (l: Lesson) => { setEditLessonId(l.id); setLessonOpen(true); };

  const handleSaveLesson = (title: string, date: string, notes: string) => {
    if (editLessonId) updateLesson(editLessonId, { title, date, notes: notes || null });
    else addLesson(student.id, title, date, notes || undefined);
  };

  const handleAiCreate = async (title: string, date: string, notes: string, lang: string, level: string) => {
    const result = await generateContent({ type: "lesson", topic: title, language: lang, level });
    if (result.notes && !notes) notes = result.notes;
    const l = await addLesson(student.id, title, date, notes || undefined, result.sections);
    navigate(`/app/students/${student.id}/lesson/${l.id}/edit`);
  };

  const openNewHw = (lessonId: string) => navigate(`/app/students/${student.id}/homework/new/edit?lessonId=${lessonId}`);
  const openEditHw = (h: Homework) => navigate(`/app/students/${student.id}/homework/${h.id}/edit`);
  const duplicateHw = (h: Homework, lessonId: string) => {
    addHomework({ lesson_id: lessonId, student_id: student.id, tutor_id: student.tutor_id, title: h.title + " (копия)",
      sections: (h.sections || []).map((s) => ({ ...s, id: crypto.randomUUID() })), completed: false, student_answers: null, scores: null });
  };

  const handleGenerateHw = async (lesson: Lesson) => {
    const lessonContent = [lesson.title, lesson.notes || "",
      ...(lesson.sections || []).map((s) => s.title + ": " + JSON.stringify(s.content).slice(0, 200))].join("\n");
    const result = await generateContent({ type: "homework", topic: lesson.title, lessonContent });
    if (result.sections && result.sections.length > 0) {
      addHomework({ lesson_id: lesson.id, student_id: student.id, tutor_id: student.tutor_id,
        title: `Домашка: ${lesson.title}`, sections: result.sections, completed: false, student_answers: null, scores: null });
    }
  };

  const completedHw = studentHomework.filter((h) => h.completed).length;
  const avgScore = (() => {
    const scored = studentHomework.filter((h) => h.scores && Object.keys(h.scores).length > 0);
    if (scored.length === 0) return null;
    const total = scored.reduce((sum, h) => { const vals = Object.values(h.scores!); return sum + vals.reduce((a, b) => a + b, 0) / vals.length; }, 0);
    return Math.round(total / scored.length);
  })();

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start gap-3 md:gap-4">
        <div className="flex items-start gap-3 md:gap-4 w-full sm:w-auto">
          <Link to="/app" className="mt-1.5 h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#f0ede6] transition-colors shrink-0"><ArrowLeft className="h-4 w-4 text-[#888]" /></Link>
          <img src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(student.name)}`} alt={student.name} className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-[#f0ede6] shrink-0" />
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-xl font-bold tracking-tight truncate">{student.name}</h1>
            <div className="flex items-center gap-2 md:gap-3 mt-1 flex-wrap">
              {student.telegram && <span className="text-[12px] text-[#888]">@{student.telegram.replace(/^@/, "")}</span>}
              <button onClick={copyLink} className="inline-flex items-center gap-1 text-[12px] text-[#888] hover:text-[#666] cursor-pointer">
                {copied ? <><Check className="h-3 w-3 text-emerald-500" /> {t("copied")}</> : <><Copy className="h-3 w-3" /> {t("link")}</>}
              </button>
              <a href={`/s/${student.share_id}`} target="_blank" className="inline-flex items-center gap-1 text-[12px] text-[#888] hover:text-[#666]"><ExternalLink className="h-3 w-3" /> {t("portal")}</a>
            </div>
          </div>
        </div>
      </div>

      <StatsBar lessonsCount={studentLessons.length} completedHw={completedHw} totalHw={studentHomework.length} avgScore={avgScore} />

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[14px] font-semibold">{t("lessonsSection")}</h2>
          <button onClick={openNewLesson} className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 rounded-lg bg-[#1a1a1a] text-white text-[12px] font-medium hover:bg-[#333] cursor-pointer shrink-0"><Plus className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{t("addLesson")}</span><span className="sm:hidden">{t("lessonShort")}</span></button>
        </div>
        {studentLessons.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#e8e5de] bg-white py-12 md:py-16 text-center"><p className="text-[14px] text-[#888]">{t("noLessons")}</p></div>
        ) : (
          studentLessons.map((l) => (
            <LessonCard key={l.id} lesson={l} homeworkItems={studentHomework.filter((h) => h.lesson_id === l.id)} studentId={student.id}
              onEditLesson={() => openEditLesson(l)} onDeleteLesson={() => deleteLesson(l.id)}
              onNewHw={() => openNewHw(l.id)} onGenerateHw={() => handleGenerateHw(l)} onEditHw={openEditHw} onDeleteHw={deleteHomework} onDuplicateHw={(h) => duplicateHw(h, l.id)}
              onSaveAsTemplate={(h) => addTemplate(h.title, h.sections || [])} />
          ))
        )}
      </div>

      <LessonDialog open={lessonOpen} onOpenChange={setLessonOpen} editLessonId={editLessonId} student={student}
        onSave={handleSaveLesson} onAiCreate={handleAiCreate} />
    </div>
  );
}
