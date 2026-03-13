import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import type { HomeworkSection, TrueFalseContent } from "@/types/database";

export function TrueFalsePlayer({ section, onScore }: { section: HomeworkSection; onScore: (score: number) => void }) {
  const { t } = useTranslation();
  const c = section.content as TrueFalseContent;
  const [answers, setAnswers] = useState<(boolean | null)[]>(() => new Array(c.questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);

  const selectTF = (qi: number, val: boolean) => {
    if (submitted) return;
    const next = answers.map((a, i) => i === qi ? val : a);
    setAnswers(next);
    if (!next.includes(null)) {
      setTimeout(() => {
        const correct = c.questions.reduce((acc, q, i) => acc + (next[i] === q.correct ? 1 : 0), 0);
        setSubmitted(true);
        onScore(Math.round((correct / c.questions.length) * 100));
      }, 300);
    }
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
              <button onClick={() => selectTF(qi, true)} disabled={submitted}
                className={`flex-1 py-2.5 md:py-2.5 rounded-xl text-[13px] md:text-[14px] font-medium border cursor-pointer transition-colors min-h-[44px] ${
                  submitted && q.correct === true ? "border-emerald-300 bg-emerald-50 text-emerald-700" :
                  isWrong && answered === true ? "border-red-300 bg-red-50 text-red-600" :
                  answered === true && !submitted ? "border-[#ccc] bg-[#f5f3ee]" :
                  "border-[#e8e5de] hover:border-[#d0ccc4]"
                }`}>{t("trueBtn")}</button>
              <button onClick={() => selectTF(qi, false)} disabled={submitted}
                className={`flex-1 py-2.5 md:py-2.5 rounded-xl text-[13px] md:text-[14px] font-medium border cursor-pointer transition-colors min-h-[44px] ${
                  submitted && q.correct === false ? "border-emerald-300 bg-emerald-50 text-emerald-700" :
                  isWrong && answered === false ? "border-red-300 bg-red-50 text-red-600" :
                  answered === false && !submitted ? "border-[#ccc] bg-[#f5f3ee]" :
                  "border-[#e8e5de] hover:border-[#d0ccc4]"
                }`}>{t("falseBtn")}</button>
            </div>
            {submitted && q.explanation && (
              <div className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 ml-0.5 md:ml-1">
                <p className="text-[13px] text-blue-700">{t("explanationLabel")} {q.explanation}</p>
              </div>
            )}
          </div>
        );
      })}
      {submitted && (
        <div className="rounded-xl bg-[#f5f3ee] px-4 py-3">
          <p className="text-[14px] font-medium">{t("result")} {c.questions.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0)}/{c.questions.length}</p>
        </div>
      )}
    </div>
  );
}
