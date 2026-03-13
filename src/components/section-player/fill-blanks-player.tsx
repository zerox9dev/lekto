import { useState, useMemo } from "react";
import { useTranslation } from "@/lib/i18n";
import type { HomeworkSection, FillBlanksContent } from "@/types/database";

export function FillBlanksPlayer({ section, onScore }: { section: HomeworkSection; onScore: (score: number) => void }) {
  const { t } = useTranslation();
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
    const next = [...answers]; next[idx] = value; setAnswers(next);
  };

  const autoCheck = (_idx: number) => {
    if (submitted) return;
    const allFilled = answers.slice(0, expectedCount).every((a) => a.trim());
    if (!allFilled) return;
    const res = content.answers.map((a, i) => a.trim().toLowerCase() === (answers[i] || "").trim().toLowerCase());
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
            <input key={`b-${seg.index}`} value={answers[seg.index] || ""}
              onChange={(e) => updateAnswer(seg.index, e.target.value)}
              onBlur={() => autoCheck(seg.index)}
              onKeyDown={(e) => e.key === "Enter" && autoCheck(seg.index)}
              disabled={submitted}
              className={`inline-block w-24 md:w-32 h-8 mx-0.5 md:mx-1 px-2 md:px-3 rounded-lg border text-[13px] md:text-[14px] text-center outline-none ${
                submitted ? (results[seg.index] ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50") : "border-[#d0ccc4] focus:border-[#888]"
              }`} />
          )
        )}
      </div>
      {submitted && <p className="text-[13px] text-[#888] break-words">{t("correctAnswersLabel")} {content.answers.join(", ")}</p>}
    </div>
  );
}
