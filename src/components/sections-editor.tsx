import { useState, useMemo } from "react";
import { Trash2, CopyPlus, ChevronDown, ChevronUp, Check, X, AlertCircle, Upload } from "lucide-react";
import type { HomeworkType, HomeworkSection, QuizQuestion, FillBlanksContent, MatchingContent, OrderingContent, CardsContent, TrueFalseContent, TrueFalseQuestion, OpenAnswerContent } from "@/types/database";

export const typeLabels: Record<HomeworkType, string> = {
  quiz: "Тест", fill_blanks: "Вставить слово", matching: "Соединить пары",
  ordering: "Порядок", cards: "Карточки", text: "Текст",
  true_false: "Верно / Неверно", open_answer: "Открытый ответ",
};
export const typeIcons: Record<HomeworkType, string> = {
  quiz: "📝", fill_blanks: "✏️", matching: "🔗", ordering: "📋", cards: "🃏", text: "📄",
  true_false: "✅", open_answer: "💬",
};

// ── Helpers ──

function getCorrectIndices(q: QuizQuestion): number[] {
  return Array.isArray(q.correct) ? q.correct : [q.correct];
}

function isCorrectIndex(q: QuizQuestion, idx: number): boolean {
  return getCorrectIndices(q).includes(idx);
}

// ── Validation ──

export interface ValidationError { sectionIndex: number; message: string; }

export function validateSections(sections: HomeworkSection[]): ValidationError[] {
  const errors: ValidationError[] = [];
  sections.forEach((sec, i) => {
    if (!sec.title.trim()) errors.push({ sectionIndex: i, message: "Нет названия секции" });

    if (sec.type === "quiz") {
      const qs = sec.content as QuizQuestion[];
      if (qs.length === 0) { errors.push({ sectionIndex: i, message: "Нет вопросов" }); return; }
      qs.forEach((q, qi) => {
        if (!q.question.trim()) errors.push({ sectionIndex: i, message: `Вопрос ${qi + 1}: пустой текст` });
        if (q.options.some((o) => !o.trim())) errors.push({ sectionIndex: i, message: `Вопрос ${qi + 1}: пустой вариант` });
        if (q.options.length < 2) errors.push({ sectionIndex: i, message: `Вопрос ${qi + 1}: нужно минимум 2 варианта` });
        const correct = getCorrectIndices(q);
        if (correct.length === 0) errors.push({ sectionIndex: i, message: `Вопрос ${qi + 1}: не выбран правильный ответ` });
      });
    }
    if (sec.type === "fill_blanks") {
      const c = sec.content as FillBlanksContent;
      if (!c.text.trim()) errors.push({ sectionIndex: i, message: "Пустой текст" });
      const blanks = (c.text.match(/___/g) || []).length;
      if (blanks === 0) errors.push({ sectionIndex: i, message: "Нет пропусков (___)" });
      if (c.answers.some((a) => !a.trim())) errors.push({ sectionIndex: i, message: "Пустой ответ" });
    }
    if (sec.type === "matching") {
      const c = sec.content as MatchingContent;
      if (c.pairs.length < 2) errors.push({ sectionIndex: i, message: "Нужно минимум 2 пары" });
      if (c.pairs.some((p) => !p.left.trim() || !p.right.trim())) errors.push({ sectionIndex: i, message: "Пустая пара" });
    }
    if (sec.type === "ordering") {
      const c = sec.content as OrderingContent;
      if (c.items.length < 2) errors.push({ sectionIndex: i, message: "Нужно минимум 2 элемента" });
      if (c.items.some((it) => !it.trim())) errors.push({ sectionIndex: i, message: "Пустой элемент" });
    }
    if (sec.type === "cards") {
      const c = sec.content as CardsContent;
      if (c.cards.length === 0) errors.push({ sectionIndex: i, message: "Нет карточек" });
      if (c.cards.some((card) => !card.front.trim() || !card.back.trim())) errors.push({ sectionIndex: i, message: "Пустая карточка" });
    }
    if (sec.type === "true_false") {
      const c = sec.content as TrueFalseContent;
      if (c.questions.length === 0) { errors.push({ sectionIndex: i, message: "Нет утверждений" }); return; }
      c.questions.forEach((q, qi) => {
        if (!q.statement.trim()) errors.push({ sectionIndex: i, message: `Утверждение ${qi + 1}: пустой текст` });
      });
    }
    if (sec.type === "open_answer") {
      const c = sec.content as OpenAnswerContent;
      if (!c.prompt.trim()) errors.push({ sectionIndex: i, message: "Пустой вопрос" });
    }
    if (sec.type === "text") {
      const c = sec.content as { text: string };
      if (!c.text.trim()) errors.push({ sectionIndex: i, message: "Пустой текст" });
    }
  });
  return errors;
}

