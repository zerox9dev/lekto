import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, BookOpen, ClipboardCheck, Pencil, Trash2, Copy, Check, ExternalLink, ChevronDown, ChevronUp, CheckCircle2, Circle } from "lucide-react";
import { useStore } from "@/lib/store";
import * as Dialog from "@radix-ui/react-dialog";
import type { HomeworkType, HomeworkSection, QuizQuestion, FillBlanksContent, MatchingContent, OrderingContent, CardsContent, Homework, Lesson } from "@/types/database";

const typeLabels: Record<HomeworkType, string> = {
  quiz: "Тест", fill_blanks: "Вставить слово", matching: "Соединить пары",
  ordering: "Порядок", cards: "Карточки", text: "Текст",
};

// ── Section Editors (same as before, compact) ──

function QuizEditor({ section, onChange }: { section: HomeworkSection; onChange: (s: HomeworkSection) => void }) {
  const questions = section.content as QuizQuestion[];
  const setQ = (nq: QuizQuestion[]) => onChange({ ...section, content: nq });
  return (
    <div className="space-y-3">
      {questions.map((q, qi) => (
        <div key={qi} className="rounded-lg border border-zinc-100 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-400">Вопрос {qi + 1}</span>
            {questions.length > 1 && <button onClick={() => setQ(questions.filter((_, i) => i !== qi))} className="text-[11px] text-red-400 cursor-pointer">Удалить</button>}
          </div>
          <input value={q.question} onChange={(e) => { const nq = [...questions]; nq[qi] = { ...nq[qi], question: e.target.value }; setQ(nq); }}
            placeholder="Вопрос" className="w-full h-8 rounded-lg border border-zinc-200 px-2.5 text-[13px] outline-none focus:border-zinc-400" />
          {q.options.map((opt, oi) => (
            <div key={oi} className="flex items-center gap-2">
              <button onClick={() => { const nq = [...questions]; nq[qi] = { ...nq[qi], correct: oi }; setQ(nq); }}
                className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer ${q.correct === oi ? "border-emerald-500 bg-emerald-500" : "border-zinc-300"}`}>
                {q.correct === oi && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
              </button>
              <input value={opt} onChange={(e) => { const nq = [...questions]; nq[qi] = { ...nq[qi], options: nq[qi].options.map((o, i) => i === oi ? e.target.value : o) }; setQ(nq); }}
                placeholder={`Вариант ${oi + 1}`} className="flex-1 h-8 rounded-lg border border-zinc-200 px-2.5 text-[13px] outline-none focus:border-zinc-400" />
            </div>
          ))}
          <button onClick={() => { const nq = [...questions]; nq[qi] = { ...nq[qi], options: [...nq[qi].options, ""] }; setQ(nq); }}
            className="text-[11px] text-zinc-400 cursor-pointer">+ вариант</button>
        </div>
      ))}
      <button onClick={() => setQ([...questions, { question: "", options: ["", ""], correct: 0 }])}
        className="text-[12px] text-zinc-500 font-medium cursor-pointer">+ Вопрос</button>
    </div>
  );
}

function FillBlanksEditor({ section, onChange }: { section: HomeworkSection; onChange: (s: HomeworkSection) => void }) {
  const c = section.content as FillBlanksContent;
  return (
    <div className="space-y-2">
      <textarea value={c.text} onChange={(e) => onChange({ ...section, content: { ...c, text: e.target.value } })}
        placeholder="Текст с ___ для пропусков" rows={2} className="w-full rounded-lg border border-zinc-200 px-2.5 py-2 text-[13px] outline-none focus:border-zinc-400 resize-none" />
      {c.answers.map((a, i) => (
        <input key={i} value={a} onChange={(e) => { const na = [...c.answers]; na[i] = e.target.value; onChange({ ...section, content: { ...c, answers: na } }); }}
          placeholder={`Ответ ${i + 1}`} className="w-full h-8 rounded-lg border border-zinc-200 px-2.5 text-[13px] outline-none focus:border-zinc-400" />
      ))}
      <button onClick={() => onChange({ ...section, content: { ...c, answers: [...c.answers, ""] } })} className="text-[11px] text-zinc-400 cursor-pointer">+ ответ</button>
    </div>
  );
}

function MatchingEditor({ section, onChange }: { section: HomeworkSection; onChange: (s: HomeworkSection) => void }) {
  const c = section.content as MatchingContent;
  return (
    <div className="space-y-2">
      {c.pairs.map((p, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input value={p.left} onChange={(e) => { const np = [...c.pairs]; np[i] = { ...np[i], left: e.target.value }; onChange({ ...section, content: { pairs: np } }); }}
            placeholder="Слева" className="flex-1 h-8 rounded-lg border border-zinc-200 px-2.5 text-[13px] outline-none focus:border-zinc-400" />
          <span className="text-zinc-300 text-[12px]">→</span>
          <input value={p.right} onChange={(e) => { const np = [...c.pairs]; np[i] = { ...np[i], right: e.target.value }; onChange({ ...section, content: { pairs: np } }); }}
            placeholder="Справа" className="flex-1 h-8 rounded-lg border border-zinc-200 px-2.5 text-[13px] outline-none focus:border-zinc-400" />
          {c.pairs.length > 1 && <button onClick={() => onChange({ ...section, content: { pairs: c.pairs.filter((_, j) => j !== i) } })} className="text-red-400 cursor-pointer"><Trash2 className="h-3 w-3" /></button>}
        </div>
      ))}
      <button onClick={() => onChange({ ...section, content: { pairs: [...c.pairs, { left: "", right: "" }] } })} className="text-[11px] text-zinc-400 cursor-pointer">+ пара</button>
    </div>
  );
}

function OrderingEditor({ section, onChange }: { section: HomeworkSection; onChange: (s: HomeworkSection) => void }) {
  const c = section.content as OrderingContent;
  return (
    <div className="space-y-2">
      {c.items.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <span className="text-[11px] text-zinc-400 w-4 text-center">{i + 1}</span>
          <input value={item} onChange={(e) => { const ni = [...c.items]; ni[i] = e.target.value; onChange({ ...section, content: { items: ni, correct_order: ni.map((_, j) => j) } }); }}
            placeholder={`Элемент ${i + 1}`} className="flex-1 h-8 rounded-lg border border-zinc-200 px-2.5 text-[13px] outline-none focus:border-zinc-400" />
        </div>
      ))}
      <button onClick={() => onChange({ ...section, content: { items: [...c.items, ""], correct_order: [...c.items, ""].map((_, i) => i) } })} className="text-[11px] text-zinc-400 cursor-pointer">+ элемент</button>
    </div>
  );
}

function CardsEditor({ section, onChange }: { section: HomeworkSection; onChange: (s: HomeworkSection) => void }) {
  const c = section.content as CardsContent;
  return (
    <div className="space-y-2">
      {c.cards.map((card, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input value={card.front} onChange={(e) => { const nc = [...c.cards]; nc[i] = { ...nc[i], front: e.target.value }; onChange({ ...section, content: { cards: nc } }); }}
            placeholder="Лицо" className="flex-1 h-8 rounded-lg border border-zinc-200 px-2.5 text-[13px] outline-none focus:border-zinc-400" />
          <input value={card.back} onChange={(e) => { const nc = [...c.cards]; nc[i] = { ...nc[i], back: e.target.value }; onChange({ ...section, content: { cards: nc } }); }}
            placeholder="Оборот" className="flex-1 h-8 rounded-lg border border-zinc-200 px-2.5 text-[13px] outline-none focus:border-zinc-400" />
          {c.cards.length > 1 && <button onClick={() => onChange({ ...section, content: { cards: c.cards.filter((_, j) => j !== i) } })} className="text-red-400 cursor-pointer"><Trash2 className="h-3 w-3" /></button>}
        </div>
      ))}
      <button onClick={() => onChange({ ...section, content: { cards: [...c.cards, { front: "", back: "" }] } })} className="text-[11px] text-zinc-400 cursor-pointer">+ карточка</button>
    </div>
  );
}

function TextEditor({ section, onChange }: { section: HomeworkSection; onChange: (s: HomeworkSection) => void }) {
  const c = section.content as { text: string };
  return <textarea value={c.text} onChange={(e) => onChange({ ...section, content: { text: e.target.value } })}
    placeholder="Текст задания..." rows={3} className="w-full rounded-lg border border-zinc-200 px-2.5 py-2 text-[13px] outline-none focus:border-zinc-400 resize-none" />;
}

function SectionEditor({ section, onChange, onDelete, index }: { section: HomeworkSection; onChange: (s: HomeworkSection) => void; onDelete: () => void; index: number }) {
  const editors: Record<HomeworkType, any> = { quiz: QuizEditor, fill_blanks: FillBlanksEditor, matching: MatchingEditor, ordering: OrderingEditor, cards: CardsEditor, text: TextEditor };
  const Editor = editors[section.type];
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md">{typeLabels[section.type]}</span>
        <button onClick={onDelete} className="text-[11px] text-red-400 cursor-pointer">Удалить</button>
      </div>
      <input value={section.title} onChange={(e) => onChange({ ...section, title: e.target.value })}
        placeholder="Название секции" className="w-full h-8 rounded-lg border border-zinc-200 px-2.5 text-[13px] font-medium outline-none focus:border-zinc-400" />
      <Editor section={section} onChange={onChange} />
    </div>
  );
}

function emptySection(type: HomeworkType): HomeworkSection {
  const id = crypto.randomUUID();
  switch (type) {
    case "quiz": return { id, type, title: "Тест", content: [{ question: "", options: ["", ""], correct: 0 }] };
    case "fill_blanks": return { id, type, title: "Вставить слово", content: { text: "", answers: [""] } };
    case "matching": return { id, type, title: "Соединить пары", content: { pairs: [{ left: "", right: "" }] } };
    case "ordering": return { id, type, title: "Порядок", content: { items: ["", ""], correct_order: [0, 1] } };
    case "cards": return { id, type, title: "Карточки", content: { cards: [{ front: "", back: "" }] } };
    case "text": return { id, type, title: "Задание", content: { text: "" } };
  }
}

// ── Lesson Card (tutor view) — shows homework inside ──

function LessonCard({ lesson, homeworkItems, onEditLesson, onDeleteLesson, onNewHw, onEditHw, onDeleteHw }: {
  lesson: Lesson; homeworkItems: Homework[];
  onEditLesson: () => void; onDeleteLesson: () => void;
  onNewHw: () => void; onEditHw: (h: Homework) => void; onDeleteHw: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const completedHw = homeworkItems.filter((h) => h.completed).length;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 group">
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer">
          <div className="h-9 w-9 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
            <BookOpen className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium truncate">{lesson.title}</p>
            <p className="text-[12px] text-zinc-400">
              {lesson.date}
              {homeworkItems.length > 0 && (
                <span className={completedHw === homeworkItems.length ? "text-emerald-500" : ""}>
                  {" "}· {completedHw}/{homeworkItems.length} заданий
                </span>
              )}
            </p>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-zinc-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0" />}
        </button>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEditLesson} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-zinc-100 cursor-pointer">
            <Pencil className="h-3.5 w-3.5 text-zinc-400" />
          </button>
          <button onClick={onDeleteLesson} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 cursor-pointer">
            <Trash2 className="h-3.5 w-3.5 text-zinc-400 hover:text-red-500" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {lesson.notes && (
            <div className="rounded-lg bg-zinc-50 px-3 py-2.5">
              <p className="text-[13px] text-zinc-600 whitespace-pre-wrap leading-relaxed">{lesson.notes}</p>
            </div>
          )}

          {/* Homework list */}
          {homeworkItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Домашние задания</p>
              {homeworkItems.map((h) => {
                const sectionTypes = (h.sections || []).map((s) => typeLabels[s.type]).join(", ");
                return (
                  <div key={h.id} className="rounded-lg border border-zinc-100 px-3 py-2 flex items-center gap-3 group/hw hover:border-zinc-200 transition-colors">
                    {h.completed ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> : <Circle className="h-3.5 w-3.5 text-zinc-300 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate">{h.title}</p>
                      <p className="text-[11px] text-zinc-400">{sectionTypes}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover/hw:opacity-100 transition-opacity">
                      <button onClick={() => onEditHw(h)} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-zinc-100 cursor-pointer">
                        <Pencil className="h-3 w-3 text-zinc-400" />
                      </button>
                      <button onClick={() => onDeleteHw(h.id)} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-red-50 cursor-pointer">
                        <Trash2 className="h-3 w-3 text-zinc-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button onClick={onNewHw}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-zinc-500 hover:bg-zinc-100 transition-colors cursor-pointer">
            <Plus className="h-3.5 w-3.5" /> Добавить домашку
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main ──

export function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { students, lessons, homework, addLesson, updateLesson, deleteLesson, addHomework, updateHomework, deleteHomework } = useStore();

  const student = students.find((s) => s.id === id);
  const studentLessons = student ? lessons.filter((l) => l.student_id === student.id).sort((a, b) => b.date.localeCompare(a.date)) : [];
  const studentHomework = student ? homework.filter((h) => h.student_id === student.id) : [];

  // Lesson dialog
  const [lessonOpen, setLessonOpen] = useState(false);
  const [editLessonId, setEditLessonId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDate, setLessonDate] = useState(new Date().toISOString().slice(0, 10));
  const [lessonNotes, setLessonNotes] = useState("");

  // Homework dialog
  const [hwOpen, setHwOpen] = useState(false);
  const [editHwId, setEditHwId] = useState<string | null>(null);
  const [hwTitle, setHwTitle] = useState("");
  const [hwLessonId, setHwLessonId] = useState("");
  const [hwSections, setHwSections] = useState<HomeworkSection[]>([]);

  const [copied, setCopied] = useState(false);

  if (!student) {
    return (
      <div className="py-20 text-center">
        <p className="text-[14px] text-zinc-400">Ученик не найден</p>
        <Link to="/app" className="text-[13px] text-zinc-500 underline mt-2 inline-block">← Назад</Link>
      </div>
    );
  }

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/s/${student.share_id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Lesson
  const openNewLesson = () => { setEditLessonId(null); setLessonTitle(""); setLessonDate(new Date().toISOString().slice(0, 10)); setLessonNotes(""); setLessonOpen(true); };
  const openEditLesson = (l: Lesson) => { setEditLessonId(l.id); setLessonTitle(l.title); setLessonDate(l.date); setLessonNotes(l.notes || ""); setLessonOpen(true); };
  const saveLesson = () => {
    if (!lessonTitle.trim()) return;
    if (editLessonId) updateLesson(editLessonId, { title: lessonTitle.trim(), date: lessonDate, notes: lessonNotes.trim() || null });
    else addLesson(student.id, lessonTitle.trim(), lessonDate, lessonNotes.trim() || undefined);
    setLessonOpen(false);
  };

  // Homework (always tied to lesson)
  const openNewHw = (lessonId: string) => { setEditHwId(null); setHwTitle(""); setHwLessonId(lessonId); setHwSections([]); setHwOpen(true); };
  const openEditHw = (h: Homework) => { setEditHwId(h.id); setHwTitle(h.title); setHwLessonId(h.lesson_id); setHwSections(h.sections || []); setHwOpen(true); };
  const saveHw = () => {
    if (!hwTitle.trim() || !hwLessonId || hwSections.length === 0) return;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link to="/app" className="mt-1.5 h-8 w-8 rounded-lg flex items-center justify-center hover:bg-zinc-100 transition-colors shrink-0">
          <ArrowLeft className="h-4 w-4 text-zinc-400" />
        </Link>
        <img src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(student.name)}`} alt={student.name} className="h-12 w-12 rounded-full bg-zinc-100 shrink-0" />
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-tight">{student.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            {student.telegram && <span className="text-[12px] text-zinc-400">@{student.telegram.replace(/^@/, "")}</span>}
            <button onClick={copyLink} className="inline-flex items-center gap-1 text-[12px] text-zinc-400 hover:text-zinc-600 cursor-pointer">
              {copied ? <><Check className="h-3 w-3 text-emerald-500" /> Скопировано</> : <><Copy className="h-3 w-3" /> Ссылка</>}
            </button>
            <a href={`/s/${student.share_id}`} target="_blank" className="inline-flex items-center gap-1 text-[12px] text-zinc-400 hover:text-zinc-600">
              <ExternalLink className="h-3 w-3" /> Портал
            </a>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-center">
          <p className="text-[20px] font-bold">{studentLessons.length}</p>
          <p className="text-[11px] text-zinc-400">уроков</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-center">
          <p className="text-[20px] font-bold">{completedHw}/{studentHomework.length}</p>
          <p className="text-[11px] text-zinc-400">заданий</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-center">
          <p className="text-[20px] font-bold">{avgScore !== null ? `${avgScore}%` : "—"}</p>
          <p className="text-[11px] text-zinc-400">средний балл</p>
        </div>
      </div>

      {/* Lessons + Homework inside */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-semibold">Уроки</h2>
          <button onClick={openNewLesson}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-[12px] font-medium hover:bg-zinc-800 cursor-pointer">
            <Plus className="h-3.5 w-3.5" /> Добавить урок
          </button>
        </div>

        {studentLessons.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white py-16 text-center">
            <p className="text-[14px] text-zinc-400">Уроков пока нет</p>
          </div>
        ) : (
          studentLessons.map((l) => (
            <LessonCard key={l.id} lesson={l}
              homeworkItems={studentHomework.filter((h) => h.lesson_id === l.id)}
              onEditLesson={() => openEditLesson(l)}
              onDeleteLesson={() => deleteLesson(l.id)}
              onNewHw={() => openNewHw(l.id)}
              onEditHw={openEditHw}
              onDeleteHw={deleteHomework} />
          ))
        )}
      </div>

      {/* Lesson Dialog */}
      <Dialog.Root open={lessonOpen} onOpenChange={setLessonOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl z-50 space-y-4">
            <Dialog.Title className="text-lg font-bold">{editLessonId ? "Редактировать урок" : "Новый урок"}</Dialog.Title>
            <div className="space-y-3">
              <div>
                <label className="text-[12px] font-medium text-zinc-500 mb-1 block">Название *</label>
                <input value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} placeholder="Present Simple — урок 5"
                  className="w-full h-10 rounded-xl border border-zinc-200 px-3 text-[14px] outline-none focus:border-zinc-400" autoFocus />
              </div>
              <div>
                <label className="text-[12px] font-medium text-zinc-500 mb-1 block">Дата</label>
                <input type="date" value={lessonDate} onChange={(e) => setLessonDate(e.target.value)}
                  className="w-full h-10 rounded-xl border border-zinc-200 px-3 text-[14px] outline-none focus:border-zinc-400" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-zinc-500 mb-1 block">Заметки</label>
                <textarea value={lessonNotes} onChange={(e) => setLessonNotes(e.target.value)} placeholder="Конспект, материалы..." rows={4}
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-[14px] outline-none focus:border-zinc-400 resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild><button className="px-4 py-2 rounded-xl text-[13px] font-medium text-zinc-500 hover:bg-zinc-100 cursor-pointer">Отмена</button></Dialog.Close>
              <button onClick={saveLesson} disabled={!lessonTitle.trim()}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-[13px] font-medium hover:bg-zinc-800 disabled:opacity-40 cursor-pointer">
                {editLessonId ? "Сохранить" : "Создать"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Homework Dialog */}
      <Dialog.Root open={hwOpen} onOpenChange={setHwOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl z-50 space-y-4">
            <Dialog.Title className="text-lg font-bold">{editHwId ? "Редактировать задание" : "Новое задание"}</Dialog.Title>
            <div>
              <label className="text-[12px] font-medium text-zinc-500 mb-1 block">Название *</label>
              <input value={hwTitle} onChange={(e) => setHwTitle(e.target.value)} placeholder="Домашнее задание"
                className="w-full h-10 rounded-xl border border-zinc-200 px-3 text-[14px] outline-none focus:border-zinc-400" autoFocus />
            </div>
            <div className="space-y-3">
              {hwSections.map((sec, i) => (
                <SectionEditor key={sec.id} section={sec} index={i}
                  onChange={(s) => setHwSections(hwSections.map((x, j) => j === i ? s : x))}
                  onDelete={() => setHwSections(hwSections.filter((_, j) => j !== i))} />
              ))}
              <div className="rounded-xl border border-dashed border-zinc-200 p-3">
                <p className="text-[11px] text-zinc-400 mb-2">Добавить секцию:</p>
                <div className="flex gap-1.5 flex-wrap">
                  {(Object.entries(typeLabels) as [HomeworkType, string][]).map(([key, label]) => (
                    <button key={key} onClick={() => setHwSections([...hwSections, emptySection(key)])}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-zinc-100 text-zinc-500 hover:bg-zinc-200 cursor-pointer">+ {label}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild><button className="px-4 py-2 rounded-xl text-[13px] font-medium text-zinc-500 hover:bg-zinc-100 cursor-pointer">Отмена</button></Dialog.Close>
              <button onClick={saveHw} disabled={!hwTitle.trim() || hwSections.length === 0}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-[13px] font-medium hover:bg-zinc-800 disabled:opacity-40 cursor-pointer">
                {editHwId ? "Сохранить" : "Создать"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
