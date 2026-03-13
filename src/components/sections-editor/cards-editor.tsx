import { useState } from "react";
import { X, Upload } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import type { HomeworkSection, CardsContent } from "@/types/database";

export function CardsEditor({ section, onChange }: { section: HomeworkSection; onChange: (s: HomeworkSection) => void }) {
  const { t } = useTranslation();
  const c = section.content as CardsContent;
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");

  const parseBulk = () => {
    const lines = bulkText.split("\n").filter((l) => l.trim());
    const newCards = lines.map((line) => {
      const sep = line.includes("\t") ? "\t" : line.includes(" - ") ? " - " : line.includes(";") ? ";" : " — ";
      const parts = line.split(sep).map((s) => s.trim());
      return { front: parts[0] || "", back: parts[1] || "" };
    }).filter((card) => card.front && card.back);
    if (newCards.length > 0) {
      onChange({ ...section, content: { cards: [...c.cards, ...newCards] } });
      setBulkText("");
      setBulkMode(false);
    }
  };

  return (
    <div className="space-y-2">
      {c.cards.map((card, i) => (
        <div key={i} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <input value={card.front} onChange={(e) => { const nc = [...c.cards]; nc[i] = { ...nc[i], front: e.target.value }; onChange({ ...section, content: { cards: nc } }); }}
            placeholder={t("cardFront")} className="flex-1 h-9 rounded-lg border border-[#e8e5de] px-3 text-[13px] outline-none focus:border-[#ccc] min-w-0" />
          <input value={card.back} onChange={(e) => { const nc = [...c.cards]; nc[i] = { ...nc[i], back: e.target.value }; onChange({ ...section, content: { cards: nc } }); }}
            placeholder={t("cardBack")} className="flex-1 h-9 rounded-lg border border-[#e8e5de] px-3 text-[13px] outline-none focus:border-[#ccc] min-w-0" />
          {c.cards.length > 1 && (
            <button onClick={() => onChange({ ...section, content: { cards: c.cards.filter((_, j) => j !== i) } })}
              className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-[#fef2f2] shrink-0 cursor-pointer self-end sm:self-auto">
              <X className="h-3 w-3 text-[#ccc] hover:text-red-400" />
            </button>
          )}
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => onChange({ ...section, content: { cards: [...c.cards, { front: "", back: "" }] } })}
          className="text-[11px] text-[#888] hover:text-[#666] cursor-pointer">{t("addCard")}</button>
        <button onClick={() => setBulkMode(!bulkMode)}
          className="text-[11px] text-[#888] hover:text-[#666] cursor-pointer flex items-center gap-1">
          <Upload className="h-3 w-3" /> {bulkMode ? t("hideBulk") : t("importBulk")}
        </button>
      </div>
      {bulkMode && (
        <div className="rounded-lg border border-dashed border-[#e8e5de] p-3 space-y-2">
          <p className="text-[11px] text-[#888]">{t("bulkHint")}</p>
          <textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)}
            placeholder={"cat - кошка\ndog - собака\nbird - птица"} rows={5}
            className="w-full rounded-lg border border-[#e8e5de] px-3 py-2 text-[12px] outline-none focus:border-[#ccc] resize-none font-mono" />
          <button onClick={parseBulk} disabled={!bulkText.trim()}
            className="px-3 py-1.5 rounded-lg bg-[#1a1a1a] text-white text-[11px] font-medium hover:bg-[#333] disabled:opacity-40 cursor-pointer">
            Добавить {bulkText.split("\n").filter((l) => l.trim()).length} карточек
          </button>
        </div>
      )}
    </div>
  );
}
