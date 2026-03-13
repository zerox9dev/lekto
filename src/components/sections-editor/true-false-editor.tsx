import { useTranslation } from "@/lib/i18n";
import type { HomeworkSection, TrueFalseContent, TrueFalseQuestion } from "@/types/database";

export function TrueFalseEditor({ section, onChange }: { section: HomeworkSection; onChange: (s: HomeworkSection) => void }) {
  const { t } = useTranslation();
  const c = section.content as TrueFalseContent;
  const setQ = (nq: TrueFalseQuestion[]) => onChange({ ...section, content: { questions: nq } });

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-[#888]">Утверждения — выбери правильный ответ для каждого</p>
      {c.questions.map((q, qi) => (
        <div key={qi} className="rounded-lg border border-[#e8e5de] p-2.5 md:p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#888]">{t("statementN")} {qi + 1}</span>
            {c.questions.length > 1 && (
              <button onClick={() => setQ(c.questions.filter((_, i) => i !== qi))} className="text-[11px] text-red-400 hover:text-red-500 cursor-pointer">{t("delete")}</button>
            )}
          </div>
          <input value={q.statement} onChange={(e) => { const nq = [...c.questions]; nq[qi] = { ...nq[qi], statement: e.target.value }; setQ(nq); }}
            placeholder={t("statementPlaceholder")} className="w-full h-9 rounded-lg border border-[#e8e5de] px-3 text-[13px] outline-none focus:border-[#ccc]" />
          <div className="flex gap-2">
            <button onClick={() => { const nq = [...c.questions]; nq[qi] = { ...nq[qi], correct: true }; setQ(nq); }}
              className={`flex-1 h-9 rounded-lg text-[13px] font-medium border cursor-pointer transition-colors ${q.correct ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-[#e8e5de] text-[#888] hover:border-[#d0ccc4]"}`}>
              {t("trueLabel")}
            </button>
            <button onClick={() => { const nq = [...c.questions]; nq[qi] = { ...nq[qi], correct: false }; setQ(nq); }}
              className={`flex-1 h-9 rounded-lg text-[13px] font-medium border cursor-pointer transition-colors ${!q.correct ? "border-red-300 bg-red-50 text-red-700" : "border-[#e8e5de] text-[#888] hover:border-[#d0ccc4]"}`}>
              {t("falseLabel")}
            </button>
          </div>
          <input value={q.explanation || ""} onChange={(e) => { const nq = [...c.questions]; nq[qi] = { ...nq[qi], explanation: e.target.value }; setQ(nq); }}
            placeholder={t("explanationOptional")} className="w-full h-8 rounded-lg border border-dashed border-[#e8e5de] px-3 text-[12px] text-[#888] outline-none focus:border-[#ccc]" />
        </div>
      ))}
      <button onClick={() => setQ([...c.questions, { statement: "", correct: true }])}
        className="text-[12px] text-[#888] font-medium hover:text-[#666] cursor-pointer">{t("addStatement")}</button>
    </div>
  );
}
