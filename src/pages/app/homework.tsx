import { useState } from "react";
import { Plus, ClipboardCheck, Pencil, Trash2, CheckCircle2, Circle, GripVertical } from "lucide-react";
import { useStore } from "@/lib/store";
import * as Dialog from "@radix-ui/react-dialog";
import type { HomeworkType, HomeworkSection, QuizQuestion, FillBlanksContent, MatchingContent, OrderingContent, CardsContent, Homework } from "@/types/database";

const typeLabels: Record<HomeworkType, string> = {
  quiz: "Тест",
  fill_blanks: "Вставить слово",
  matching: "Соединить пары",
  ordering: "Порядок",
  cards: "Карточки",
  text: "Текст",
};

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

// ── Section Editors ──

function QuizEditor({ section, onChange }: { section: HomeworkSection; onChange: (s: HomeworkSection) => void }) {
  const questions = section.content as QuizQuestion[];
  const setQ = (nq: QuizQuestion[]) => onChange({ ...section, content: nq });

  return (
    <div className="space-y-3">
      {questions.map((q, qi) => (
        <div key={qi} className="rounded-lg border border-zinc-100 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-400">Вопрос {qi + 1}</span>
            {questions.length > 1 && (
              <button onClick={() => setQ(questions.filter((_, i) => i !== qi))} className="text-[11px] text-red-400 cursor-pointer">Удалить</button>
            )}
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
            className="text-[11px] text-zinc-400 hover:text-zinc-600 cursor-pointer">+ вариант</button>
        </div>
      ))}
      <button onClick={() => setQ([...questions, { question: "", options: ["", ""], correct: 0 }])}
        className="text-[12px] text-zinc-500 hover:text-zinc-700 font-medium cursor-pointer">+ Вопрос</button>
    </div>
  );
}

