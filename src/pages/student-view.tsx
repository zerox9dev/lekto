import { useState } from "react";
import { useParams } from "react-router-dom";
import { BookOpen, Sparkles, CheckCircle2, Circle, ChevronDown, ChevronUp, ClipboardCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Homework, QuizQuestion, FillBlanksContent, MatchingContent, OrderingContent } from "@/types/database";

// ── Homework Players ──

function QuizPlayer({ hw, onSubmit }: { hw: Homework; onSubmit: (answers: number[], score: number) => void }) {
  const questions = hw.content as QuizQuestion[];
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    const correct = questions.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0);
    const score = Math.round((correct / questions.length) * 100);
    setSubmitted(true);
    onSubmit(answers, score);
  };

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => (
        <div key={qi} className="space-y-2">
          <p className="text-[14px] font-medium">{qi + 1}. {q.question}</p>
          <div className="space-y-1.5 pl-1">
            {q.options.map((opt, oi) => {
              const selected = answers[qi] === oi;
              const isCorrect = submitted && oi === q.correct;
              const isWrong = submitted && selected && oi !== q.correct;
              return (
                <button key={oi} onClick={() => !submitted && setAnswers(answers.map((a, i) => i === qi ? oi : a))}
                  disabled={submitted}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[13px] border transition-colors cursor-pointer ${
                    isCorrect ? "border-emerald-300 bg-emerald-50 text-emerald-700" :
                    isWrong ? "border-red-300 bg-red-50 text-red-700" :
                    selected ? "border-zinc-400 bg-zinc-50" :
                    "border-zinc-200 hover:border-zinc-300"
                  }`}>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {!submitted && (
        <button onClick={handleSubmit} disabled={answers.includes(-1)}
          className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-[13px] font-medium hover:bg-zinc-800 transition-colors disabled:opacity-40 cursor-pointer">
          Проверить
        </button>
      )}
    </div>
  );
}

function FillBlanksPlayer({ hw, onSubmit }: { hw: Homework; onSubmit: (answers: string[], score: number) => void }) {
  const content = hw.content as FillBlanksContent;
  const [answers, setAnswers] = useState<string[]>(new Array(content.answers.length).fill(""));
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  const handleSubmit = () => {
    const res = content.answers.map((a, i) => a.trim().toLowerCase() === answers[i].trim().toLowerCase());
    const score = Math.round((res.filter(Boolean).length / res.length) * 100);
    setResults(res);
    setSubmitted(true);
    onSubmit(answers, score);
  };

  const parts = content.text.split("___");
  let blankIdx = 0;

  return (
    <div className="space-y-4">
      <div className="text-[14px] leading-relaxed">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (() => {
              const idx = blankIdx++;
              return (
                <input
                  value={answers[idx] || ""}
                  onChange={(e) => { const na = [...answers]; na[idx] = e.target.value; setAnswers(na); }}
                  disabled={submitted}
                  className={`inline-block w-28 h-7 mx-1 px-2 rounded-md border text-[13px] text-center outline-none ${
                    submitted
                      ? results[idx] ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50"
                      : "border-zinc-300 focus:border-zinc-500"
                  }`}
                />
              );
            })()}
          </span>
        ))}
      </div>
      {submitted && (
        <p className="text-[12px] text-zinc-400">Правильные ответы: {content.answers.join(", ")}</p>
      )}
      {!submitted && (
        <button onClick={handleSubmit} disabled={answers.some((a) => !a.trim())}
          className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-[13px] font-medium hover:bg-zinc-800 transition-colors disabled:opacity-40 cursor-pointer">
          Проверить
        </button>
      )}
    </div>
  );
}

function MatchingPlayer({ hw, onSubmit }: { hw: Homework; onSubmit: (answers: number[], score: number) => void }) {
  const content = hw.content as MatchingContent;
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(content.pairs.length).fill(null));
  const [submitted, setSubmitted] = useState(false);

  const [shuffledRight] = useState(() => {
    const indices = content.pairs.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  });

  const handleSubmit = () => {
    const score = Math.round((answers.filter((a, i) => shuffledRight[a!] === i).length / content.pairs.length) * 100);
    setSubmitted(true);
    onSubmit(answers as number[], score);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {content.pairs.map((pair, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-[14px] min-w-[120px]">{pair.left}</span>
            <span className="text-zinc-300">→</span>
            <select
              value={answers[i] ?? ""}
              onChange={(e) => { const na = [...answers]; na[i] = e.target.value === "" ? null : Number(e.target.value); setAnswers(na); }}
              disabled={submitted}
              className={`h-9 rounded-lg border px-2 text-[13px] bg-white min-w-[140px] ${
                submitted
                  ? shuffledRight[answers[i]!] === i ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50"
                  : "border-zinc-200"
              }`}
            >
              <option value="">—</option>
              {shuffledRight.map((ri, si) => (
                <option key={si} value={si}>{content.pairs[ri].right}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
      {!submitted && (
        <button onClick={handleSubmit} disabled={answers.includes(null)}
          className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-[13px] font-medium hover:bg-zinc-800 transition-colors disabled:opacity-40 cursor-pointer">
          Проверить
        </button>
      )}
    </div>
  );
}

function OrderingPlayer({ hw, onSubmit }: { hw: Homework; onSubmit: (answers: string[], score: number) => void }) {
  const content = hw.content as OrderingContent;
  const [items, setItems] = useState(() => {
    const shuffled = [...content.items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });
  const [submitted, setSubmitted] = useState(false);

  const moveUp = (i: number) => {
    if (i === 0) return;
    const next = [...items];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    setItems(next);
  };
  const moveDown = (i: number) => {
    if (i === items.length - 1) return;
    const next = [...items];
    [next[i], next[i + 1]] = [next[i + 1], next[i]];
    setItems(next);
  };

  const handleSubmit = () => {
    const correct = items.reduce((acc, item, i) => acc + (item === content.items[content.correct_order[i]] ? 1 : 0), 0);
    const score = Math.round((correct / items.length) * 100);
    setSubmitted(true);
    onSubmit(items, score);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        {items.map((item, i) => {
          const isCorrect = submitted && item === content.items[content.correct_order[i]];
          return (
            <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[13px] ${
              submitted
                ? isCorrect ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50"
                : "border-zinc-200"
            }`}>
              <span className="text-zinc-400 w-5 text-center">{i + 1}</span>
              <span className="flex-1">{item}</span>
              {!submitted && (
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveUp(i)} disabled={i === 0} className="text-zinc-400 hover:text-zinc-600 disabled:opacity-30 cursor-pointer">
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => moveDown(i)} disabled={i === items.length - 1} className="text-zinc-400 hover:text-zinc-600 disabled:opacity-30 cursor-pointer">
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {!submitted && (
        <button onClick={handleSubmit}
          className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-[13px] font-medium hover:bg-zinc-800 transition-colors cursor-pointer">
          Проверить
        </button>
      )}
    </div>
  );
}

// ── Homework Card (embedded in lesson) ──

function HomeworkCard({ hw }: { hw: Homework }) {
  const { updateHomework } = useStore();
  const [expanded, setExpanded] = useState(!hw.completed);

  const handleResult = (answers: any, score: number) => {
    updateHomework(hw.id, { student_answers: answers, score, completed: true });
  };

  const typeLabel: Record<string, string> = {
    quiz: "Тест", fill_blanks: "Вставить слово", matching: "Соединить пары", ordering: "Расставить по порядку", text: "Задание",
  };

  return (
    <div className="rounded-lg border border-zinc-100 bg-zinc-50/50 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2.5 flex items-center gap-2.5 text-left hover:bg-zinc-100/50 transition-colors cursor-pointer">
        {hw.completed
          ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          : <Circle className="h-4 w-4 text-zinc-300 shrink-0" />
        }
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium truncate">{hw.title}</p>
          <p className="text-[11px] text-zinc-400">{typeLabel[hw.type]}{hw.score !== null ? ` · ${hw.score}%` : ""}</p>
        </div>
        {expanded ? <ChevronUp className="h-3.5 w-3.5 text-zinc-400" /> : <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />}
      </button>
      {expanded && (
        <div className="px-3 pb-3 pt-1">
          {hw.type === "quiz" && <QuizPlayer hw={hw} onSubmit={handleResult} />}
          {hw.type === "fill_blanks" && <FillBlanksPlayer hw={hw} onSubmit={handleResult} />}
          {hw.type === "matching" && <MatchingPlayer hw={hw} onSubmit={handleResult} />}
          {hw.type === "ordering" && <OrderingPlayer hw={hw} onSubmit={handleResult} />}
          {hw.type === "text" && (
            <div className="text-[14px] text-zinc-600 whitespace-pre-wrap">
              {(hw.content as { text: string }).text}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Lesson Card with nested homework ──

function LessonCard({ lesson, homeworkItems }: { lesson: any; homeworkItems: Homework[] }) {
  const [expanded, setExpanded] = useState(false);
  const completedCount = homeworkItems.filter((h) => h.completed).length;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <button onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-zinc-50 transition-colors cursor-pointer">
        <div className="h-9 w-9 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
          <BookOpen className="h-4 w-4 text-zinc-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-medium truncate">{lesson.title}</p>
          <p className="text-[12px] text-zinc-400">
            {lesson.date}
            {homeworkItems.length > 0 && (
              <span> · {completedCount}/{homeworkItems.length} заданий</span>
            )}
          </p>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Notes */}
          {lesson.notes && (
            <div className="text-[13px] text-zinc-600 whitespace-pre-wrap leading-relaxed">
              {lesson.notes}
            </div>
          )}

          {/* Homework inside lesson */}
          {homeworkItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-[12px] font-medium text-zinc-500 flex items-center gap-1.5">
                <ClipboardCheck className="h-3.5 w-3.5" /> Домашние задания
              </p>
              {homeworkItems.map((h) => (
                <HomeworkCard key={h.id} hw={h} />
              ))}
            </div>
          )}

          {homeworkItems.length === 0 && !lesson.notes && (
            <p className="text-[13px] text-zinc-400">Нет материалов</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Student View ──

export function StudentView() {
  const { shareId } = useParams<{ shareId: string }>();
  const { students, lessons, homework } = useStore();

  const student = students.find((s) => s.share_id === shareId);
  const studentLessons = student ? lessons.filter((l) => l.student_id === student.id) : [];
  const studentHomework = student ? homework.filter((h) => h.student_id === student.id) : [];

  // Homework not attached to any lesson
  const unattachedHomework = studentHomework.filter((h) => !h.lesson_id || !studentLessons.find((l) => l.id === h.lesson_id));

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

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-zinc-900 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-semibold text-[14px] tracking-tight">Lekto</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center gap-4">
          <img
            src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(student.name)}`}
            alt={student.name}
            className="h-12 w-12 rounded-full bg-zinc-100 shrink-0"
          />
          <div>
            <h1 className="text-xl font-bold tracking-tight">{student.name}</h1>
            <p className="text-[13px] text-zinc-400 mt-0.5">
              {studentLessons.length} {studentLessons.length === 1 ? "урок" : "уроков"} · {studentHomework.length} заданий
            </p>
          </div>
        </div>

        {/* Lessons with nested homework */}
        {studentLessons.length === 0 && unattachedHomework.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-8 text-center">
            <p className="text-[14px] text-zinc-400">Уроков пока нет. Ваш репетитор добавит их сюда.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {studentLessons.map((l) => {
              const lessonHw = studentHomework.filter((h) => h.lesson_id === l.id);
              return <LessonCard key={l.id} lesson={l} homeworkItems={lessonHw} />;
            })}

            {/* Unattached homework */}
            {unattachedHomework.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-[12px] font-medium text-zinc-500 flex items-center gap-1.5">
                  <ClipboardCheck className="h-3.5 w-3.5" /> Дополнительные задания
                </p>
                {unattachedHomework.map((h) => (
                  <HomeworkCard key={h.id} hw={h} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
