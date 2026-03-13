import { Check, X } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import type { HomeworkSection, QuizQuestion } from "@/types/database";

function getCorrectIndices(q: QuizQuestion): number[] {
  return Array.isArray(q.correct) ? q.correct : [q.correct];
}

function isCorrectIndex(q: QuizQuestion, idx: number): boolean {
  return getCorrectIndices(q).includes(idx);
}

export function QuizEditor({ section, onChange }: { section: HomeworkSection; onChange: (s: HomeworkSection) => void }) {
  const { t } = useTranslation();
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
      <p className="text-[11px] text-[#888]">{t("multiChoiceHint")}</p>
      {questions.map((q, qi) => (
        <div key={qi} className="rounded-lg border border-[#e8e5de] p-2.5 md:p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#888]">{t("questionN")} {qi + 1}</span>
            {questions.length > 1 && (
              <button onClick={() => setQ(questions.filter((_, i) => i !== qi))} className="text-[11px] text-red-400 hover:text-red-500 cursor-pointer">{t("delete")}</button>
            )}
          </div>
          <input value={q.question} onChange={(e) => { const nq = [...questions]; nq[qi] = { ...nq[qi], question: e.target.value }; setQ(nq); }}
            placeholder={t("questionPlaceholder")} className="w-full h-9 rounded-lg border border-[#e8e5de] px-3 text-[13px] outline-none focus:border-[#ccc]" />
          {q.options.map((opt, oi) => (
            <div key={oi} className="flex items-center gap-2">
              <button onClick={() => toggleCorrect(qi, oi)}
                className={`h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                  isCorrectIndex(q, oi) ? "border-emerald-500 bg-emerald-500" : "border-[#d0ccc4] hover:border-[#ccc]"
                }`}>
                {isCorrectIndex(q, oi) && <Check className="h-3 w-3 text-white" />}
              </button>
              <input value={opt} onChange={(e) => { const nq = [...questions]; nq[qi] = { ...nq[qi], options: nq[qi].options.map((o, i) => i === oi ? e.target.value : o) }; setQ(nq); }}
                placeholder={`${t("optionN")} ${oi + 1}`} className="flex-1 h-9 rounded-lg border border-[#e8e5de] px-3 text-[13px] outline-none focus:border-[#ccc] min-w-0" />
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
              className="text-[11px] text-[#888] hover:text-[#666] cursor-pointer">{t("addOption")}</button>
          </div>
          <div>
            <input value={q.explanation || ""} onChange={(e) => { const nq = [...questions]; nq[qi] = { ...nq[qi], explanation: e.target.value }; setQ(nq); }}
              placeholder={t("explanationPlaceholder")} className="w-full h-8 rounded-lg border border-dashed border-[#e8e5de] px-3 text-[12px] text-[#888] outline-none focus:border-[#ccc]" />
          </div>
        </div>
      ))}
      <button onClick={() => setQ([...questions, { question: "", options: ["", ""], correct: 0 }])}
        className="text-[12px] text-[#888] font-medium hover:text-[#666] cursor-pointer">{t("addQuestion")}</button>
    </div>
  );
}
