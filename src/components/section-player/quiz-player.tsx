import { useState } from "react";
import { Check } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import type { HomeworkSection, QuizQuestion } from "@/types/database";

function getCorrectIndices(q: QuizQuestion): number[] {
  return Array.isArray(q.correct) ? q.correct : [q.correct];
}

export function QuizPlayer({ section, onScore }: { section: HomeworkSection; onScore: (score: number) => void }) {
  const { t } = useTranslation();
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
        if (expected.length === selected.length && expected.every((e) => selected.includes(e))) correct++;
      } else {
        if (expected.includes(singleAnswers[i])) correct++;
      }
    });
    setSubmitted(true);
    onScore(Math.round((correct / questions.length) * 100));
  };

  const selectSingle = (qi: number, oi: number) => {
    if (submitted) return;
    const next = singleAnswers.map((a, i) => i === qi ? oi : a);
    setSingleAnswers(next);
    if (!next.includes(-1)) {
      setTimeout(() => {
        let correct = 0;
        questions.forEach((q, i) => { if (getCorrectIndices(q).includes(next[i])) correct++; });
        setSubmitted(true);
        onScore(Math.round((correct / questions.length) * 100));
      }, 300);
    }
  };

  const selectMulti = (qi: number, oi: number) => {
    if (submitted) return;
    toggleMulti(qi, oi);
  };

  const confirmMulti = () => {
    if (submitted || multiAnswers.some((s) => s.size === 0)) return;
    handleSubmit();
  };

  return (
    <div className="space-y-4">
      {isMulti && <p className="text-[12px] text-[#888]">{t("selectAllCorrect")}</p>}
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
                    onClick={() => isMulti ? selectMulti(qi, oi) : selectSingle(qi, oi)}
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
                <p className="text-[13px] text-blue-700">{t("explanationLabel")} {q.explanation}</p>
              </div>
            )}
          </div>
        );
      })}
      {isMulti && !submitted && (
        <button onClick={confirmMulti} disabled={multiAnswers.some((s) => s.size === 0)}
          className="w-full sm:w-auto px-5 py-3 md:py-2.5 rounded-full bg-[#1a1a1a] text-white text-[14px] font-medium hover:bg-[#333] disabled:opacity-40 cursor-pointer">{t("done")}</button>
      )}
      {submitted && (
        <div className="rounded-xl bg-[#f5f3ee] px-4 py-3">
          <p className="text-[14px] font-medium">
            {t("result")} {questions.reduce((acc, q, i) => {
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
