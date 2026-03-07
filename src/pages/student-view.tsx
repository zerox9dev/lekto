import { useState } from "react";
import { useParams } from "react-router-dom";
import { BookOpen, Sparkles, CheckCircle2, Circle, ChevronDown, ChevronUp, ClipboardCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Homework, HomeworkSection, QuizQuestion, FillBlanksContent, MatchingContent, OrderingContent, CardsContent } from "@/types/database";

const typeLabels: Record<string, string> = {
  quiz: "Тест", fill_blanks: "Вставить слово", matching: "Соединить пары",
  ordering: "Расставить по порядку", cards: "Карточки", text: "Задание",
};

// ── Section Players ──

function QuizPlayer({ section, onScore }: { section: HomeworkSection; onScore: (score: number) => void }) {
  const questions = section.content as QuizQuestion[];
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    const correct = questions.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0);
    setSubmitted(true);
    onScore(Math.round((correct / questions.length) * 100));
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
                  }`}>{opt}</button>
              );
            })}
          </div>
        </div>
      ))}
      {!submitted && (
        <button onClick={handleSubmit} disabled={answers.includes(-1)}
          className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-[13px] font-medium hover:bg-zinc-800 disabled:opacity-40 cursor-pointer">Проверить</button>
      )}
    </div>
  );
}

function FillBlanksPlayer({ section, onScore }: { section: HomeworkSection; onScore: (score: number) => void }) {
  const content = section.content as FillBlanksContent;
  const [answers, setAnswers] = useState<string[]>(new Array(content.answers.length).fill(""));
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  const handleSubmit = () => {
    const res = content.answers.map((a, i) => a.trim().toLowerCase() === answers[i].trim().toLowerCase());
    setResults(res);
    setSubmitted(true);
    onScore(Math.round((res.filter(Boolean).length / res.length) * 100));
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
                <input value={answers[idx] || ""} onChange={(e) => { const na = [...answers]; na[idx] = e.target.value; setAnswers(na); }}
                  disabled={submitted}
                  className={`inline-block w-28 h-7 mx-1 px-2 rounded-md border text-[13px] text-center outline-none ${
                    submitted ? results[idx] ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50" : "border-zinc-300 focus:border-zinc-500"
                  }`} />
              );
            })()}
          </span>
        ))}
      </div>
      {submitted && <p className="text-[12px] text-zinc-400">Ответы: {content.answers.join(", ")}</p>}
      {!submitted && (
        <button onClick={handleSubmit} disabled={answers.some((a) => !a.trim())}
          className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-[13px] font-medium hover:bg-zinc-800 disabled:opacity-40 cursor-pointer">Проверить</button>
      )}
    </div>
  );
}

function MatchingPlayer({ section, onScore }: { section: HomeworkSection; onScore: (score: number) => void }) {
  const content = section.content as MatchingContent;
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(content.pairs.length).fill(null));
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
    <div className="space-y-4">
      {content.pairs.map((pair, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-[14px] min-w-[100px]">{pair.left}</span>
          <span className="text-zinc-300">→</span>
          <select value={answers[i] ?? ""} onChange={(e) => { const na = [...answers]; na[i] = e.target.value === "" ? null : Number(e.target.value); setAnswers(na); }}
            disabled={submitted}
            className={`h-9 rounded-lg border px-2 text-[13px] bg-white min-w-[120px] ${
              submitted ? shuffledRight[answers[i]!] === i ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50" : "border-zinc-200"
            }`}>
            <option value="">—</option>
            {shuffledRight.map((ri, si) => <option key={si} value={si}>{content.pairs[ri].right}</option>)}
          </select>
        </div>
      ))}
      {!submitted && (
        <button onClick={handleSubmit} disabled={answers.includes(null)}
          className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-[13px] font-medium hover:bg-zinc-800 disabled:opacity-40 cursor-pointer">Проверить</button>
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

  const move = (i: number, dir: -1 | 1) => { const next = [...items]; [next[i], next[i + dir]] = [next[i + dir], next[i]]; setItems(next); };

  const handleSubmit = () => {
    const correct = items.reduce((acc, item, i) => acc + (item === content.items[content.correct_order[i]] ? 1 : 0), 0);
    setSubmitted(true);
    onScore(Math.round((correct / items.length) * 100));
  };

  return (
    <div className="space-y-4">
      {items.map((item, i) => {
        const isCorrect = submitted && item === content.items[content.correct_order[i]];
        return (
          <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[13px] ${
            submitted ? isCorrect ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50" : "border-zinc-200"
          }`}>
            <span className="text-zinc-400 w-5 text-center">{i + 1}</span>
            <span className="flex-1">{item}</span>
            {!submitted && (
              <div className="flex flex-col gap-0.5">
                <button onClick={() => i > 0 && move(i, -1)} disabled={i === 0} className="text-zinc-400 hover:text-zinc-600 disabled:opacity-30 cursor-pointer"><ChevronUp className="h-3.5 w-3.5" /></button>
                <button onClick={() => i < items.length - 1 && move(i, 1)} disabled={i === items.length - 1} className="text-zinc-400 hover:text-zinc-600 disabled:opacity-30 cursor-pointer"><ChevronDown className="h-3.5 w-3.5" /></button>
              </div>
            )}
          </div>
        );
      })}
      {!submitted && <button onClick={handleSubmit} className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-[13px] font-medium hover:bg-zinc-800 cursor-pointer">Проверить</button>}
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
        className="min-h-[120px] rounded-xl border border-zinc-200 bg-white flex items-center justify-center p-6 cursor-pointer hover:border-zinc-300 select-none">
        <div className="text-center">
          <p className="text-[11px] text-zinc-400 mb-2">{flipped ? "Оборот" : "Лицо"}</p>
          <p className="text-[18px] font-medium">{flipped ? card.back : card.front}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <button onClick={() => { setIndex(Math.max(0, index - 1)); setFlipped(false); }} disabled={index === 0}
          className="px-3 py-1.5 rounded-lg text-[13px] text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 cursor-pointer">← Назад</button>
        <span className="text-[12px] text-zinc-400">{index + 1} / {content.cards.length}</span>
        <button onClick={() => { setIndex(Math.min(content.cards.length - 1, index + 1)); setFlipped(false); }} disabled={index === content.cards.length - 1}
          className="px-3 py-1.5 rounded-lg text-[13px] text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 cursor-pointer">Далее →</button>
      </div>
    </div>
  );
}