function FillBlanksEditor({ section, onChange }: { section: HomeworkSection; onChange: (s: HomeworkSection) => void }) {
  const c = section.content as FillBlanksContent;
  return (
    <div className="space-y-2">
      <textarea value={c.text} onChange={(e) => onChange({ ...section, content: { ...c, text: e.target.value } })}
        placeholder="Текст с ___ для пропусков" rows={2}
        className="w-full rounded-lg border border-zinc-200 px-2.5 py-2 text-[13px] outline-none focus:border-zinc-400 resize-none" />
      <label className="text-[11px] text-zinc-400">Ответы:</label>
      {c.answers.map((a, i) => (
        <input key={i} value={a} onChange={(e) => { const na = [...c.answers]; na[i] = e.target.value; onChange({ ...section, content: { ...c, answers: na } }); }}
          placeholder={`Ответ ${i + 1}`} className="w-full h-8 rounded-lg border border-zinc-200 px-2.5 text-[13px] outline-none focus:border-zinc-400" />
      ))}
      <button onClick={() => onChange({ ...section, content: { ...c, answers: [...c.answers, ""] } })}
        className="text-[11px] text-zinc-400 hover:text-zinc-600 cursor-pointer">+ ответ</button>
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
          {c.pairs.length > 1 && (
            <button onClick={() => onChange({ ...section, content: { pairs: c.pairs.filter((_, j) => j !== i) } })} className="text-red-400 cursor-pointer">
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}
      <button onClick={() => onChange({ ...section, content: { pairs: [...c.pairs, { left: "", right: "" }] } })}
        className="text-[11px] text-zinc-400 hover:text-zinc-600 cursor-pointer">+ пара</button>
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
      <button onClick={() => onChange({ ...section, content: { items: [...c.items, ""], correct_order: [...c.items, ""].map((_, i) => i) } })}
        className="text-[11px] text-zinc-400 hover:text-zinc-600 cursor-pointer">+ элемент</button>
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
          {c.cards.length > 1 && (
            <button onClick={() => onChange({ ...section, content: { cards: c.cards.filter((_, j) => j !== i) } })} className="text-red-400 cursor-pointer">
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}
      <button onClick={() => onChange({ ...section, content: { cards: [...c.cards, { front: "", back: "" }] } })}
        className="text-[11px] text-zinc-400 hover:text-zinc-600 cursor-pointer">+ карточка</button>
    </div>
  );
}

function TextEditor({ section, onChange }: { section: HomeworkSection; onChange: (s: HomeworkSection) => void }) {
  const c = section.content as { text: string };
  return (
    <textarea value={c.text} onChange={(e) => onChange({ ...section, content: { text: e.target.value } })}
      placeholder="Текст задания..." rows={3}
      className="w-full rounded-lg border border-zinc-200 px-2.5 py-2 text-[13px] outline-none focus:border-zinc-400 resize-none" />
  );
}

function SectionEditor({ section, onChange, onDelete, index }: {
  section: HomeworkSection; onChange: (s: HomeworkSection) => void; onDelete: () => void; index: number;
}) {
  const editors: Record<HomeworkType, any> = {
    quiz: QuizEditor, fill_blanks: FillBlanksEditor, matching: MatchingEditor,
    ordering: OrderingEditor, cards: CardsEditor, text: TextEditor,
  };
  const Editor = editors[section.type];

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-zinc-300">{index + 1}</span>
          <span className="text-[12px] font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md">{typeLabels[section.type]}</span>
        </div>
        <button onClick={onDelete} className="text-[11px] text-red-400 hover:text-red-500 cursor-pointer">Удалить</button>
      </div>
      <input value={section.title} onChange={(e) => onChange({ ...section, title: e.target.value })}
        placeholder="Название секции" className="w-full h-8 rounded-lg border border-zinc-200 px-2.5 text-[13px] font-medium outline-none focus:border-zinc-400" />
      <Editor section={section} onChange={onChange} />
    </div>
  );
}

// ── Main Page ──

export function HomeworkPage() {
  const { students, lessons, homework, addHomework, updateHomework, deleteHomework } = useStore();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [studentId, setStudentId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [title, setTitle] = useState("");
  const [sections, setSections] = useState<HomeworkSection[]>([]);
  const [filterStudent, setFilterStudent] = useState("all");

  const filtered = filterStudent === "all" ? homework : homework.filter((h) => h.student_id === filterStudent);
  const studentName = (id: string) => students.find((s) => s.id === id)?.name ?? "—";

  const resetForm = () => {
    setEditId(null);
    setStudentId(students[0]?.id ?? "");
    setLessonId("");
    setTitle("");
    setSections([]);
  };

  const handleEdit = (h: Homework) => {
    setEditId(h.id);
    setStudentId(h.student_id);
    setLessonId(h.lesson_id || "");
    setTitle(h.title);
    setSections(h.sections || []);
    setOpen(true);
  };

  const handleSave = () => {
    if (!title.trim() || !studentId || sections.length === 0) return;
    if (editId) {
      updateHomework(editId, {
        student_id: studentId,
        lesson_id: lessonId || "",
        title: title.trim(),
        sections,
      });
    } else {
      addHomework({
        lesson_id: lessonId || "",
        student_id: studentId,
        tutor_id: "local",
        title: title.trim(),
        sections,
        completed: false,
        student_answers: null,
        scores: null,
      });
    }
    setOpen(false);
    resetForm();
  };

  const updateSection = (idx: number, s: HomeworkSection) => {
    setSections(sections.map((sec, i) => i === idx ? s : sec));
  };

  const deleteSection = (idx: number) => {
    setSections(sections.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Домашние задания</h1>
          <p className="text-[13px] text-zinc-400 mt-0.5">{filtered.length} заданий</p>
        </div>
        <button
          onClick={() => { resetForm(); setOpen(true); }}
          disabled={students.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white text-[13px] font-medium hover:bg-zinc-800 transition-colors disabled:opacity-40 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Создать задание
        </button>
      </div>

      {/* Filter */}
      {students.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterStudent("all")}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${filterStudent === "all" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"}`}>
            Все
          </button>
          {students.map((s) => (
            <button key={s.id} onClick={() => setFilterStudent(s.id)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${filterStudent === s.id ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"}`}>
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {students.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white py-20 text-center">
          <p className="text-[14px] text-zinc-400">Сначала добавьте ученика</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white py-20 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
            <ClipboardCheck className="h-5 w-5 text-zinc-400" />
          </div>
          <p className="text-[15px] font-medium text-zinc-900 mb-1">Заданий пока нет</p>
          <p className="text-[13px] text-zinc-400">Создайте первое задание</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((h) => (
            <div key={h.id} className="rounded-xl border border-zinc-200 bg-white px-4 py-3 flex items-center gap-4 group hover:border-zinc-300 transition-colors">
              <div className="h-9 w-9 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                {h.completed ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4 text-zinc-300" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium truncate">{h.title}</p>
                <p className="text-[12px] text-zinc-400">
                  {studentName(h.student_id)} · {(h.sections || []).map((s) => typeLabels[s.type]).join(", ") || "—"}
                </p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(h)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-zinc-100 transition-colors cursor-pointer">
                  <Pencil className="h-3.5 w-3.5 text-zinc-400" />
                </button>
                <button onClick={() => deleteHomework(h.id)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer">
                  <Trash2 className="h-3.5 w-3.5 text-zinc-400 hover:text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl z-50 space-y-5">
            <Dialog.Title className="text-lg font-bold">
              {editId ? "Редактировать задание" : "Новое задание"}
            </Dialog.Title>

            <div className="space-y-3">
              <div>
                <label className="text-[12px] font-medium text-zinc-500 mb-1 block">Ученик *</label>
                <select value={studentId} onChange={(e) => { setStudentId(e.target.value); setLessonId(""); }}
                  className="w-full h-10 rounded-xl border border-zinc-200 px-3 text-[14px] outline-none focus:border-zinc-400 bg-white">
                  <option value="">Выберите</option>
                  {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              {studentId && lessons.filter((l) => l.student_id === studentId).length > 0 && (
                <div>
                  <label className="text-[12px] font-medium text-zinc-500 mb-1 block">Урок</label>
                  <select value={lessonId} onChange={(e) => setLessonId(e.target.value)}
                    className="w-full h-10 rounded-xl border border-zinc-200 px-3 text-[14px] outline-none focus:border-zinc-400 bg-white">
                    <option value="">Без урока</option>
                    {lessons.filter((l) => l.student_id === studentId).map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="text-[12px] font-medium text-zinc-500 mb-1 block">Название *</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Домашнее задание №5"
                  className="w-full h-10 rounded-xl border border-zinc-200 px-3 text-[14px] outline-none focus:border-zinc-400" autoFocus />
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-medium text-zinc-500">Секции ({sections.length})</label>
              </div>

              {sections.map((sec, i) => (
                <SectionEditor key={sec.id} section={sec} index={i}
                  onChange={(s) => updateSection(i, s)}
                  onDelete={() => deleteSection(i)} />
              ))}

              {/* Add section buttons */}
              <div className="rounded-xl border border-dashed border-zinc-200 p-3">
                <p className="text-[11px] text-zinc-400 mb-2">Добавить секцию:</p>
                <div className="flex gap-1.5 flex-wrap">
                  {(Object.entries(typeLabels) as [HomeworkType, string][]).map(([key, label]) => (
                    <button key={key} onClick={() => setSections([...sections, emptySection(key)])}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-colors cursor-pointer">
                      + {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <button className="px-4 py-2 rounded-xl text-[13px] font-medium text-zinc-500 hover:bg-zinc-100 transition-colors cursor-pointer">Отмена</button>
              </Dialog.Close>
              <button onClick={handleSave} disabled={!title.trim() || !studentId || sections.length === 0}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-[13px] font-medium hover:bg-zinc-800 transition-colors disabled:opacity-40 cursor-pointer">
                {editId ? "Сохранить" : "Создать"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
