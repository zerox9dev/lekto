import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import type { HomeworkSection, MatchingContent } from "@/types/database";

export function MatchingPlayer({ section, onScore }: { section: HomeworkSection; onScore: (score: number) => void }) {
  const { t } = useTranslation();
  const content = section.content as MatchingContent;
  const [answers, setAnswers] = useState<(number | null)[]>(() => new Array(content.pairs.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [shuffledRight] = useState(() => {
    const indices = content.pairs.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [indices[i], indices[j]] = [indices[j], indices[i]]; }
    return indices;
  });

  const selectPair = (i: number, value: string) => {
    const na = [...answers];
    na[i] = value === "" ? null : Number(value);
    setAnswers(na);
    if (!na.includes(null)) {
      setTimeout(() => {
        setSubmitted(true);
        onScore(Math.round((na.filter((a, idx) => shuffledRight[a!] === idx).length / content.pairs.length) * 100));
      }, 300);
    }
  };

  return (
    <div className="space-y-3">
      {content.pairs.map((pair, i) => (
        <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <span className="text-[14px] md:text-[15px] font-medium sm:min-w-[120px] break-words">{pair.left}</span>
          <span className="text-[#ccc] hidden sm:block">→</span>
          <select value={answers[i] ?? ""} onChange={(e) => selectPair(i, e.target.value)}
            disabled={submitted}
            className={`w-full sm:w-auto h-11 md:h-10 rounded-xl border px-3 text-[14px] bg-white sm:min-w-[140px] ${
              submitted ? shuffledRight[answers[i]!] === i ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50" : "border-[#e8e5de]"
            }`}>
            <option value="">{t("choose")}</option>
            {shuffledRight.map((ri, si) => <option key={si} value={si}>{content.pairs[ri].right}</option>)}
          </select>
        </div>
      ))}
    </div>
  );
}
