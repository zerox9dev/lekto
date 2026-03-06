import { useState } from "react";
import { Plus, ClipboardCheck, Pencil, Trash2, CheckCircle2, Circle } from "lucide-react";
import { useStore } from "@/lib/store";
import * as Dialog from "@radix-ui/react-dialog";
import type { HomeworkType, QuizQuestion, FillBlanksContent, MatchingContent, OrderingContent, CardsContent } from "@/types/database";

const typeLabels: Record<HomeworkType, string> = {
  quiz: "Тест",
  fill_blanks: "Вставить слово",
  matching: "Соединить пары",
  ordering: "Порядок",
  cards: "Карточки",
  text: "Текст",
};

function emptyContent(type: HomeworkType) {
  switch (type) {
    case "quiz": return [{ question: "", options: ["", ""], correct: 0 }] as QuizQuestion[];
    case "fill_blanks": return { text: "", answers: [""] } as FillBlanksContent;
    case "matching": return { pairs: [{ left: "", right: "" }] } as MatchingContent;
    case "ordering": return { items: ["", ""], correct_order: [0, 1] } as OrderingContent;
    case "text": return { text: "" };
  }
}

export function HomeworkPage() {
  const { students, lessons, homework, addHomework, deleteHomework } = useStore();
  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [title, setTitle] = useState("");
  const [hwType, setHwType] = useState<HomeworkType>("quiz");
  const [filterStudent, setFilterStudent] = useState("all");

  // ── Quiz builder state ──
  const [questions, setQuestions] = useState<QuizQuestion[]>([{ question: "", options: ["", ""], correct: 0 }]);

  // ── Fill blanks state ──
  const [fillText, setFillText] = useState("");
  const [fillAnswers, setFillAnswers] = useState([""]);

  // ── Matching state ──
  const [pairs, setPairs] = useState([{ left: "", right: "" }]);

  // ── Ordering state ──
  const [orderItems, setOrderItems] = useState(["", ""]);

  // ── Cards state ──
  const [cards, setCards] = useState([{ front: "", back: "" }]);

  // ── Text state ──
  const [textContent, setTextContent] = useState("");

  const studentLessons = lessonId ? [] : lessons.filter((l) => l.student_id === studentId);
  const filtered = filterStudent === "all" ? homework : homework.filter((h) => h.student_id === filterStudent);

  const studentName = (id: string) => students.find((s) => s.id === id)?.name ?? "—";
  const lessonTitle = (id: string) => lessons.find((l) => l.id === id)?.title ?? "—";

  const resetForm = () => {
    setStudentId(students[0]?.id ?? "");
    setLessonId("");
    setTitle("");
    setHwType("quiz");
    setQuestions([{ question: "", options: ["", ""], correct: 0 }]);
    setFillText("");
    setFillAnswers([""]);
    setPairs([{ left: "", right: "" }]);
    setOrderItems(["", ""]);
    setCards([{ front: "", back: "" }]);
    setTextContent("");
  };

  const handleSave = () => {
    if (!title.trim() || !studentId) return;
    let content: any;
    switch (hwType) {
      case "quiz": content = questions; break;
      case "fill_blanks": content = { text: fillText, answers: fillAnswers }; break;
      case "matching": content = { pairs }; break;
      case "ordering": content = { items: orderItems, correct_order: orderItems.map((_, i) => i) }; break;
      case "cards": content = { cards: cards.filter((c) => c.front.trim() || c.back.trim()) }; break;
      case "text": content = { text: textContent }; break;
    }
    addHomework({
      lesson_id: lessonId || "",
      student_id: studentId,
      tutor_id: "local",
      title: title.trim(),
      type: hwType,
      content,
      completed: false,
      student_answers: null,
      score: null,
    });
    setOpen(false);
    resetForm();
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
                <p className="text-[12px] text-zinc-400">{studentName(h.student_id)} · {typeLabels[h.type]}{h.score !== null ? ` · ${h.score}%` : ""}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => deleteHomework(h.id)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer">
                  <Trash2 className="h-3.5 w-3.5 text-zinc-400 hover:text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl z-50 space-y-5">
            <Dialog.Title className="text-lg font-bold">Новое задание</Dialog.Title>
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
                  <label className="text-[12px] font-medium text-zinc-500 mb-1 block">Урок (необязательно)</label>
                  <select value={lessonId} onChange={(e) => setLessonId(e.target.value)}
                    className="w-full h-10 rounded-xl border border-zinc-200 px-3 text-[14px] outline-none focus:border-zinc-400 bg-white">
                    <option value="">Без урока</option>
                    {lessons.filter((l) => l.student_id === studentId).map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="text-[12px] font-medium text-zinc-500 mb-1 block">Название *</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Present Simple — тест"
                  className="w-full h-10 rounded-xl border border-zinc-200 px-3 text-[14px] outline-none focus:border-zinc-400" autoFocus />
              </div>
              <div>
                <label className="text-[12px] font-medium text-zinc-500 mb-2 block">Тип задания</label>
                <div className="flex gap-2 flex-wrap">
                  {(Object.entries(typeLabels) as [HomeworkType, string][]).map(([key, label]) => (
                    <button key={key} onClick={() => setHwType(key)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${hwType === key ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quiz builder */}
              {hwType === "quiz" && (
                <div className="space-y-4 pt-2">
                  {questions.map((q, qi) => (
                    <div key={qi} className="rounded-xl border border-zinc-100 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium text-zinc-400">Вопрос {qi + 1}</span>
                        {questions.length > 1 && (
                          <button onClick={() => setQuestions(questions.filter((_, i) => i !== qi))}
                            className="text-[12px] text-red-400 hover:text-red-500 cursor-pointer">Удалить</button>
                        )}
                      </div>
                      <input value={q.question} onChange={(e) => { const nq = [...questions]; nq[qi] = { ...nq[qi], question: e.target.value }; setQuestions(nq); }}
                        placeholder="Вопрос" className="w-full h-9 rounded-lg border border-zinc-200 px-3 text-[13px] outline-none focus:border-zinc-400" />
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <button onClick={() => { const nq = [...questions]; nq[qi] = { ...nq[qi], correct: oi }; setQuestions(nq); }}
                            className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer ${q.correct === oi ? "border-emerald-500 bg-emerald-500" : "border-zinc-300"}`}>
                            {q.correct === oi && <div className="h-2 w-2 rounded-full bg-white" />}
                          </button>
                          <input value={opt} onChange={(e) => { const nq = [...questions]; nq[qi] = { ...nq[qi], options: nq[qi].options.map((o, i) => i === oi ? e.target.value : o) }; setQuestions(nq); }}
                            placeholder={`Вариант ${oi + 1}`} className="flex-1 h-9 rounded-lg border border-zinc-200 px-3 text-[13px] outline-none focus:border-zinc-400" />
                        </div>
                      ))}
                      <button onClick={() => { const nq = [...questions]; nq[qi] = { ...nq[qi], options: [...nq[qi].options, ""] }; setQuestions(nq); }}
                        className="text-[12px] text-zinc-400 hover:text-zinc-600 cursor-pointer">+ вариант</button>
                    </div>
                  ))}
                  <button onClick={() => setQuestions([...questions, { question: "", options: ["", ""], correct: 0 }])}
                    className="text-[13px] text-zinc-500 hover:text-zinc-700 font-medium cursor-pointer">+ Добавить вопрос</button>
                </div>
              )}

              {/* Fill blanks */}
              {hwType === "fill_blanks" && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-[12px] font-medium text-zinc-500 mb-1 block">Текст (используйте ___ для пропусков)</label>
                    <textarea value={fillText} onChange={(e) => setFillText(e.target.value)}
                      placeholder="The capital of France is ___" rows={3}
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-[13px] outline-none focus:border-zinc-400 resize-none" />
                  </div>
                  <div>
                    <label className="text-[12px] font-medium text-zinc-500 mb-1 block">Правильные ответы (по порядку)</label>
                    {fillAnswers.map((a, i) => (
                      <input key={i} value={a} onChange={(e) => { const na = [...fillAnswers]; na[i] = e.target.value; setFillAnswers(na); }}
                        placeholder={`Ответ ${i + 1}`} className="w-full h-9 rounded-lg border border-zinc-200 px-3 text-[13px] outline-none focus:border-zinc-400 mb-2" />
                    ))}
                    <button onClick={() => setFillAnswers([...fillAnswers, ""])}
                      className="text-[12px] text-zinc-400 hover:text-zinc-600 cursor-pointer">+ ответ</button>
                  </div>
                </div>
              )}

              {/* Matching */}
              {hwType === "matching" && (
                <div className="space-y-3 pt-2">
                  <label className="text-[12px] font-medium text-zinc-500 block">Пары</label>
                  {pairs.map((p, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input value={p.left} onChange={(e) => { const np = [...pairs]; np[i] = { ...np[i], left: e.target.value }; setPairs(np); }}
                        placeholder="Слева" className="flex-1 h-9 rounded-lg border border-zinc-200 px-3 text-[13px] outline-none focus:border-zinc-400" />
                      <span className="text-zinc-300">→</span>
                      <input value={p.right} onChange={(e) => { const np = [...pairs]; np[i] = { ...np[i], right: e.target.value }; setPairs(np); }}
                        placeholder="Справа" className="flex-1 h-9 rounded-lg border border-zinc-200 px-3 text-[13px] outline-none focus:border-zinc-400" />
                      {pairs.length > 1 && (
                        <button onClick={() => setPairs(pairs.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-500 cursor-pointer">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setPairs([...pairs, { left: "", right: "" }])}
                    className="text-[12px] text-zinc-400 hover:text-zinc-600 cursor-pointer">+ пара</button>
                </div>
              )}

              {/* Ordering */}
              {hwType === "ordering" && (
                <div className="space-y-3 pt-2">
                  <label className="text-[12px] font-medium text-zinc-500 block">Элементы (в правильном порядке)</label>
                  {orderItems.map((item, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <span className="text-[12px] text-zinc-400 w-5 text-center">{i + 1}</span>
                      <input value={item} onChange={(e) => { const ni = [...orderItems]; ni[i] = e.target.value; setOrderItems(ni); }}
                        placeholder={`Элемент ${i + 1}`} className="flex-1 h-9 rounded-lg border border-zinc-200 px-3 text-[13px] outline-none focus:border-zinc-400" />
                    </div>
                  ))}
                  <button onClick={() => setOrderItems([...orderItems, ""])}
                    className="text-[12px] text-zinc-400 hover:text-zinc-600 cursor-pointer">+ элемент</button>
                </div>
              )}

              {/* Cards */}
              {hwType === "cards" && (
                <div className="space-y-3 pt-2">
                  <label className="text-[12px] font-medium text-zinc-500 block">Карточки (лицо → оборот)</label>
                  {cards.map((c, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <span className="text-[12px] text-zinc-400 w-5 text-center">{i + 1}</span>
                      <input value={c.front} onChange={(e) => { const nc = [...cards]; nc[i] = { ...nc[i], front: e.target.value }; setCards(nc); }}
                        placeholder="Лицо (вопрос/слово)" className="flex-1 h-9 rounded-lg border border-zinc-200 px-3 text-[13px] outline-none focus:border-zinc-400" />
                      <input value={c.back} onChange={(e) => { const nc = [...cards]; nc[i] = { ...nc[i], back: e.target.value }; setCards(nc); }}
                        placeholder="Оборот (ответ/перевод)" className="flex-1 h-9 rounded-lg border border-zinc-200 px-3 text-[13px] outline-none focus:border-zinc-400" />
                      {cards.length > 1 && (
                        <button onClick={() => setCards(cards.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-500 cursor-pointer">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setCards([...cards, { front: "", back: "" }])}
                    className="text-[12px] text-zinc-400 hover:text-zinc-600 cursor-pointer">+ карточка</button>
                </div>
              )}

              {/* Text */}
              {hwType === "text" && (
                <div className="pt-2">
                  <label className="text-[12px] font-medium text-zinc-500 mb-1 block">Задание</label>
                  <textarea value={textContent} onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Напишите сочинение на тему..." rows={4}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-[13px] outline-none focus:border-zinc-400 resize-none" />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <button className="px-4 py-2 rounded-xl text-[13px] font-medium text-zinc-500 hover:bg-zinc-100 transition-colors cursor-pointer">Отмена</button>
              </Dialog.Close>
              <button onClick={handleSave} disabled={!title.trim() || !studentId}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-[13px] font-medium hover:bg-zinc-800 transition-colors disabled:opacity-40 cursor-pointer">
                Создать
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
