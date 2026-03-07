import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { BookOpen, Sparkles, CheckCircle2, Circle, ChevronDown, ChevronUp, ChevronRight, ArrowLeft, ClipboardCheck, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Homework, HomeworkSection, QuizQuestion, FillBlanksContent, MatchingContent, OrderingContent, CardsContent, Lesson } from "@/types/database";

const typeLabels: Record<string, string> = {
  quiz: "Тест", fill_blanks: "Вставить слово", matching: "Соединить пары",
  ordering: "Расставить по порядку", cards: "Карточки", text: "Задание",
};

// ── Section Players ──

function getCorrectIndices(q: QuizQuestion): number[] {
  return Array.isArray(q.correct) ? q.correct : [q.correct];
}

function QuizPlayer({ section, onScore }: { section: HomeworkSection; onScore: (score: number) => void }) {
  const questions = section.content as QuizQuestion[];
  const isMulti = questions.some((q) => Array.isArray(q.correct) && q.correct.length > 1);

  // For single-select: number per question. For multi-select: Set of indices per question.
  const [singleAnswers, setSingleAnswers] = useState<number[]>(() => new Array(questions.length).fill(-1));
  const [multiAnswers, setMultiAnswers] = useState<Set<number>[]>(() => questions.map(() => new Set()));
  const [submitted, setSubmitted] = useState(false);

  const toggleMulti = (qi: number, oi: number) => {
    setMultiAnswers((prev) => {
      const next = prev.map((s, i) => i === qi ? new Set(s) : s);
      if (next[qi].has(oi)) next[qi].delete(oi); else next[qi].add(oi);
      return next;
    });
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      const expected = getCorrectIndices(q);
      if (isMulti) {
        const selected = [...multiAnswers[i]];
        const isRight = expected.length === selected.length && expected.every((e) => selected.includes(e));
        if (isRight) correct++;
      } else {
        if (expected.includes(singleAnswers[i])) correct++;
      }
    });
    setSubmitted(true);
    onScore(Math.round((correct / questions.length) * 100));
  };

  const allAnswered = isMulti
    ? multiAnswers.every((s) => s.size > 0)
    : !singleAnswers.includes(-1);

  return (
    <div className="space-y-4">
      {isMulti && <p className="text-[12px] text-zinc-400">Выбери все правильные ответы</p>}
      {questions.map((q, qi) => {
        const expected = getCorrectIndices(q);
        return (
          <div key={qi} className="space-y-2">
            <p className="text-[15px] font-medium">{qi + 1}. {q.question}</p>
            <div className="space-y-1.5 pl-1">
              {q.options.map((opt, oi) => {
                const selectedSingle = singleAnswers[qi] === oi;
                const selectedMulti = multiAnswers[qi]?.has(oi);
                const selected = isMulti ? selectedMulti : selectedSingle;
                const isCorrect = submitted && expected.includes(oi);
                const isWrong = submitted && selected && !expected.includes(oi);

                return (
                  <button key={oi}
                    onClick={() => {
                      if (submitted) return;
                      if (isMulti) toggleMulti(qi, oi);
                      else setSingleAnswers((prev) => prev.map((a, i) => i === qi ? oi : a));
                    }}
                    disabled={submitted}
                    className={`w-full text-left px-4 py-3 rounded-xl text-[14px] border transition-colors cursor-pointer flex items-center gap-3 ${
                      isCorrect ? "border-emerald-300 bg-emerald-50 text-emerald-700" :
                      isWrong ? "border-red-300 bg-red-50 text-red-700" :
                      selected ? "border-zinc-400 bg-zinc-50" :
                      "border-zinc-200 hover:border-zinc-300"
                    }`}>
                    {isMulti ? (
                      <div className={`h-4.5 w-4.5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                        submitted ? (isCorrect ? "border-emerald-500 bg-emerald-500" : isWrong ? "border-red-400 bg-red-400" : "border-zinc-300") :
                        selected ? "border-zinc-500 bg-zinc-500" : "border-zinc-300"
                      }`}>
                        {(selected || (submitted && isCorrect)) && <Check className="h-3 w-3 text-white" />}
                      </div>
                    ) : (
                      <div className={`h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        submitted ? (isCorrect ? "border-emerald-500 bg-emerald-500" : isWrong ? "border-red-400 bg-red-400" : "border-zinc-300") :
                        selected ? "border-zinc-500 bg-zinc-500" : "border-zinc-300"
                      }`}>
                        {(selected || (submitted && isCorrect)) && <div className="h-2 w-2 rounded-full bg-white" />}
                      </div>
                    )}
                    {opt}
                  </button>
                );
              })}
            </div>
            {submitted && q.explanation && (
              <div className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 ml-1">
                <p className="text-[13px] text-blue-700">💡 {q.explanation}</p>
              </div>
            )}
          </div>
        );
      })}
      {!submitted && (
        <button onClick={handleSubmit} disabled={!allAnswered}
          className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-[14px] font-medium hover:bg-zinc-800 disabled:opacity-40 cursor-pointer">Проверить</button>
      )}
      {submitted && (
        <div className="rounded-xl bg-zinc-50 px-4 py-3">
          <p className="text-[14px] font-medium">
            Результат: {questions.reduce((acc, q, i) => {
              const expected = getCorrectIndices(q);
              if (isMulti) {
                const selected = [...multiAnswers[i]];
                return acc + (expected.length === selected.length && expected.every((e) => selected.includes(e)) ? 1 : 0);
              }
              return acc + (expected.includes(singleAnswers[i]) ? 1 : 0);
            }, 0)}/{questions.length}
          </p>
        </div>
      )}
    </div>
  );
}