function SectionPlayer({ section, onScore }: { section: HomeworkSection; onScore: (sectionId: string, score: number) => void }) {
  const handle = (score: number) => onScore(section.id, score);
  return (
    <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-medium text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-md">{typeLabels[section.type]}</span>
        <span className="text-[13px] font-medium">{section.title}</span>
      </div>
      {section.type === "quiz" && <QuizPlayer section={section} onScore={handle} />}
      {section.type === "fill_blanks" && <FillBlanksPlayer section={section} onScore={handle} />}
      {section.type === "matching" && <MatchingPlayer section={section} onScore={handle} />}
      {section.type === "ordering" && <OrderingPlayer section={section} onScore={handle} />}
      {section.type === "cards" && <CardsPlayer section={section} />}
      {section.type === "text" && <div className="text-[14px] text-zinc-600 whitespace-pre-wrap">{(section.content as { text: string }).text}</div>}
    </div>
  );
}

// ── Homework block inside lesson ──

function HomeworkBlock({ hw }: { hw: Homework }) {
  const { updateHomework } = useStore();
  const sections = hw.sections || [];
  const scores = hw.scores || {};
  const gradable = sections.filter((s) => s.type !== "text" && s.type !== "cards").length;

  const handleScore = (sectionId: string, score: number) => {
    const newScores = { ...scores, [sectionId]: score };
    updateHomework(hw.id, { scores: newScores, completed: Object.keys(newScores).length >= gradable });
  };

  const avgScore = Object.keys(scores).length > 0
    ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length)
    : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {hw.completed ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4 text-zinc-300" />}
        <span className="text-[14px] font-semibold">{hw.title}</span>
        {avgScore !== null && <span className="text-[12px] text-zinc-400 ml-auto">{avgScore}%</span>}
      </div>
      {sections.map((sec) => (
        <SectionPlayer key={sec.id} section={sec} onScore={handleScore} />
      ))}
    </div>
  );
}

// ── Lesson Card with homework inside ──

function LessonCard({ lesson, homeworkItems }: { lesson: any; homeworkItems: Homework[] }) {
  const [expanded, setExpanded] = useState(false);
  const completedHw = homeworkItems.filter((h) => h.completed).length;
  const totalHw = homeworkItems.length;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <button onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-zinc-50 transition-colors cursor-pointer">
        <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
          <BookOpen className="h-4.5 w-4.5 text-zinc-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-medium truncate">{lesson.title}</p>
          <p className="text-[12px] text-zinc-400">
            {lesson.date}
            {totalHw > 0 && (
              <span className={completedHw === totalHw ? "text-emerald-500" : ""}>
                {" "}· {completedHw}/{totalHw} заданий
              </span>
            )}
          </p>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-5">
          {/* Notes */}
          {lesson.notes && (
            <div className="rounded-xl bg-zinc-50 px-4 py-3">
              <p className="text-[12px] font-medium text-zinc-400 mb-1">Конспект</p>
              <p className="text-[13px] text-zinc-600 whitespace-pre-wrap leading-relaxed">{lesson.notes}</p>
            </div>
          )}

          {/* Homework */}
          {homeworkItems.length > 0 && (
            <div className="space-y-4">
              <p className="text-[12px] font-medium text-zinc-400 flex items-center gap-1.5">
                <ClipboardCheck className="h-3.5 w-3.5" /> Домашнее задание
              </p>
              {homeworkItems.map((h) => (
                <HomeworkBlock key={h.id} hw={h} />
              ))}
            </div>
          )}

          {!lesson.notes && homeworkItems.length === 0 && (
            <p className="text-[13px] text-zinc-400 text-center py-4">Нет материалов</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main ──

export function StudentView() {
  const { shareId } = useParams<{ shareId: string }>();
  const { students, lessons, homework } = useStore();

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

  const totalHw = studentHomework.length;
  const completedHw = studentHomework.filter((h) => h.completed).length;

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

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">
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

        {studentLessons.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-8 text-center">
            <p className="text-[14px] text-zinc-400">Уроков пока нет. Ваш репетитор добавит их сюда.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {studentLessons.map((l) => (
              <LessonCard key={l.id} lesson={l}
                homeworkItems={studentHomework.filter((h) => h.lesson_id === l.id)} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
