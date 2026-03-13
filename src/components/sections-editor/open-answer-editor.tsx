import { useTranslation } from "@/lib/i18n";
import type { HomeworkSection, OpenAnswerContent } from "@/types/database";

export function OpenAnswerEditor({ section, onChange }: { section: HomeworkSection; onChange: (s: HomeworkSection) => void }) {
  const { t } = useTranslation();
  const c = section.content as OpenAnswerContent;
  return (
    <div className="space-y-3">
      <div>
        <textarea value={c.prompt} onChange={(e) => onChange({ ...section, content: { ...c, prompt: e.target.value } })}
          placeholder={t("openAnswerPlaceholder")} rows={3}
          className="w-full rounded-lg border border-[#e8e5de] px-3 py-2 text-[13px] outline-none focus:border-[#ccc] resize-none" />
      </div>
      <input value={c.placeholder || ""} onChange={(e) => onChange({ ...section, content: { ...c, placeholder: e.target.value } })}
        placeholder={t("openAnswerHintPlaceholder")} className="w-full h-8 rounded-lg border border-dashed border-[#e8e5de] px-3 text-[12px] text-[#888] outline-none focus:border-[#ccc]" />
      <p className="text-[11px] text-[#888]">{t("openAnswerNote")}</p>
    </div>
  );
}