function FillBlanksPlayer({ section, onScore }: { section: HomeworkSection; onScore: (score: number) => void }) {
  const content = section.content as FillBlanksContent;

  // Pre-compute segments: array of {kind:"text", value} | {kind:"blank", index}
  const segments = useMemo(() => {
    const parts = content.text.split("___");
    const segs: Array<{ kind: "text"; value: string } | { kind: "blank"; index: number }> = [];
    parts.forEach((part, i) => {
      if (part) segs.push({ kind: "text", value: part });
      if (i < parts.length - 1) segs.push({ kind: "blank", index: i });
    });
    return segs;
  }, [content.text]);

  const blanksCount = segments.filter((s) => s.kind === "blank").length;
  const expectedCount = content.answers.length;

  const [answers, setAnswers] = useState<string[]>(() => new Array(Math.max(blanksCount, expectedCount)).fill(""));
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  const updateAnswer = (idx: number, value: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  };

  const handleSubmit = () => {
    const res = content.answers.map((a, i) =>
      a.trim().toLowerCase() === (answers[i] || "").trim().toLowerCase()
    );
    setResults(res);
    setSubmitted(true);
    onScore(Math.round((res.filter(Boolean).length / res.length) * 100));
  };

  return (
    <div className="space-y-4">
      <div className="text-[15px] leading-relaxed">
        {segments.map((seg, i) =>
          seg.kind === "text" ? (
            <span key={`t-${i}`}>{seg.value}</span>
          ) : (
            <input
              key={`b-${seg.index}`}
              value={answers[seg.index] || ""}
              onChange={(e) => updateAnswer(seg.index, e.target.value)}
              disabled={submitted}
              className={`inline-block w-32 h-8 mx-1 px-3 rounded-lg border text-[14px] text-center outline-none ${
                submitted
                  ? (results[seg.index] ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50")
                  : "border-zinc-300 focus:border-zinc-500"
              }`}
            />
          )
        )}
      </div>
      {submitted && (
        <p className="text-[13px] text-zinc-400">Правильные ответы: {content.answers.join(", ")}</p>
      )}
      {!submitted && (
        <button onClick={handleSubmit} disabled={answers.slice(0, expectedCount).some((a) => !a.trim())}
          className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-[14px] font-medium hover:bg-zinc-800 disabled:opacity-40 cursor-pointer">
          Проверить
        </button>
      )}
    </div>
  );
}

