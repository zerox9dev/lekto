import { useTranslation } from "@/lib/i18n";
import type { HomeworkSection, FillBlanksContent } from "@/types/database";

export function FillBlanksEditor({ section, onChange }: { section: HomeworkSection; onChange: (s: HomeworkSection) => void }) {
  const { t } = useTranslation();
  const c = section.content as FillBlanksContent;
  const blanksCount = (c.text.match(/___/g) || []).length;

  const syncAnswers = (text: string) => {
    const count = (text.match(/___/g) || []).length;
    let answers = [...c.answers];
    if (count > answers.length) answers = [...answers, ...new Array(count - answers.length).fill("")];
    else if (count < answers.length) answers = answers.slice(0, count);
    onChange({ ...section, content: { text, answers } });
  };

  return (
    <div className="space-y-3">
      <div>
        <textarea value={c.text} onChange={(e) => syncAnswers(e.target.value)}
          placeholder={t("blanksTextPlaceholder")} rows={3}
          className="w-full rounded-lg border border-[#e8e5de] px-3 py-2 text-[13px] outline-none focus:border-[#ccc] resize-none" />
        <p className="text-[11px] text-[#888] mt-1">Используй ___ (три подчёркивания) для пропусков. Найдено: {blanksCount}</p>
      </div>
      {c.answers.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium text-[#888]">{t("correctAnswers")}</p>
          {c.answers.map((a, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[11px] text-[#888] w-5 text-center shrink-0">{i + 1}.</span>
              <input value={a} onChange={(e) => { const na = [...c.answers]; na[i] = e.target.value; onChange({ ...section, content: { ...c, answers: na } }); }}
                placeholder={`${t("answerForBlank")} ${i + 1}`} className="flex-1 h-9 rounded-lg border border-[#e8e5de] px-3 text-[13px] outline-none focus:border-[#ccc] min-w-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
