import { X } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import type { HomeworkSection, OrderingContent } from "@/types/database";

export function OrderingEditor({ section, onChange }: { section: HomeworkSection; onChange: (s: HomeworkSection) => void }) {
  const { t } = useTranslation();
  const c = section.content as OrderingContent;
  return (
    <div className="space-y-2">
      <p className="text-[11px] text-[#888]">{t("wordOrderHint")}</p>
      {c.items.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <span className="text-[11px] text-[#888] w-5 text-center shrink-0">{i + 1}</span>
          <input value={item} onChange={(e) => {
            const ni = [...c.items]; ni[i] = e.target.value;
            onChange({ ...section, content: { items: ni, correct_order: ni.map((_, j) => j) } });
          }} placeholder={`${t("elementN")} ${i + 1}`} className="flex-1 h-9 rounded-lg border border-[#e8e5de] px-3 text-[13px] outline-none focus:border-[#ccc] min-w-0" />
          {c.items.length > 2 && (
            <button onClick={() => {
              const ni = c.items.filter((_, j) => j !== i);
              onChange({ ...section, content: { items: ni, correct_order: ni.map((_, j) => j) } });
            }} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-[#fef2f2] shrink-0 cursor-pointer">
              <X className="h-3 w-3 text-[#ccc] hover:text-red-400" />
            </button>
          )}
        </div>
      ))}
      <button onClick={() => onChange({ ...section, content: { items: [...c.items, ""], correct_order: [...c.items, ""].map((_, i) => i) } })}
        className="text-[11px] text-[#888] hover:text-[#666] cursor-pointer">{t("addElement")}</button>
    </div>
  );
}