function MatchingPlayer({ section, onScore }: { section: HomeworkSection; onScore: (score: number) => void }) {
  const content = section.content as MatchingContent;
  const [answers, setAnswers] = useState<(number | null)[]>(() => new Array(content.pairs.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [shuffledRight] = useState(() => {
    const indices = content.pairs.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [indices[i], indices[j]] = [indices[j], indices[i]]; }
    return indices;
  });

  const handleSubmit = () => {
    setSubmitted(true);
    onScore(Math.round((answers.filter((a, i) => shuffledRight[a!] === i).length / content.pairs.length) * 100));
  };

  return (
    <div className="space-y-3">
      {content.pairs.map((pair, i) => (
        <div key={i} className="flex items-center gap-4">
          <span className="text-[15px] min-w-[120px] font-medium">{pair.left}</span>
          <span className="text-zinc-300">→</span>
          <select value={answers[i] ?? ""} onChange={(e) => setAnswers((prev) => { const na = [...prev]; na[i] = e.target.value === "" ? null : Number(e.target.value); return na; })}
            disabled={submitted}
            className={`h-10 rounded-xl border px-3 text-[14px] bg-white min-w-[140px] ${
              submitted ? shuffledRight[answers[i]!] === i ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50" : "border-zinc-200"
            }`}>
            <option value="">Выбрать...</option>
            {shuffledRight.map((ri, si) => <option key={si} value={si}>{content.pairs[ri].right}</option>)}
          </select>
        </div>
      ))}
      {!submitted && (
        <button onClick={handleSubmit} disabled={answers.includes(null)}
          className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-[14px] font-medium hover:bg-zinc-800 disabled:opacity-40 cursor-pointer">Проверить</button>
      )}
    </div>
  );
}

function OrderingPlayer({ section, onScore }: { section: HomeworkSection; onScore: (score: number) => void }) {
  const content = section.content as OrderingContent;
  const [items, setItems] = useState(() => {
    const s = [...content.items];
    for (let i = s.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [s[i], s[j]] = [s[j], s[i]]; }
    return s;
  });
  const [submitted, setSubmitted] = useState(false);

  const move = (i: number, dir: -1 | 1) => {
    setItems((prev) => { const next = [...prev]; [next[i], next[i + dir]] = [next[i + dir], next[i]]; return next; });
  };

  const handleSubmit = () => {
    const correct = items.reduce((acc, item, i) => acc + (item === content.items[content.correct_order[i]] ? 1 : 0), 0);
    setSubmitted(true);
    onScore(Math.round((correct / items.length) * 100));
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isCorrect = submitted && item === content.items[content.correct_order[i]];
        return (
          <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-[14px] ${
            submitted ? isCorrect ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50" : "border-zinc-200"
          }`}>
            <span className="text-zinc-400 w-6 text-center font-medium">{i + 1}</span>
            <span className="flex-1">{item}</span>
            {!submitted && (
              <div className="flex flex-col gap-0.5">
                <button onClick={() => i > 0 && move(i, -1)} disabled={i === 0} className="text-zinc-400 hover:text-zinc-600 disabled:opacity-30 cursor-pointer"><ChevronUp className="h-4 w-4" /></button>
                <button onClick={() => i < items.length - 1 && move(i, 1)} disabled={i === items.length - 1} className="text-zinc-400 hover:text-zinc-600 disabled:opacity-30 cursor-pointer"><ChevronDown className="h-4 w-4" /></button>
              </div>
            )}
          </div>
        );
      })}
      {!submitted && <button onClick={handleSubmit} className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-[14px] font-medium hover:bg-zinc-800 cursor-pointer">Проверить</button>}
    </div>
  );
}

function CardsPlayer({ section }: { section: HomeworkSection }) {
  const content = section.content as CardsContent;
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = content.cards[index];

  return (
    <div className="space-y-4">
      <div onClick={() => setFlipped(!flipped)}
        className="min-h-[160px] rounded-2xl border border-zinc-200 bg-white flex items-center justify-center p-8 cursor-pointer hover:border-zinc-300 select-none transition-colors">
        <div className="text-center">
          <p className="text-[12px] text-zinc-400 mb-3">{flipped ? "Оборот" : "Лицо"} · Нажми чтобы перевернуть</p>
          <p className="text-[22px] font-semibold">{flipped ? card.back : card.front}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <button onClick={() => { setIndex(Math.max(0, index - 1)); setFlipped(false); }} disabled={index === 0}
          className="px-4 py-2 rounded-xl text-[14px] text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 cursor-pointer">← Назад</button>
        <span className="text-[13px] text-zinc-400">{index + 1} / {content.cards.length}</span>
        <button onClick={() => { setIndex(Math.min(content.cards.length - 1, index + 1)); setFlipped(false); }} disabled={index === content.cards.length - 1}
          className="px-4 py-2 rounded-xl text-[14px] text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 cursor-pointer">Далее →</button>
      </div>
    </div>
  );
}

function SectionPlayer({ section, onScore }: { section: HomeworkSection; onScore: (sectionId: string, score: number) => void }) {
  const handle = (score: number) => onScore(section.id, score);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <span className="text-[12px] font-medium text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-lg">{typeLabels[section.type]}</span>
        <h3 className="text-[16px] font-semibold">{section.title}</h3>
      </div>
      {section.type === "quiz" && <QuizPlayer section={section} onScore={handle} />}
      {section.type === "fill_blanks" && <FillBlanksPlayer section={section} onScore={handle} />}
      {section.type === "matching" && <MatchingPlayer section={section} onScore={handle} />}
      {section.type === "ordering" && <OrderingPlayer section={section} onScore={handle} />}
      {section.type === "cards" && <CardsPlayer section={section} />}
      {section.type === "text" && <div className="text-[15px] text-zinc-600 whitespace-pre-wrap leading-relaxed">{(section.content as { text: string }).text}</div>}
    </div>
  );
}

// ── Lesson View (full page for one lesson) ──

function LessonView({ lesson, homeworkItems, onBack }: { lesson: Lesson; homeworkItems: Homework[]; onBack: () => void }) {
  const { updateHomework } = useStore();
  const completedHw = homeworkItems.filter((h) => h.completed).length;

  const handleScore = (hw: Homework, sectionId: string, score: number) => {
    const scores = { ...(hw.scores || {}), [sectionId]: score };
    const gradable = (hw.sections || []).filter((s) => s.type !== "text" && s.type !== "cards").length;
    updateHomework(hw.id, { scores, completed: Object.keys(scores).length >= gradable });
  };

  return (
    <div className="space-y-8">
      {/* Back + title */}
      <div>
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-[13px] text-zinc-400 hover:text-zinc-600 mb-4 cursor-pointer">
          <ArrowLeft className="h-4 w-4" /> Все уроки
        </button>
        <h2 className="text-[22px] font-bold tracking-tight">{lesson.title}</h2>
        <p className="text-[13px] text-zinc-400 mt-1">
          {lesson.date}
          {homeworkItems.length > 0 && ` · ${completedHw}/${homeworkItems.length} заданий выполнено`}
        </p>
      </div>

      {/* Notes */}
      {lesson.notes && (
        <div className="rounded-2xl bg-white border border-zinc-200 p-6">
          <p className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">Конспект</p>
          <p className="text-[15px] text-zinc-700 whitespace-pre-wrap leading-relaxed">{lesson.notes}</p>
        </div>
      )}

      {/* Homework */}
      {homeworkItems.length > 0 && (
        <div className="space-y-6">
          {homeworkItems.map((hw) => {
            const sections = hw.sections || [];
            const scores = hw.scores || {};
            const avgScore = Object.keys(scores).length > 0
              ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length) : null;

            return (
              <div key={hw.id} className="rounded-2xl bg-white border border-zinc-200 p-6 space-y-6">
                <div className="flex items-center gap-3">
                  {hw.completed ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5 text-zinc-300" />}
                  <h3 className="text-[17px] font-bold">{hw.title}</h3>
                  {avgScore !== null && (
                    <span className={`ml-auto text-[14px] font-semibold ${avgScore >= 80 ? "text-emerald-500" : avgScore >= 50 ? "text-amber-500" : "text-red-500"}`}>
                      {avgScore}%
                    </span>
                  )}
                </div>

                {sections.map((sec, i) => (
                  <div key={sec.id}>
                    {i > 0 && <div className="border-t border-zinc-100 mb-6" />}
                    <SectionPlayer section={sec} onScore={(sid, score) => handleScore(hw, sid, score)} />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {homeworkItems.length === 0 && !lesson.notes && (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-12 text-center">
          <p className="text-[15px] text-zinc-400">Материалов пока нет</p>
        </div>
      )}
    </div>
  );
}

// ── Main ──

export function StudentView() {
  const { shareId } = useParams<{ shareId: string }>();
  const { students, lessons, homework } = useStore();
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const student = students.find((s) => s.share_id === shareId);
  const studentLessons = student ? lessons.filter((l) => l.student_id === student.id).sort((a, b) => b.date.localeCompare(a.date)) : [];
  const studentHomework = student ? homework.filter((h) => h.student_id === student.id) : [];

  if (!student) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[15px] font-medium text-zinc-900 mb-1">Ученик не найден</p>
          <p className="text-[13px] text-zinc-400">Проверьте ссылку</p>
        </div>
      </div>
    );
  }

  const selectedLesson = selectedLessonId ? studentLessons.find((l) => l.id === selectedLessonId) : null;
  const totalHw = studentHomework.length;
  const completedHw = studentHomework.filter((h) => h.completed).length;

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-zinc-900 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-semibold text-[14px] tracking-tight">Lekto</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {selectedLesson ? (
          <LessonView
            lesson={selectedLesson}
            homeworkItems={studentHomework.filter((h) => h.lesson_id === selectedLesson.id)}
            onBack={() => setSelectedLessonId(null)}
          />
        ) : (
          <div className="space-y-6">
            {/* Student header */}
            <div className="flex items-center gap-4">
              <img src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(student.name)}`}
                alt={student.name} className="h-12 w-12 rounded-full bg-zinc-100 shrink-0" />
              <div>
                <h1 className="text-xl font-bold tracking-tight">{student.name}</h1>
                <p className="text-[13px] text-zinc-400 mt-0.5">
                  {studentLessons.length} уроков · {completedHw}/{totalHw} заданий выполнено
                </p>
              </div>
            </div>

            {/* Lessons list */}
            {studentLessons.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-12 text-center">
                <p className="text-[15px] text-zinc-400">Уроков пока нет. Ваш репетитор добавит их сюда.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {studentLessons.map((l) => {
                  const lhw = studentHomework.filter((h) => h.lesson_id === l.id);
                  const lhwDone = lhw.filter((h) => h.completed).length;

                  return (
                    <button key={l.id} onClick={() => setSelectedLessonId(l.id)}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-5 py-4 flex items-center gap-4 text-left hover:border-zinc-300 transition-colors cursor-pointer group">
                      <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                        <BookOpen className="h-4.5 w-4.5 text-zinc-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-medium truncate">{l.title}</p>
                        <p className="text-[13px] text-zinc-400 mt-0.5">
                          {l.date}
                          {lhw.length > 0 && (
                            <span className={lhwDone === lhw.length && lhw.length > 0 ? "text-emerald-500" : ""}>
                              {" "}· {lhwDone}/{lhw.length} заданий
                            </span>
                          )}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
