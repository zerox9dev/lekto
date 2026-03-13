import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import type { HomeworkSection, CardsContent } from "@/types/database";

export function CardsPlayer({ section }: { section: HomeworkSection }) {
  const { t } = useTranslation();
  const content = section.content as CardsContent;
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = content.cards[index];

  return (
    <div className="space-y-4">
      <div onClick={() => setFlipped(!flipped)}
        className="min-h-[140px] md:min-h-[160px] rounded-2xl border border-[#e8e5de] bg-white flex items-center justify-center p-6 md:p-8 cursor-pointer hover:border-[#d0ccc4] select-none transition-colors active:bg-[#f5f3ee]">
        <div className="text-center">
          <p className="text-[11px] md:text-[12px] text-[#888] mb-2 md:mb-3">{flipped ? t("cardBackLabel") : t("cardFrontLabel")} · {t("tapToFlip")}</p>
          <p className="text-[18px] md:text-[22px] font-semibold break-words">{flipped ? card.back : card.front}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <button onClick={() => { setIndex(Math.max(0, index - 1)); setFlipped(false); }} disabled={index === 0}
          className="px-3 md:px-4 py-2 rounded-xl text-[14px] text-[#888] hover:bg-[#f0ede6] disabled:opacity-30 cursor-pointer min-h-[44px]">{t("prevCard")}</button>
        <span className="text-[13px] text-[#888]">{index + 1} / {content.cards.length}</span>
        <button onClick={() => { setIndex(Math.min(content.cards.length - 1, index + 1)); setFlipped(false); }} disabled={index === content.cards.length - 1}
          className="px-3 md:px-4 py-2 rounded-xl text-[14px] text-[#888] hover:bg-[#f0ede6] disabled:opacity-30 cursor-pointer min-h-[44px]">{t("nextCard")}</button>
      </div>
    </div>
  );
}