// ── Section Editors ──

function QuizEditor({ section, onChange }: { section: HomeworkSection; onChange: (s: HomeworkSection) => void }) {
  const questions = section.content as QuizQuestion[];
  const setQ = (nq: QuizQuestion[]) => onChange({ ...section, content: nq });

  const toggleCorrect = (qi: number, oi: number) => {
    const nq = [...questions];
    const q = nq[qi];
    const correct = getCorrectIndices(q);
    if (correct.includes(oi)) {
      const next = correct.filter((c) => c !== oi);
      nq[qi] = { ...q, correct: next.length === 1 ? next[0] : next.length === 0 ? 0 : next };
    } else {
      const next = [...correct, oi].sort();
      nq[qi] = { ...q, correct: next.length === 1 ? next[0] : next };
    }
    setQ(nq);
  };

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-[#888]">Нажми на кружок — один правильный ответ. Нажми на несколько — множественный выбор.</p>
      {questions.map((q, qi) => (
        <div key={qi} className="rounded-lg border border-[#e8e5de] p-2.5 md:p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#888]">Вопрос {qi + 1}</span>
            {questions.length > 1 && (
              <button onClick={() => setQ(questions.filter((_, i) => i !== qi))} className="text-[11px] text-red-400 hover:text-red-500 cursor-pointer">Удалить</button>
            )}
          </div>
          <input value={q.question} onChange={(e) => { const nq = [...questions]; nq[qi] = { ...nq[qi], question: e.target.value }; setQ(nq); }}
            placeholder="Вопрос" className="w-full h-9 rounded-lg border border-[#e8e5de] px-3 text-[13px] outline-none focus:border-[#ccc]" />
          {q.options.map((opt, oi) => (
            <div key={oi} className="flex items-center gap-2">
              <button onClick={() => toggleCorrect(qi, oi)}
                className={`h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                  isCorrectIndex(q, oi) ? "border-emerald-500 bg-emerald-500" : "border-[#d0ccc4] hover:border-[#ccc]"
                }`}>
                {isCorrectIndex(q, oi) && <Check className="h-3 w-3 text-white" />}
              </button>
              <input value={opt} onChange={(e) => { const nq = [...questions]; nq[qi] = { ...nq[qi], options: nq[qi].options.map((o, i) => i === oi ? e.target.value : o) }; setQ(nq); }}
                placeholder={`Вариант ${oi + 1}`} className="flex-1 h-9 rounded-lg border border-[#e8e5de] px-3 text-[13px] outline-none focus:border-[#ccc] min-w-0" />
              {q.options.length > 2 && (
                <button onClick={() => {
                  const nq = [...questions];
                  const newOpts = nq[qi].options.filter((_, i) => i !== oi);
                  let correct = getCorrectIndices(q).map((c) => c > oi ? c - 1 : c).filter((c) => c !== oi && c < newOpts.length);
                  if (correct.length === 0) correct = [0];
                  nq[qi] = { ...nq[qi], options: newOpts, correct: correct.length === 1 ? correct[0] : correct };
                  setQ(nq);
                }} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-[#fef2f2] shrink-0 cursor-pointer">
                  <X className="h-3 w-3 text-[#ccc] hover:text-red-400" />
                </button>
              )}
            </div>
          ))}
          <div className="flex gap-2">
            <button onClick={() => { const nq = [...questions]; nq[qi] = { ...nq[qi], options: [...nq[qi].options, ""] }; setQ(nq); }}
              className="text-[11px] text-[#888] hover:text-[#666] cursor-pointer">+ вариант</button>
          </div>
          <div>
            <input value={q.explanation || ""} onChange={(e) => { const nq = [...questions]; nq[qi] = { ...nq[qi], explanation: e.target.value }; setQ(nq); }}
              placeholder="Пояснение (показывается после ответа)" className="w-full h-8 rounded-lg border border-dashed border-[#e8e5de] px-3 text-[12px] text-[#888] outline-none focus:border-[#ccc]" />
          </div>
        </div>
      ))}
      <button onClick={() => setQ([...questions, { question: "", options: ["", ""], correct: 0 }])}
        className="text-[12px] text-[#888] font-medium hover:text-[#666] cursor-pointer">+ Вопрос</button>
    </div>
  );
}

function FillBlanksEditor({ section, onChange }: { section: HomeworkSection; onChange: (s: HomeworkSection) => void }) {
  const c = section.content as FillBlanksContent;
  const blanksCount = (c.text.match(/___/g) || []).length;

  const syncAnswers = (text: string) => {
    const count = (text.match(/___/g) || []).length;
    let answers = [...c.answers];
    if (count > answers.length) answers = [...answers, ...new Array(count - answers.length).fill("")];
    else if (count < answers.length) answers = answers.slice(0, count);
    onChange({ ...section, content: { text, answers } });
  };

  return (
    <div className="space-y-3">
      <div>
        <textarea value={c.text} onChange={(e) => syncAnswers(e.target.value)}
          placeholder='Текст с ___ для пропусков. Пример: "I ___ a student"' rows={3}
          className="w-full rounded-lg border border-[#e8e5de] px-3 py-2 text-[13px] outline-none focus:border-[#ccc] resize-none" />
        <p className="text-[11px] text-[#888] mt-1">Используй ___ (три подчёркивания) для пропусков. Найдено: {blanksCount}</p>
      </div>
      {c.answers.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium text-[#888]">Правильные ответы:</p>
          {c.answers.map((a, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[11px] text-[#888] w-5 text-center shrink-0">{i + 1}.</span>
              <input value={a} onChange={(e) => { const na = [...c.answers]; na[i] = e.target.value; onChange({ ...section, content: { ...c, answers: na } }); }}
                placeholder={`Ответ для пропуска ${i + 1}`} className="flex-1 h-9 rounded-lg border border-[#e8e5de] px-3 text-[13px] outline-none focus:border-[#ccc] min-w-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MatchingEditor({ section, onChange }: { section: HomeworkSection; onChange: (s: HomeworkSection) => void }) {
  const c = section.content as MatchingContent;
  return (
    <div className="space-y-2">
      {c.pairs.map((p, i) => (
        <div key={i} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <input value={p.left} onChange={(e) => { const np = [...c.pairs]; np[i] = { ...np[i], left: e.target.value }; onChange({ ...section, content: { pairs: np } }); }}
            placeholder="Слева" className="flex-1 h-9 rounded-lg border border-[#e8e5de] px-3 text-[13px] outline-none focus:border-[#ccc] min-w-0" />
          <span className="text-[#ccc] text-[12px] hidden sm:block">→</span>
          <input value={p.right} onChange={(e) => { const np = [...c.pairs]; np[i] = { ...np[i], right: e.target.value }; onChange({ ...section, content: { pairs: np } }); }}
            placeholder="Справа" className="flex-1 h-9 rounded-lg border border-[#e8e5de] px-3 text-[13px] outline-none focus:border-[#ccc] min-w-0" />
          {c.pairs.length > 1 && (
            <button onClick={() => onChange({ ...section, content: { pairs: c.pairs.filter((_, j) => j !== i) } })}
              className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-[#fef2f2] shrink-0 cursor-pointer self-end sm:self-auto">
              <X className="h-3 w-3 text-[#ccc] hover:text-red-400" />
            </button>
          )}
        </div>
      ))}
      <button onClick={() => onChange({ ...section, content: { pairs: [...c.pairs, { left: "", right: "" }] } })}
        className="text-[11px] text-[#888] hover:text-[#666] cursor-pointer">+ пара</button>
    </div>
  );
}

function OrderingEditor({ section, onChange }: { section: HomeworkSection; onChange: (s: HomeworkSection) => void }) {
  const c = section.content as OrderingContent;
  return (
    <div className="space-y-2">
      <p className="text-[11px] text-[#888]">Элементы в правильном порядке (ученик увидит перемешанные):</p>
      {c.items.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <span className="text-[11px] text-[#888] w-5 text-center shrink-0">{i + 1}</span>
          <input value={item} onChange={(e) => {
            const ni = [...c.items]; ni[i] = e.target.value;
            onChange({ ...section, content: { items: ni, correct_order: ni.map((_, j) => j) } });
          }} placeholder={`Элемент ${i + 1}`} className="flex-1 h-9 rounded-lg border border-[#e8e5de] px-3 text-[13px] outline-none focus:border-[#ccc] min-w-0" />
          {c.items.length > 2 && (
            <button onClick={() => {
              const ni = c.items.filter((_, j) => j !== i);
              onChange({ ...section, content: { items: ni, correct_order: ni.map((_, j) => j) } });
            }} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-[#fef2f2] shrink-0 cursor-pointer">
              <X className="h-3 w-3 text-[#ccc] hover:text-red-400" />
            </button>
          )}
        </div>
      ))}
      <button onClick={() => onChange({ ...section, content: { items: [...c.items, ""], correct_order: [...c.items, ""].map((_, i) => i) } })}
        className="text-[11px] text-[#888] hover:text-[#666] cursor-pointer">+ элемент</button>
    </div>
  );
}

function CardsEditor({ section, onChange }: { section: HomeworkSection; onChange: (s: HomeworkSection) => void }) {
  const c = section.content as CardsContent;
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");

  const parseBulk = () => {
    const lines = bulkText.split("\n").filter((l) => l.trim());
    const newCards = lines.map((line) => {
      const sep = line.includes("\t") ? "\t" : line.includes(" - ") ? " - " : line.includes(";") ? ";" : " — ";
      const parts = line.split(sep).map((s) => s.trim());
      return { front: parts[0] || "", back: parts[1] || "" };
    }).filter((card) => card.front && card.back);
    if (newCards.length > 0) {
      onChange({ ...section, content: { cards: [...c.cards, ...newCards] } });
      setBulkText("");
      setBulkMode(false);
    }
  };

  return (
    <div className="space-y-2">
      {c.cards.map((card, i) => (
        <div key={i} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <input value={card.front} onChange={(e) => { const nc = [...c.cards]; nc[i] = { ...nc[i], front: e.target.value }; onChange({ ...section, content: { cards: nc } }); }}
            placeholder="Лицо" className="flex-1 h-9 rounded-lg border border-[#e8e5de] px-3 text-[13px] outline-none focus:border-[#ccc] min-w-0" />
          <input value={card.back} onChange={(e) => { const nc = [...c.cards]; nc[i] = { ...nc[i], back: e.target.value }; onChange({ ...section, content: { cards: nc } }); }}
            placeholder="Оборот" className="flex-1 h-9 rounded-lg border border-[#e8e5de] px-3 text-[13px] outline-none focus:border-[#ccc] min-w-0" />
          {c.cards.length > 1 && (
            <button onClick={() => onChange({ ...section, content: { cards: c.cards.filter((_, j) => j !== i) } })}
              className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-[#fef2f2] shrink-0 cursor-pointer self-end sm:self-auto">
              <X className="h-3 w-3 text-[#ccc] hover:text-red-400" />
            </button>
          )}
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => onChange({ ...section, content: { cards: [...c.cards, { front: "", back: "" }] } })}
          className="text-[11px] text-[#888] hover:text-[#666] cursor-pointer">+ карточка</button>
        <button onClick={() => setBulkMode(!bulkMode)}
          className="text-[11px] text-[#888] hover:text-[#666] cursor-pointer flex items-center gap-1">
          <Upload className="h-3 w-3" /> {bulkMode ? "Скрыть" : "Импорт списком"}
        </button>
      </div>
      {bulkMode && (
        <div className="rounded-lg border border-dashed border-[#e8e5de] p-3 space-y-2">
          <p className="text-[11px] text-[#888]">Одна карточка на строку. Разделитель: Tab, " - ", ";" или " — "</p>
          <textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)}
            placeholder={"cat - кошка\ndog - собака\nbird - птица"} rows={5}
            className="w-full rounded-lg border border-[#e8e5de] px-3 py-2 text-[12px] outline-none focus:border-[#ccc] resize-none font-mono" />
          <button onClick={parseBulk} disabled={!bulkText.trim()}
            className="px-3 py-1.5 rounded-lg bg-[#1a1a1a] text-white text-[11px] font-medium hover:bg-[#333] disabled:opacity-40 cursor-pointer">
            Добавить {bulkText.split("\n").filter((l) => l.trim()).length} карточек
          </button>
        </div>
      )}
    </div>
  );
}

function TrueFalseEditor({ section, onChange }: { section: HomeworkSection; onChange: (s: HomeworkSection) => void }) {
  const c = section.content as TrueFalseContent;
  const setQ = (nq: TrueFalseQuestion[]) => onChange({ ...section, content: { questions: nq } });

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-[#888]">Утверждения — выбери правильный ответ для каждого</p>
      {c.questions.map((q, qi) => (
        <div key={qi} className="rounded-lg border border-[#e8e5de] p-2.5 md:p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#888]">Утверждение {qi + 1}</span>
            {c.questions.length > 1 && (
              <button onClick={() => setQ(c.questions.filter((_, i) => i !== qi))} className="text-[11px] text-red-400 hover:text-red-500 cursor-pointer">Удалить</button>
            )}
          </div>
          <input value={q.statement} onChange={(e) => { const nq = [...c.questions]; nq[qi] = { ...nq[qi], statement: e.target.value }; setQ(nq); }}
            placeholder="Утверждение" className="w-full h-9 rounded-lg border border-[#e8e5de] px-3 text-[13px] outline-none focus:border-[#ccc]" />
          <div className="flex gap-2">
            <button onClick={() => { const nq = [...c.questions]; nq[qi] = { ...nq[qi], correct: true }; setQ(nq); }}
              className={`flex-1 h-9 rounded-lg text-[13px] font-medium border cursor-pointer transition-colors ${q.correct ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-[#e8e5de] text-[#888] hover:border-[#d0ccc4]"}`}>
              ✓ Верно
            </button>
            <button onClick={() => { const nq = [...c.questions]; nq[qi] = { ...nq[qi], correct: false }; setQ(nq); }}
              className={`flex-1 h-9 rounded-lg text-[13px] font-medium border cursor-pointer transition-colors ${!q.correct ? "border-red-300 bg-red-50 text-red-700" : "border-[#e8e5de] text-[#888] hover:border-[#d0ccc4]"}`}>
              ✗ Неверно
            </button>
          </div>
          <input value={q.explanation || ""} onChange={(e) => { const nq = [...c.questions]; nq[qi] = { ...nq[qi], explanation: e.target.value }; setQ(nq); }}
            placeholder="Пояснение (необязательно)" className="w-full h-8 rounded-lg border border-dashed border-[#e8e5de] px-3 text-[12px] text-[#888] outline-none focus:border-[#ccc]" />
        </div>
      ))}
      <button onClick={() => setQ([...c.questions, { statement: "", correct: true }])}
        className="text-[12px] text-[#888] font-medium hover:text-[#666] cursor-pointer">+ Утверждение</button>
    </div>
  );
}

function OpenAnswerEditor({ section, onChange }: { section: HomeworkSection; onChange: (s: HomeworkSection) => void }) {
  const c = section.content as OpenAnswerContent;
  return (
    <div className="space-y-3">
      <div>
        <textarea value={c.prompt} onChange={(e) => onChange({ ...section, content: { ...c, prompt: e.target.value } })}
          placeholder="Вопрос или задание для ученика..." rows={3}
          className="w-full rounded-lg border border-[#e8e5de] px-3 py-2 text-[13px] outline-none focus:border-[#ccc] resize-none" />
      </div>
      <input value={c.placeholder || ""} onChange={(e) => onChange({ ...section, content: { ...c, placeholder: e.target.value } })}
        placeholder="Подсказка в поле ответа (необязательно)" className="w-full h-8 rounded-lg border border-dashed border-[#e8e5de] px-3 text-[12px] text-[#888] outline-none focus:border-[#ccc]" />
      <p className="text-[11px] text-[#888]">💬 Ученик напишет ответ текстом. Оценивается репетитором вручную.</p>
    </div>
  );
}

function TextEditor({ section, onChange }: { section: HomeworkSection; onChange: (s: HomeworkSection) => void }) {
  const c = section.content as { text: string };
  return (
    <div>
      <textarea value={c.text} onChange={(e) => onChange({ ...section, content: { text: e.target.value } })}
        placeholder="Текст задания, правило, ссылка на материал..." rows={4}
        className="w-full rounded-lg border border-[#e8e5de] px-3 py-2 text-[13px] outline-none focus:border-[#ccc] resize-y min-h-[80px]" />
      <p className="text-[11px] text-[#888] mt-1">Ученик увидит этот текст как задание (не оценивается)</p>
    </div>
  );
}

export function SectionEditor({ section, onChange, onDelete, onDuplicate, onMoveUp, onMoveDown, isFirst, isLast, index, errors }: {
  section: HomeworkSection; onChange: (s: HomeworkSection) => void;
  onDelete: () => void; onDuplicate: () => void;
  onMoveUp: () => void; onMoveDown: () => void;
  isFirst: boolean; isLast: boolean; index: number;
  errors: string[];
}) {
  const editors: Record<HomeworkType, any> = { quiz: QuizEditor, fill_blanks: FillBlanksEditor, matching: MatchingEditor, ordering: OrderingEditor, cards: CardsEditor, text: TextEditor, true_false: TrueFalseEditor, open_answer: OpenAnswerEditor };
  const Editor = editors[section.type];
  const hasErrors = errors.length > 0;

  return (
    <div className={`rounded-xl border overflow-hidden ${hasErrors ? "border-red-200" : "border-[#e8e5de]"} bg-white`}>
      <div className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 border-b ${hasErrors ? "bg-red-50 border-red-100" : "bg-[#f5f3ee] border-[#e8e5de]"} overflow-x-auto`}>
        <span className="text-[14px]">{typeIcons[section.type]}</span>
        <span className="text-[12px] font-medium text-[#666] truncate">{typeLabels[section.type]}</span>
        <span className="text-[11px] text-[#888] shrink-0">#{index + 1}</span>
        {hasErrors && <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />}
        <div className="flex-1" />
        <button onClick={onMoveUp} disabled={isFirst} className="h-6 w-6 rounded flex items-center justify-center hover:bg-[#f0ede6] disabled:opacity-20 cursor-pointer shrink-0"><ChevronUp className="h-3.5 w-3.5 text-[#888]" /></button>
        <button onClick={onMoveDown} disabled={isLast} className="h-6 w-6 rounded flex items-center justify-center hover:bg-[#f0ede6] disabled:opacity-20 cursor-pointer shrink-0"><ChevronDown className="h-3.5 w-3.5 text-[#888]" /></button>
        <div className="w-px h-4 bg-[#e8e5de] shrink-0" />
        <button onClick={onDuplicate} className="h-6 w-6 rounded flex items-center justify-center hover:bg-[#f0ede6] cursor-pointer shrink-0" title="Дублировать"><CopyPlus className="h-3.5 w-3.5 text-[#888]" /></button>
        <button onClick={onDelete} className="h-6 w-6 rounded flex items-center justify-center hover:bg-[#fef2f2] cursor-pointer shrink-0" title="Удалить"><Trash2 className="h-3.5 w-3.5 text-[#888] hover:text-red-500" /></button>
      </div>
      <div className="p-3 md:p-4 space-y-3">
        <input value={section.title} onChange={(e) => onChange({ ...section, title: e.target.value })}
          placeholder="Название секции" className="w-full h-9 rounded-lg border border-[#e8e5de] px-3 text-[14px] font-medium outline-none focus:border-[#ccc]" />
        <Editor section={section} onChange={onChange} />
        {hasErrors && (
          <div className="rounded-lg bg-red-50 px-3 py-2 space-y-1">
            {errors.map((e, i) => <p key={i} className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3 shrink-0" /> {e}</p>)}
          </div>
        )}
      </div>
    </div>
  );
}

export function emptySection(type: HomeworkType): HomeworkSection {
  const id = crypto.randomUUID();
  switch (type) {
    case "quiz": return { id, type, title: "Тест", content: [{ question: "", options: ["", ""], correct: 0 }] };
    case "fill_blanks": return { id, type, title: "Вставить слово", content: { text: "", answers: [] } };
    case "matching": return { id, type, title: "Соединить пары", content: { pairs: [{ left: "", right: "" }] } };
    case "ordering": return { id, type, title: "Порядок", content: { items: ["", ""], correct_order: [0, 1] } };
    case "cards": return { id, type, title: "Карточки", content: { cards: [{ front: "", back: "" }] } };
    case "text": return { id, type, title: "Задание", content: { text: "" } };
    case "true_false": return { id, type, title: "Верно / Неверно", content: { questions: [{ statement: "", correct: true }] } };
    case "open_answer": return { id, type, title: "Открытый ответ", content: { prompt: "" } };
  }
}

export function duplicateSection(sec: HomeworkSection): HomeworkSection {
  return { ...sec, id: crypto.randomUUID(), title: sec.title + " (копия)" };
}

// ── Add Section Picker ──

export function AddSectionPicker({ onAdd }: { onAdd: (section: HomeworkSection) => void }) {
  return (
    <div className="rounded-xl border border-dashed border-[#e8e5de] p-3 md:p-4">
      <p className="text-[12px] text-[#888] mb-3">Добавить секцию:</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 md:gap-2">
        {(Object.entries(typeLabels) as [HomeworkType, string][]).map(([key, label]) => (
          <button key={key} onClick={() => onAdd(emptySection(key))}
            className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-2 md:py-2.5 rounded-xl text-[11px] md:text-[12px] font-medium bg-[#f5f3ee] text-[#666] hover:bg-[#f0ede6] border border-[#e8e5de] hover:border-[#e8e5de] cursor-pointer transition-colors">
            <span>{typeIcons[key]}</span> <span className="truncate">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Sections List Editor (used in both homework and lesson dialogs) ──

export function SectionsListEditor({ sections, onChange, showErrors }: {
  sections: HomeworkSection[];
  onChange: (sections: HomeworkSection[]) => void;
  showErrors: boolean;
}) {
  const validationErrors = useMemo(() => validateSections(sections), [sections]);
  const errorsPerSection = useMemo(() => {
    const map: Record<number, string[]> = {};
    validationErrors.forEach((e) => {
      if (!map[e.sectionIndex]) map[e.sectionIndex] = [];
      map[e.sectionIndex].push(e.message);
    });
    return map;
  }, [validationErrors]);

  const moveSection = (i: number, dir: -1 | 1) => {
    const next = [...sections];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {sections.length > 0 && <p className="text-[12px] font-medium text-[#888]">{sections.length} {sections.length === 1 ? "секция" : "секций"}</p>}
      {sections.map((sec, i) => (
        <SectionEditor key={sec.id} section={sec} index={i}
          onChange={(s) => onChange(sections.map((x, j) => j === i ? s : x))}
          onDelete={() => onChange(sections.filter((_, j) => j !== i))}
          onDuplicate={() => { const dup = duplicateSection(sec); const next = [...sections]; next.splice(i + 1, 0, dup); onChange(next); }}
          onMoveUp={() => moveSection(i, -1)} onMoveDown={() => moveSection(i, 1)}
          isFirst={i === 0} isLast={i === sections.length - 1}
          errors={showErrors ? (errorsPerSection[i] || []) : []} />
      ))}
      <AddSectionPicker onAdd={(sec) => onChange([...sections, sec])} />
    </div>
  );
}
