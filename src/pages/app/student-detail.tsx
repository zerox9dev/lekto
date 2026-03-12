import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, BookOpen, ClipboardCheck, Pencil, Trash2, Copy, Check, ExternalLink, ChevronDown, ChevronUp, CheckCircle2, Circle, CopyPlus, Eye, X, AlertCircle, Upload, Bookmark, FileDown } from "lucide-react";
import { useStore } from "@/lib/store";
import * as Dialog from "@radix-ui/react-dialog";
import type { HomeworkSection, QuizQuestion, FillBlanksContent, MatchingContent, OrderingContent, CardsContent, TrueFalseContent, OpenAnswerContent, Homework, Lesson } from "@/types/database";
import { typeLabels, typeIcons, validateSections, SectionsListEditor } from "@/components/sections-editor";

// Helpers, validation, section editors, emptySection, duplicateSection
// are now imported from @/components/sections-editor

function getCorrectIndices(q: QuizQuestion): number[] {
  return Array.isArray(q.correct) ? q.correct : [q.correct];
}

function isCorrectIndex(q: QuizQuestion, idx: number): boolean {
  return getCorrectIndices(q).includes(idx);
}

// ══════════════════════════════════════════════════════
// Preview
// ══════════════════════════════════════════════════════

function SectionPreview({ section }: { section: HomeworkSection }) {
  if (section.type === "quiz") {
    const qs = section.content as QuizQuestion[];
    return (
      <div className="space-y-3">
        {qs.map((q, qi) => (
          <div key={qi} className="space-y-1.5">
            <p className="text-[13px] font-medium">{qi + 1}. {q.question || "..."}</p>
            <div className="pl-2 space-y-1">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2 text-[12px] text-[#666]">
                  <div className={`h-4 w-4 rounded-md border-2 ${isCorrectIndex(q, oi) ? "border-emerald-500 bg-emerald-500" : "border-[#d0ccc4]"} flex items-center justify-center shrink-0`}>
                    {isCorrectIndex(q, oi) && <Check className="h-2.5 w-2.5 text-white" />}
                  </div>
                  <span className="break-all">{opt || "..."}</span>
                </div>
              ))}
            </div>
            {q.explanation && <p className="text-[11px] text-[#888] pl-2 italic">💡 {q.explanation}</p>}
          </div>
        ))}
      </div>
    );
  }
  if (section.type === "fill_blanks") {
    const c = section.content as FillBlanksContent;
    const display = c.text.replace(/___/g, "______");
    return <p className="text-[13px] text-[#666] break-words">{display || "..."}</p>;
  }
  if (section.type === "matching") {
    const c = section.content as MatchingContent;
    return (
      <div className="space-y-1">
        {c.pairs.map((p, i) => <p key={i} className="text-[12px] text-[#666]">{p.left || "..."} → {p.right || "..."}</p>)}
      </div>
    );
  }
  if (section.type === "ordering") {
    const c = section.content as OrderingContent;
    return (
      <div className="space-y-1">
        {c.items.map((it, i) => <p key={i} className="text-[12px] text-[#666]">{i + 1}. {it || "..."}</p>)}
      </div>
    );
  }
  if (section.type === "cards") {
    const c = section.content as CardsContent;
    return <p className="text-[12px] text-[#888]">{c.cards.length} карточек: {c.cards.slice(0, 3).map((c) => c.front).join(", ")}{c.cards.length > 3 ? "..." : ""}</p>;
  }
  if (section.type === "true_false") {
    const c = section.content as TrueFalseContent;
    return (
      <div className="space-y-2">
        {c.questions.map((q, i) => (
          <div key={i} className="flex items-center gap-2 md:gap-3 text-[13px] flex-wrap">
            <span className={`text-[12px] font-semibold px-2 py-0.5 rounded shrink-0 ${q.correct ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
              {q.correct ? "Верно" : "Неверно"}
            </span>
            <span className="text-[#666]">{q.statement || "..."}</span>
          </div>
        ))}
      </div>
    );
  }
  if (section.type === "open_answer") {
    const c = section.content as OpenAnswerContent;
    return (
      <div className="space-y-2">
        <p className="text-[13px] text-[#666]">{c.prompt || "..."}</p>
        <div className="rounded-lg border border-dashed border-[#e8e5de] px-3 py-4 text-[12px] text-[#888] italic">
          {c.placeholder || "Ученик напишет ответ здесь..."}
        </div>
      </div>
    );
  }
  if (section.type === "text") {
    const c = section.content as { text: string };
    return <p className="text-[13px] text-[#666] whitespace-pre-wrap break-words">{c.text || "..."}</p>;
  }
  return null;
}

function HomeworkPreview({ title, sections }: { title: string; sections: HomeworkSection[] }) {
  return (
    <div className="space-y-4">
      <h3 className="text-[16px] font-bold">{title || "Без названия"}</h3>
      {sections.map((sec) => (
        <div key={sec.id} className="rounded-xl border border-[#e8e5de] bg-white p-3 md:p-4 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-medium text-[#888] bg-[#f0ede6] px-2 py-0.5 rounded-md">{typeLabels[sec.type]}</span>
            <span className="text-[14px] font-semibold">{sec.title}</span>
          </div>
          <SectionPreview section={sec} />
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// Lesson Card
// ══════════════════════════════════════════════════════

function LessonCard({ lesson, homeworkItems, onEditLesson, onDeleteLesson, onNewHw, onEditHw, onDeleteHw, onDuplicateHw, onSaveAsTemplate }: {
  lesson: Lesson; homeworkItems: Homework[];
  onEditLesson: () => void; onDeleteLesson: () => void;
  onNewHw: () => void; onEditHw: (h: Homework) => void; onDeleteHw: (id: string) => void; onDuplicateHw: (h: Homework) => void;
  onSaveAsTemplate: (h: Homework) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const completedHw = homeworkItems.filter((h) => h.completed).length;

  return (
    <div className="rounded-xl border border-[#e8e5de] bg-white overflow-hidden">
      <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-3 group">
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 md:gap-3 flex-1 min-w-0 text-left cursor-pointer">
          <div className="h-9 w-9 rounded-xl bg-[#f0ede6] flex items-center justify-center shrink-0">
            <BookOpen className="h-4 w-4 text-[#888]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium truncate">{lesson.title}</p>
            <p className="text-[12px] text-[#888] truncate">
              {lesson.date}
              {homeworkItems.length > 0 && (
                <span className={completedHw === homeworkItems.length && homeworkItems.length > 0 ? "text-emerald-500" : ""}>
                  {" "}· {completedHw}/{homeworkItems.length} заданий
                </span>
              )}
              {lesson.sections && lesson.sections.length > 0 && ` · 🎯 ${lesson.sections.length} секций`}
              {lesson.notes && " · 📝"}
            </p>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-[#888] shrink-0" /> : <ChevronDown className="h-4 w-4 text-[#888] shrink-0" />}
        </button>
        <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button onClick={onEditLesson} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#f0ede6] cursor-pointer"><Pencil className="h-3.5 w-3.5 text-[#888]" /></button>
          <button onClick={onDeleteLesson} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#fef2f2] cursor-pointer"><Trash2 className="h-3.5 w-3.5 text-[#888] hover:text-red-500" /></button>
        </div>
      </div>
      {expanded && (
        <div className="px-3 md:px-4 pb-3 md:pb-4 space-y-3">
          {lesson.notes && (
            <div className="rounded-lg bg-[#f5f3ee] px-3 py-2.5">
              <p className="text-[13px] text-[#666] whitespace-pre-wrap leading-relaxed break-words">{lesson.notes}</p>
            </div>
          )}
          {homeworkItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-[#888] uppercase tracking-wider">Домашние задания</p>
              {homeworkItems.map((h) => {
                const sectionSummary = (h.sections || []).map((s) => `${typeIcons[s.type]} ${typeLabels[s.type]}`).join("  ");
                const scores = h.scores || {};
                const avgScore = Object.keys(scores).length > 0
                  ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length) : null;
                return (
                  <div key={h.id} className="rounded-lg border border-[#e8e5de] px-3 py-2.5 flex items-center gap-2 md:gap-3 group/hw hover:border-[#e8e5de] transition-colors">
                    {h.completed ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> : <Circle className="h-4 w-4 text-[#ccc] shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate">{h.title}</p>
                      <p className="text-[11px] text-[#888] truncate">{sectionSummary || "Нет секций"}</p>
                    </div>
                    {avgScore !== null && (
                      <span className={`text-[12px] font-semibold shrink-0 ${avgScore >= 80 ? "text-emerald-500" : avgScore >= 50 ? "text-amber-500" : "text-red-500"}`}>{avgScore}%</span>
                    )}
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
          <button onClick={onNewHw} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-[#888] hover:bg-[#f0ede6] transition-colors cursor-pointer">
            <Plus className="h-3.5 w-3.5" /> Добавить домашку
          </button>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// Main
// ══════════════════════════════════════════════════════

export function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { students, lessons, homework, addLesson, updateLesson, deleteLesson, addHomework, updateHomework, deleteHomework, templates, addTemplate, deleteTemplate } = useStore();

  const student = students.find((s) => s.id === id);
  const studentLessons = student ? lessons.filter((l) => l.student_id === student.id).sort((a, b) => b.date.localeCompare(a.date)) : [];
  const studentHomework = student ? homework.filter((h) => h.student_id === student.id) : [];

  const [lessonOpen, setLessonOpen] = useState(false);
  const [editLessonId, setEditLessonId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDate, setLessonDate] = useState(new Date().toISOString().slice(0, 10));
  const [lessonNotes, setLessonNotes] = useState("");
  const [lessonSections, setLessonSections] = useState<HomeworkSection[]>([]);
  const [lessonShowErrors, setLessonShowErrors] = useState(false);

  const [hwOpen, setHwOpen] = useState(false);
  const [editHwId, setEditHwId] = useState<string | null>(null);
  const [hwTitle, setHwTitle] = useState("");
  const [hwLessonId, setHwLessonId] = useState("");
  const [hwSections, setHwSections] = useState<HomeworkSection[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const [copied, setCopied] = useState(false);

  const validationErrors = useMemo(() => validateSections(hwSections), [hwSections]);

  if (!student) {
    return (
      <div className="py-20 text-center">
        <p className="text-[14px] text-[#888]">Ученик не найден</p>
        <Link to="/app" className="text-[13px] text-[#888] underline mt-2 inline-block">← Назад</Link>
      </div>
    );
  }

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/s/${student.share_id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const openNewLesson = () => { setEditLessonId(null); setLessonTitle(""); setLessonDate(new Date().toISOString().slice(0, 10)); setLessonNotes(""); setLessonSections([]); setLessonShowErrors(false); setLessonOpen(true); };
  const openEditLesson = (l: Lesson) => { setEditLessonId(l.id); setLessonTitle(l.title); setLessonDate(l.date); setLessonNotes(l.notes || ""); setLessonSections(l.sections || []); setLessonShowErrors(false); setLessonOpen(true); };
  const saveLesson = () => {
    if (!lessonTitle.trim()) return;
    if (lessonSections.length > 0) {
      const errors = validateSections(lessonSections);
      if (errors.length > 0) { setLessonShowErrors(true); return; }
    }
    const sectionsData = lessonSections.length > 0 ? lessonSections : undefined;
    if (editLessonId) updateLesson(editLessonId, { title: lessonTitle.trim(), date: lessonDate, notes: lessonNotes.trim() || null, sections: sectionsData });
    else addLesson(student.id, lessonTitle.trim(), lessonDate, lessonNotes.trim() || undefined, sectionsData);
    setLessonOpen(false);
  };

  const openNewHw = (lessonId: string) => { setEditHwId(null); setHwTitle(""); setHwLessonId(lessonId); setHwSections([]); setShowPreview(false); setShowErrors(false); setShowTemplates(false); setHwOpen(true); };
  const openEditHw = (h: Homework) => { setEditHwId(h.id); setHwTitle(h.title); setHwLessonId(h.lesson_id); setHwSections(h.sections || []); setShowPreview(false); setShowErrors(false); setShowTemplates(false); setHwOpen(true); };
  const duplicateHw = (h: Homework, lessonId: string) => {
    addHomework({ lesson_id: lessonId, student_id: student.id, tutor_id: "local", title: h.title + " (копия)",
      sections: (h.sections || []).map((s) => ({ ...s, id: crypto.randomUUID() })), completed: false, student_answers: null, scores: null });
  };
  const saveHw = () => {
    if (!hwTitle.trim() || hwSections.length === 0) return;
    if (validationErrors.length > 0) { setShowErrors(true); return; }
    if (editHwId) updateHomework(editHwId, { title: hwTitle.trim(), lesson_id: hwLessonId, sections: hwSections });
    else addHomework({ lesson_id: hwLessonId, student_id: student.id, tutor_id: "local", title: hwTitle.trim(), sections: hwSections, completed: false, student_answers: null, scores: null });
    setHwOpen(false);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start gap-3 md:gap-4">
        <div className="flex items-start gap-3 md:gap-4 w-full sm:w-auto">
          <Link to="/app" className="mt-1.5 h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#f0ede6] transition-colors shrink-0"><ArrowLeft className="h-4 w-4 text-[#888]" /></Link>
          <img src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(student.name)}`} alt={student.name} className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-[#f0ede6] shrink-0" />
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-xl font-bold tracking-tight truncate">{student.name}</h1>
            <div className="flex items-center gap-2 md:gap-3 mt-1 flex-wrap">
              {student.telegram && <span className="text-[12px] text-[#888]">@{student.telegram.replace(/^@/, "")}</span>}
              <button onClick={copyLink} className="inline-flex items-center gap-1 text-[12px] text-[#888] hover:text-[#666] cursor-pointer">
                {copied ? <><Check className="h-3 w-3 text-emerald-500" /> Скопировано</> : <><Copy className="h-3 w-3" /> Ссылка</>}
              </button>
              <a href={`/s/${student.share_id}`} target="_blank" className="inline-flex items-center gap-1 text-[12px] text-[#888] hover:text-[#666]"><ExternalLink className="h-3 w-3" /> Портал</a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        <div className="rounded-xl border border-[#e8e5de] bg-white px-3 md:px-4 py-2.5 md:py-3 text-center"><p className="text-[18px] md:text-[20px] font-bold">{studentLessons.length}</p><p className="text-[10px] md:text-[11px] text-[#888]">уроков</p></div>
        <div className="rounded-xl border border-[#e8e5de] bg-white px-3 md:px-4 py-2.5 md:py-3 text-center"><p className="text-[18px] md:text-[20px] font-bold">{completedHw}/{studentHomework.length}</p><p className="text-[10px] md:text-[11px] text-[#888]">заданий</p></div>
        <div className="rounded-xl border border-[#e8e5de] bg-white px-3 md:px-4 py-2.5 md:py-3 text-center"><p className="text-[18px] md:text-[20px] font-bold">{avgScore !== null ? `${avgScore}%` : "—"}</p><p className="text-[10px] md:text-[11px] text-[#888]">средний балл</p></div>
      </div>

      {/* Lessons */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[14px] font-semibold">Уроки</h2>
          <button onClick={openNewLesson} className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 rounded-lg bg-[#1a1a1a] text-white text-[12px] font-medium hover:bg-[#333] cursor-pointer shrink-0"><Plus className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Добавить урок</span><span className="sm:hidden">Урок</span></button>
        </div>
        {studentLessons.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#e8e5de] bg-white py-12 md:py-16 text-center"><p className="text-[14px] text-[#888]">Уроков пока нет</p></div>
        ) : (
          studentLessons.map((l) => (
            <LessonCard key={l.id} lesson={l} homeworkItems={studentHomework.filter((h) => h.lesson_id === l.id)}
              onEditLesson={() => openEditLesson(l)} onDeleteLesson={() => deleteLesson(l.id)}
              onNewHw={() => openNewHw(l.id)} onEditHw={openEditHw} onDeleteHw={deleteHomework} onDuplicateHw={(h) => duplicateHw(h, l.id)}
              onSaveAsTemplate={(h) => addTemplate(h.title, h.sections || [])} />
          ))
        )}
      </div>

      {/* Lesson Dialog */}
      <Dialog.Root open={lessonOpen} onOpenChange={setLessonOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:max-w-2xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto overflow-x-hidden md:rounded-2xl bg-white shadow-xl z-50">
            {/* Sticky header */}
            <div className="sticky top-0 bg-white border-b border-[#e8e5de] px-4 md:px-6 py-3 md:py-4 flex items-center justify-between z-10">
              <Dialog.Title className="text-base md:text-lg font-bold truncate">{editLessonId ? "Редактировать урок" : "Новый урок"}</Dialog.Title>
              <Dialog.Close asChild><button className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#f0ede6] cursor-pointer"><X className="h-4 w-4 text-[#888]" /></button></Dialog.Close>
            </div>

            <div className="px-4 md:px-6 py-4 space-y-4">
              <div><label className="text-[12px] font-medium text-[#888] mb-1 block">Название *</label>
                <input value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} placeholder="Present Simple — урок 5" className="w-full h-10 rounded-xl border border-[#e8e5de] px-3 text-[14px] outline-none focus:border-[#ccc]" autoFocus /></div>
              <div><label className="text-[12px] font-medium text-[#888] mb-1 block">Дата</label>
                <input type="date" value={lessonDate} onChange={(e) => setLessonDate(e.target.value)} className="w-full h-10 rounded-xl border border-[#e8e5de] px-3 text-[14px] outline-none focus:border-[#ccc]" /></div>
              <div><label className="text-[12px] font-medium text-[#888] mb-1 block">Конспект / Заметки</label>
                <textarea value={lessonNotes} onChange={(e) => setLessonNotes(e.target.value)} placeholder="Что прошли на уроке, правила, ссылки на материалы..." rows={3}
                  className="w-full rounded-xl border border-[#e8e5de] px-3 py-2.5 text-[14px] outline-none focus:border-[#ccc] resize-y min-h-[80px]" /></div>

              {/* Interactive sections */}
              <div>
                <label className="text-[12px] font-medium text-[#888] mb-2 block">Интерактивный контент (необязательно)</label>
                <p className="text-[11px] text-[#888] mb-3">Добавьте тесты, карточки, задания — ученик увидит их на своей странице</p>
                <SectionsListEditor sections={lessonSections} onChange={setLessonSections} showErrors={lessonShowErrors} />
              </div>
            </div>

            {/* Sticky footer */}
            <div className="sticky bottom-0 bg-white border-t border-[#e8e5de] px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                {lessonShowErrors && lessonSections.length > 0 && validateSections(lessonSections).length > 0 && (
                  <p className="text-[12px] text-red-500 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {validateSections(lessonSections).length} ошибок в секциях</p>
                )}
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Dialog.Close asChild><button className="flex-1 sm:flex-initial px-4 py-2.5 sm:py-2 rounded-full text-[13px] font-medium text-[#888] hover:bg-[#f0ede6] cursor-pointer">Отмена</button></Dialog.Close>
                <button onClick={saveLesson} disabled={!lessonTitle.trim()}
                  className="flex-1 sm:flex-initial px-5 py-2.5 sm:py-2 rounded-full bg-[#1a1a1a] text-white text-[13px] font-medium hover:bg-[#333] disabled:opacity-40 cursor-pointer">
                  {editLessonId ? "Сохранить" : "Создать"}
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Homework Dialog */}
      <Dialog.Root open={hwOpen} onOpenChange={setHwOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:max-w-2xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto overflow-x-hidden md:rounded-2xl bg-white shadow-xl z-50">
            {/* Sticky header */}
            <div className="sticky top-0 bg-white border-b border-[#e8e5de] px-4 md:px-6 py-3 md:py-4 flex items-center justify-between z-10">
              <Dialog.Title className="text-base md:text-lg font-bold truncate">{editHwId ? "Редактировать задание" : "Новое задание"}</Dialog.Title>
              <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                <button onClick={() => setShowPreview(!showPreview)}
                  className={`h-8 px-2.5 md:px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-medium cursor-pointer transition-colors ${showPreview ? "bg-[#1a1a1a] text-white" : "hover:bg-[#f0ede6] text-[#888]"}`}>
                  <Eye className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{showPreview ? "Редактор" : "Предпросмотр"}</span>
                </button>
                <Dialog.Close asChild><button className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#f0ede6] cursor-pointer"><X className="h-4 w-4 text-[#888]" /></button></Dialog.Close>
              </div>
            </div>

            <div className="px-4 md:px-6 py-4 space-y-4">
              {showPreview ? (
                <HomeworkPreview title={hwTitle} sections={hwSections} />
              ) : (
                <>
                  <div><label className="text-[12px] font-medium text-[#888] mb-1 block">Название *</label>
                    <input value={hwTitle} onChange={(e) => setHwTitle(e.target.value)} placeholder="Домашнее задание — Present Simple"
                      className="w-full h-10 rounded-xl border border-[#e8e5de] px-3 text-[14px] outline-none focus:border-[#ccc]" autoFocus /></div>

                  {/* Template picker */}
                  {!editHwId && templates.length > 0 && (
                    <div>
                      <button onClick={() => setShowTemplates(!showTemplates)}
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-amber-600 hover:text-amber-700 cursor-pointer">
                        <FileDown className="h-3.5 w-3.5" /> {showTemplates ? "Скрыть шаблоны" : `Из шаблона (${templates.length})`}
                      </button>
                      {showTemplates && (
                        <div className="mt-2 space-y-1.5">
                          {templates.map((t) => (
                            <div key={t.id} className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 group/tpl">
                              <button onClick={() => {
                                setHwTitle(t.title);
                                setHwSections(t.sections.map((s) => ({ ...s, id: crypto.randomUUID() })));
                                setShowTemplates(false);
                              }} className="flex-1 text-left cursor-pointer min-w-0">
                                <p className="text-[13px] font-medium text-[#666] truncate">{t.title}</p>
                                <p className="text-[11px] text-[#888] truncate">{t.sections.length} секций · {t.sections.map((s) => typeLabels[s.type]).join(", ")}</p>
                              </button>
                              <button onClick={() => deleteTemplate(t.id)}
                                className="h-6 w-6 rounded flex items-center justify-center md:opacity-0 md:group-hover/tpl:opacity-100 hover:bg-red-100 cursor-pointer shrink-0">
                                <Trash2 className="h-3 w-3 text-red-400" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <SectionsListEditor sections={hwSections} onChange={setHwSections} showErrors={showErrors} />
                </>
              )}
            </div>

            {/* Sticky footer */}
            <div className="sticky bottom-0 bg-white border-t border-[#e8e5de] px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                {hwSections.length === 0 && <p className="text-[12px] text-[#888]">Добавьте хотя бы одну секцию</p>}
                {hwSections.length > 0 && (
                  <button onClick={() => { addTemplate(hwTitle || "Шаблон", hwSections); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-amber-600 hover:bg-amber-50 cursor-pointer">
                    <Bookmark className="h-3 w-3" /> Шаблон
                  </button>
                )}
                {showErrors && validationErrors.length > 0 && (
                  <p className="text-[12px] text-red-500 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {validationErrors.length} ошибок</p>
                )}
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Dialog.Close asChild><button className="flex-1 sm:flex-initial px-4 py-2.5 sm:py-2 rounded-full text-[13px] font-medium text-[#888] hover:bg-[#f0ede6] cursor-pointer">Отмена</button></Dialog.Close>
                <button onClick={saveHw} disabled={!hwTitle.trim() || hwSections.length === 0}
                  className="flex-1 sm:flex-initial px-5 py-2.5 sm:py-2 rounded-full bg-[#1a1a1a] text-white text-[13px] font-medium hover:bg-[#333] disabled:opacity-40 cursor-pointer">
                  {editHwId ? "Сохранить" : "Создать"}
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
