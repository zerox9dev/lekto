import { useTranslation } from "@/lib/i18n";
import type { HomeworkSection } from "@/types/database";

export function TextEditor({ section, onChange }: { section: HomeworkSection; onChange: (s: HomeworkSection) => void }) {
  const { t } = useTranslation();
  const c = section.content as { text: string };
  return (
    <div>
      <textarea value={c.text} onChange={(e) => onChange({ ...section, content: { text: e.target.value } })}
        placeholder={t("textPlaceholder")} rows={4}
        className="w-full rounded-lg border border-[#e8e5de] px-3 py-2 text-[13px] outline-none focus:border-[#ccc] resize-y min-h-[80px]" />
      <p className="text-[11px] text-[#888] mt-1">{t("textNote")}</p>
    </div>
  );
}
