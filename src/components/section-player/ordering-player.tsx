import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import type { HomeworkSection, OrderingContent } from "@/types/database";

export function OrderingPlayer({ section, onScore }: { section: HomeworkSection; onScore: (score: number) => void }) {
  const { t } = useTranslation();
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
      {!submitted && <button onClick={handleSubmit} className="w-full sm:w-auto px-5 py-3 md:py-2.5 rounded-full bg-[#1a1a1a] text-white text-[14px] font-medium hover:bg-[#333] cursor-pointer">{t("check")}</button>}
    </div>
  );
}
