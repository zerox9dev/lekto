import { useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import type { HomeworkSection, OrderingContent } from "@/types/database";

export function WordOrderPlayer({ section, onScore }: { section: HomeworkSection; onScore: (score: number) => void }) {
  const { t } = useTranslation();
  const content = section.content as OrderingContent;
  const [submitted, setSubmitted] = useState(false);
  const [slots, setSlots] = useState<(number | null)[]>(() => new Array(content.items.length).fill(null));

  const shuffledWordIds = useMemo(() => {
    const indices = content.items.map((_, index) => index);
    for (let i = indices.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }, [content.items]);

  const usedWordIds = new Set(slots.filter((value): value is number => value !== null));
  const correctSequence = content.correct_order.map((index) => content.items[index]);

  const placeWord = (wordId: number) => {
    if (submitted || usedWordIds.has(wordId)) return;
    const emptyIndex = slots.findIndex((slot) => slot === null);
    if (emptyIndex === -1) return;
    const next = [...slots];
    next[emptyIndex] = wordId;
    setSlots(next);
  };

  const clearSlot = (slotIndex: number) => {
    if (submitted || slots[slotIndex] === null) return;
    const next = [...slots];
    next[slotIndex] = null;
    setSlots(next);
  };

  const handleCheck = () => {
    const correct = slots.reduce<number>((acc, wordId, index) => {
      if (wordId === null) return acc;
      return acc + (wordId === content.correct_order[index] ? 1 : 0);
    }, 0);
    setSubmitted(true);
    onScore(Math.round((correct / content.items.length) * 100));
  };

  return (
    <div className="space-y-4">
      <p className="text-[12px] text-[#888]">{t("wordOrderPlayerHint")}</p>

      <div className="rounded-2xl bg-[#f7f7f4] border border-[#ece7dd] p-3 space-y-3">
        <div className="flex flex-wrap gap-2">
          {shuffledWordIds.map((wordId) => {
            const disabled = usedWordIds.has(wordId);
            return (
              <button
                key={wordId}
                onClick={() => placeWord(wordId)}
                disabled={disabled || submitted}
                className={`px-3 py-1.5 rounded-lg border text-[14px] font-medium transition-colors cursor-pointer ${
                  disabled || submitted
                    ? "border-[#e8e5de] bg-[#efeee9] text-[#c0bbb2] cursor-default"
                    : "border-[#d6d0c5] bg-white text-[#666] hover:bg-[#f0ede6]"
                }`}
              >
                {content.items[wordId]}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2 pt-1 border-t border-dashed border-[#ddd6ca]">
          {slots.map((wordId, index) => {
            const isCorrect = submitted && wordId === content.correct_order[index];
            const isWrong = submitted && wordId !== null && wordId !== content.correct_order[index];
            return (
              <button
                key={index}
                onClick={() => clearSlot(index)}
                disabled={submitted || wordId === null}
                className={`min-w-[96px] h-11 px-3 rounded-lg border text-[14px] font-medium transition-colors ${
                  isCorrect
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : isWrong
                    ? "border-red-300 bg-red-50 text-red-700"
                    : wordId === null
                    ? "border-[#cfc8bb] bg-white text-[#bbb]"
                    : "border-[#87d8ff] bg-[#dff4ff] text-[#36aee3]"
                }`}
              >
                {wordId === null ? "" : content.items[wordId]}
              </button>
            );
          })}
        </div>

        {!submitted && (
          <button
            onClick={handleCheck}
            disabled={slots.some((slot) => slot === null)}
            className="w-full sm:w-auto px-5 py-3 md:py-2.5 rounded-full bg-[#1a1a1a] text-white text-[14px] font-medium hover:bg-[#333] disabled:opacity-40 cursor-pointer"
          >
            {t("check")}
          </button>
        )}
      </div>

      {submitted && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
          <p className="text-[12px] font-medium text-emerald-800 mb-2">{t("correctOrderLabel")}</p>
          <div className="flex flex-wrap gap-2">
            {correctSequence.map((word, index) => (
              <span key={`${word}-${index}`} className="px-2.5 py-1 rounded-lg bg-emerald-200/70 text-emerald-900 text-[13px] font-medium">
                {word}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
