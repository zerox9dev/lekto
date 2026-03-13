import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import type { HomeworkSection, OpenAnswerContent } from "@/types/database";

export function OpenAnswerPlayer({ section, onSubmitAnswer }: { section: HomeworkSection; onSubmitAnswer: (sectionId: string, answer: string) => void }) {
  const { t } = useTranslation();
  const c = section.content as OpenAnswerContent;
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    onSubmitAnswer(section.id, answer);
  };

  return (
    <div className="space-y-3">
      <p className="text-[14px] md:text-[15px] text-[#666] whitespace-pre-wrap break-words">{c.prompt}</p>
      <textarea value={answer} onChange={(e) => !submitted && setAnswer(e.target.value)}
        placeholder={c.placeholder || t("writeAnswer")} rows={4} disabled={submitted}
        className="w-full rounded-xl border border-[#e8e5de] px-3 md:px-4 py-2.5 md:py-3 text-[14px] outline-none focus:border-[#ccc] resize-y min-h-[100px] disabled:bg-[#f5f3ee]" />
      {c.min_length && !submitted && (
        <p className="text-[12px] text-[#888]">{t("minChars")} {c.min_length} {t("chars")} ({answer.length}/{c.min_length})</p>
      )}
      {!submitted && (
        <button onClick={handleSubmit} disabled={!answer.trim() || (c.min_length ? answer.length < c.min_length : false)}
          className="w-full sm:w-auto px-5 py-3 md:py-2.5 rounded-full bg-[#1a1a1a] text-white text-[14px] font-medium hover:bg-[#333] disabled:opacity-40 cursor-pointer">{t("submitAnswer")}</button>
      )}
      {submitted && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
          <p className="text-[14px] text-emerald-700 font-medium">{t("answerSent")}</p>
        </div>
      )}
    </div>
  );
}
