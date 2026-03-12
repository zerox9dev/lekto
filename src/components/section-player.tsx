import { useState, useMemo } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import type { HomeworkSection, QuizQuestion, FillBlanksContent, MatchingContent, OrderingContent, CardsContent, TrueFalseContent, OpenAnswerContent } from "@/types/database";

const typeLabels: Record<string, string> = {
  quiz: "Тест", fill_blanks: "Вставить слово", matching: "Соединить пары",
  ordering: "Расставить по порядку", cards: "Карточки", text: "Задание",
  true_false: "Верно / Неверно", open_answer: "Открытый ответ",
};

// ── Section Players ──

function getCorrectIndices(q: QuizQuestion): number[] {
  return Array.isArray(q.correct) ? q.correct : [q.correct];
}

function QuizPlayer({ section, onScore }: { section: HomeworkSection; onScore: (score: number) => void }) {
  const questions = section.content as QuizQuestion[];
  const isMulti = questions.some((q) => Array.isArray(q.correct) && q.correct.length > 1);

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
      {isMulti && <p className="text-[12px] text-[#888]">Выбери все правильные ответы</p>}
      {questions.map((q, qi) => {
        const expected = getCorrectIndices(q);
        return (
          <div key={qi} className="space-y-2">
            <p className="text-[14px] md:text-[15px] font-medium">{qi + 1}. {q.question}</p>
            <div className="space-y-1.5 pl-0.5 md:pl-1">
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
                    className={`w-full text-left px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-[13px] md:text-[14px] border transition-colors cursor-pointer flex items-center gap-2.5 md:gap-3 min-h-[44px] ${
                      isCorrect ? "border-emerald-300 bg-emerald-50 text-emerald-700" :
                      isWrong ? "border-red-300 bg-red-50 text-red-700" :
                      selected ? "border-[#ccc] bg-[#f5f3ee]" :
                      "border-[#e8e5de] hover:border-[#d0ccc4]"
                    }`}>
                    {isMulti ? (
                      <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                        submitted ? (isCorrect ? "border-emerald-500 bg-emerald-500" : isWrong ? "border-red-400 bg-red-400" : "border-[#d0ccc4]") :
                        selected ? "border-[#888] bg-[#f5f3ee]0" : "border-[#d0ccc4]"
                      }`}>
                        {(selected || (submitted && isCorrect)) && <Check className="h-3 w-3 text-white" />}
                      </div>
                    ) : (
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        submitted ? (isCorrect ? "border-emerald-500 bg-emerald-500" : isWrong ? "border-red-400 bg-red-400" : "border-[#d0ccc4]") :
                        selected ? "border-[#888] bg-[#f5f3ee]0" : "border-[#d0ccc4]"
                      }`}>
                        {(selected || (submitted && isCorrect)) && <div className="h-2 w-2 rounded-full bg-white" />}
                      </div>
                    )}
                    <span className="break-words min-w-0">{opt}</span>
                  </button>
                );
              })}
            </div>
            {submitted && q.explanation && (
              <div className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 ml-0.5 md:ml-1">
                <p className="text-[13px] text-blue-700">💡 {q.explanation}</p>
              </div>
            )}
          </div>
        );
      })}
      {!submitted && (
        <button onClick={handleSubmit} disabled={!allAnswered}
          className="w-full sm:w-auto px-5 py-3 md:py-2.5 rounded-full bg-[#1a1a1a] text-white text-[14px] font-medium hover:bg-[#333] disabled:opacity-40 cursor-pointer">Проверить</button>
      )}
      {submitted && (
        <div className="rounded-xl bg-[#f5f3ee] px-4 py-3">
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
      <div className="text-[14px] md:text-[15px] leading-relaxed break-words">
        {segments.map((seg, i) =>
          seg.kind === "text" ? (
            <span key={`t-${i}`}>{seg.value}</span>
          ) : (
            <input
              key={`b-${seg.index}`}
              value={answers[seg.index] || ""}
              onChange={(e) => updateAnswer(seg.index, e.target.value)}
              disabled={submitted}
              className={`inline-block w-24 md:w-32 h-8 mx-0.5 md:mx-1 px-2 md:px-3 rounded-lg border text-[13px] md:text-[14px] text-center outline-none ${
                submitted
                  ? (results[seg.index] ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50")
                  : "border-[#d0ccc4] focus:border-[#888]"
              }`}
            />
          )
        )}
      </div>
      {submitted && (
        <p className="text-[13px] text-[#888] break-words">Правильные ответы: {content.answers.join(", ")}</p>
      )}
      {!submitted && (
        <button onClick={handleSubmit} disabled={answers.slice(0, expectedCount).some((a) => !a.trim())}
          className="w-full sm:w-auto px-5 py-3 md:py-2.5 rounded-full bg-[#1a1a1a] text-white text-[14px] font-medium hover:bg-[#333] disabled:opacity-40 cursor-pointer">
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
        <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <span className="text-[14px] md:text-[15px] font-medium sm:min-w-[120px] break-words">{pair.left}</span>
          <span className="text-[#ccc] hidden sm:block">→</span>
          <select value={answers[i] ?? ""} onChange={(e) => setAnswers((prev) => { const na = [...prev]; na[i] = e.target.value === "" ? null : Number(e.target.value); return na; })}
            disabled={submitted}
            className={`w-full sm:w-auto h-11 md:h-10 rounded-xl border px-3 text-[14px] bg-white sm:min-w-[140px] ${
              submitted ? shuffledRight[answers[i]!] === i ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50" : "border-[#e8e5de]"
            }`}>
            <option value="">Выбрать...</option>
            {shuffledRight.map((ri, si) => <option key={si} value={si}>{content.pairs[ri].right}</option>)}
          </select>
        </div>
      ))}
      {!submitted && (
        <button onClick={handleSubmit} disabled={answers.includes(null)}
          className="w-full sm:w-auto px-5 py-3 md:py-2.5 rounded-full bg-[#1a1a1a] text-white text-[14px] font-medium hover:bg-[#333] disabled:opacity-40 cursor-pointer">Проверить</button>
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
    <div className="space-y-2 md:space-y-3">
      {items.map((item, i) => {
        const isCorrect = submitted && item === content.items[content.correct_order[i]];
        return (
          <div key={i} className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl border text-[13px] md:text-[14px] min-h-[44px] ${
            submitted ? isCorrect ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50" : "border-[#e8e5de]"
          }`}>
            <span className="text-[#888] w-5 md:w-6 text-center font-medium shrink-0">{i + 1}</span>
            <span className="flex-1 break-words min-w-0">{item}</span>
            {!submitted && (
              <div className="flex flex-col gap-0.5 shrink-0">
                <button onClick={() => i > 0 && move(i, -1)} disabled={i === 0} className="text-[#888] hover:text-[#666] disabled:opacity-30 cursor-pointer p-1"><ChevronUp className="h-4 w-4" /></button>
                <button onClick={() => i < items.length - 1 && move(i, 1)} disabled={i === items.length - 1} className="text-[#888] hover:text-[#666] disabled:opacity-30 cursor-pointer p-1"><ChevronDown className="h-4 w-4" /></button>
              </div>
            )}
          </div>
        );
      })}
      {!submitted && <button onClick={handleSubmit} className="w-full sm:w-auto px-5 py-3 md:py-2.5 rounded-full bg-[#1a1a1a] text-white text-[14px] font-medium hover:bg-[#333] cursor-pointer">Проверить</button>}
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
        className="min-h-[140px] md:min-h-[160px] rounded-2xl border border-[#e8e5de] bg-white flex items-center justify-center p-6 md:p-8 cursor-pointer hover:border-[#d0ccc4] select-none transition-colors active:bg-[#f5f3ee]">
        <div className="text-center">
          <p className="text-[11px] md:text-[12px] text-[#888] mb-2 md:mb-3">{flipped ? "Оборот" : "Лицо"} · Нажми чтобы перевернуть</p>
          <p className="text-[18px] md:text-[22px] font-semibold break-words">{flipped ? card.back : card.front}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <button onClick={() => { setIndex(Math.max(0, index - 1)); setFlipped(false); }} disabled={index === 0}
          className="px-3 md:px-4 py-2 rounded-xl text-[14px] text-[#888] hover:bg-[#f0ede6] disabled:opacity-30 cursor-pointer min-h-[44px]">← Назад</button>
        <span className="text-[13px] text-[#888]">{index + 1} / {content.cards.length}</span>
        <button onClick={() => { setIndex(Math.min(content.cards.length - 1, index + 1)); setFlipped(false); }} disabled={index === content.cards.length - 1}
          className="px-3 md:px-4 py-2 rounded-xl text-[14px] text-[#888] hover:bg-[#f0ede6] disabled:opacity-30 cursor-pointer min-h-[44px]">Далее →</button>
      </div>
    </div>
  );
}

function TrueFalsePlayer({ section, onScore }: { section: HomeworkSection; onScore: (score: number) => void }) {
  const c = section.content as TrueFalseContent;
  const [answers, setAnswers] = useState<(boolean | null)[]>(() => new Array(c.questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    const correct = c.questions.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0);
    setSubmitted(true);
    onScore(Math.round((correct / c.questions.length) * 100));
  };

  return (
    <div className="space-y-3">
      {c.questions.map((q, qi) => {
        const answered = answers[qi];
        const isWrong = submitted && answered !== null && answered !== q.correct;
        return (
          <div key={qi} className="space-y-2">
            <p className="text-[14px] md:text-[15px] font-medium">{qi + 1}. {q.statement}</p>
            <div className="flex gap-2 pl-0.5 md:pl-1">
              <button onClick={() => !submitted && setAnswers((prev) => prev.map((a, i) => i === qi ? true : a))}
                disabled={submitted}
                className={`flex-1 py-2.5 md:py-2.5 rounded-xl text-[13px] md:text-[14px] font-medium border cursor-pointer transition-colors min-h-[44px] ${
                  submitted && q.correct === true ? "border-emerald-300 bg-emerald-50 text-emerald-700" :
                  isWrong && answered === true ? "border-red-300 bg-red-50 text-red-600" :
                  answered === true && !submitted ? "border-[#ccc] bg-[#f5f3ee]" :
                  "border-[#e8e5de] hover:border-[#d0ccc4]"
                }`}>✓ Верно</button>
              <button onClick={() => !submitted && setAnswers((prev) => prev.map((a, i) => i === qi ? false : a))}
                disabled={submitted}
                className={`flex-1 py-2.5 md:py-2.5 rounded-xl text-[13px] md:text-[14px] font-medium border cursor-pointer transition-colors min-h-[44px] ${
                  submitted && q.correct === false ? "border-emerald-300 bg-emerald-50 text-emerald-700" :
                  isWrong && answered === false ? "border-red-300 bg-red-50 text-red-600" :
                  answered === false && !submitted ? "border-[#ccc] bg-[#f5f3ee]" :
                  "border-[#e8e5de] hover:border-[#d0ccc4]"
                }`}>✗ Неверно</button>
            </div>
            {submitted && q.explanation && (
              <div className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 ml-0.5 md:ml-1">
                <p className="text-[13px] text-blue-700">💡 {q.explanation}</p>
              </div>
            )}
          </div>
        );
      })}
      {!submitted && (
        <button onClick={handleSubmit} disabled={answers.includes(null)}
          className="w-full sm:w-auto px-5 py-3 md:py-2.5 rounded-full bg-[#1a1a1a] text-white text-[14px] font-medium hover:bg-[#333] disabled:opacity-40 cursor-pointer">Проверить</button>
      )}
      {submitted && (
        <div className="rounded-xl bg-[#f5f3ee] px-4 py-3">
          <p className="text-[14px] font-medium">Результат: {c.questions.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0)}/{c.questions.length}</p>
        </div>
      )}
    </div>
  );
}

function OpenAnswerPlayer({ section, onSubmitAnswer }: { section: HomeworkSection; onSubmitAnswer: (sectionId: string, answer: string) => void }) {
  const c = section.content as OpenAnswerContent;
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    onSubmitAnswer(section.id, answer);
  };

  return (
    <div className="space-y-3">
      <p className="text-[14px] md:text-[15px] text-[#666] whitespace-pre-wrap break-words">{c.prompt}</p>
      <textarea value={answer} onChange={(e) => !submitted && setAnswer(e.target.value)}
        placeholder={c.placeholder || "Напиши свой ответ..."} rows={4} disabled={submitted}
        className="w-full rounded-xl border border-[#e8e5de] px-3 md:px-4 py-2.5 md:py-3 text-[14px] outline-none focus:border-[#ccc] resize-y min-h-[100px] disabled:bg-[#f5f3ee]" />
      {c.min_length && !submitted && (
        <p className="text-[12px] text-[#888]">Минимум {c.min_length} символов ({answer.length}/{c.min_length})</p>
      )}
      {!submitted && (
        <button onClick={handleSubmit} disabled={!answer.trim() || (c.min_length ? answer.length < c.min_length : false)}
          className="w-full sm:w-auto px-5 py-3 md:py-2.5 rounded-full bg-[#1a1a1a] text-white text-[14px] font-medium hover:bg-[#333] disabled:opacity-40 cursor-pointer">Отправить ответ</button>
      )}
      {submitted && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
          <p className="text-[14px] text-emerald-700 font-medium">✓ Ответ отправлен. Репетитор проверит его.</p>
        </div>
      )}
    </div>
  );
}

export function SectionPlayer({ section, onScore }: { section: HomeworkSection; onScore: (sectionId: string, score: number) => void }) {
  const handle = (score: number) => onScore(section.id, score);
  const handleOpenAnswer = (_sectionId: string, _answer: string) => {
    // Open answers are not auto-scored
  };
  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex items-center gap-2 md:gap-2.5 flex-wrap">
        <span className="text-[11px] md:text-[12px] font-medium text-[#888] bg-[#f0ede6] px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg">{typeLabels[section.type]}</span>
        <h3 className="text-[15px] md:text-[16px] font-semibold">{section.title}</h3>
      </div>
      {section.type === "quiz" && <QuizPlayer section={section} onScore={handle} />}
      {section.type === "fill_blanks" && <FillBlanksPlayer section={section} onScore={handle} />}
      {section.type === "matching" && <MatchingPlayer section={section} onScore={handle} />}
      {section.type === "ordering" && <OrderingPlayer section={section} onScore={handle} />}
      {section.type === "cards" && <CardsPlayer section={section} />}
      {section.type === "true_false" && <TrueFalsePlayer section={section} onScore={handle} />}
      {section.type === "open_answer" && <OpenAnswerPlayer section={section} onSubmitAnswer={handleOpenAnswer} />}
      {section.type === "text" && <div className="text-[14px] md:text-[15px] text-[#666] whitespace-pre-wrap leading-relaxed break-words">{(section.content as { text: string }).text}</div>}
    </div>
  );
}
