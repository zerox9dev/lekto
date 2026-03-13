import { X } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import type { HomeworkSection, MatchingContent } from "@/types/database";

export function MatchingEditor({ section, onChange }: { section: HomeworkSection; onChange: (s: HomeworkSection) => void }) {
  const { t } = useTranslation();
  const c = section.content as MatchingContent;
  return (
    <div className="space-y-2">
      {c.pairs.map((p, i) => (
        <div key={i} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <input value={p.left} onChange={(e) => { const np = [...c.pairs]; np[i] = { ...np[i], left: e.target.value }; onChange({ ...section, content: { pairs: np } }); }}
            placeholder={t("leftPlaceholder")} className="flex-1 h-9 rounded-lg border border-[#e8e5de] px-3 text-[13px] outline-none focus:border-[#ccc] min-w-0" />
          <span className="text-[#ccc] text-[12px] hidden sm:block">→</span>
          <input value={p.right} onChange={(e) => { const np = [...c.pairs]; np[i] = { ...np[i], right: e.target.value }; onChange({ ...section, content: { pairs: np } }); }}
            placeholder={t("rightPlaceholder")} className="flex-1 h-9 rounded-lg border border-[#e8e5de] px-3 text-[13px] outline-none focus:border-[#ccc] min-w-0" />
          {c.pairs.length > 1 && (
            <button onClick={() => onChange({ ...section, content: { pairs: c.pairs.filter((_, j) => j !== i) } })}
              className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-[#fef2f2] shrink-0 cursor-pointer self-end sm:self-auto">
              <X className="h-3 w-3 text-[#ccc] hover:text-red-400" />
            </button>
          )}
        </div>
      ))}
      <button onClick={() => onChange({ ...section, content: { pairs: [...c.pairs, { left: "", right: "" }] } })}
        className="text-[11px] text-[#888] hover:text-[#666] cursor-pointer">{t("addPair")}</button>
    </div>
  );
}
