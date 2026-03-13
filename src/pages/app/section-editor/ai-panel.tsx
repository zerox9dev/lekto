import { useState } from "react";
import { Sparkles, Loader } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { generateContent } from "@/lib/ai";
import type { HomeworkSection } from "@/types/database";

export function AiPanel({ title, isHomework, hwLessonId, lessons, onGenerated }: {
  title: string; isHomework: boolean; hwLessonId: string;
  lessons: { id: string; title: string; notes?: string | null; sections?: HomeworkSection[] }[];
  onGenerated: (sections: HomeworkSection[]) => void;
}) {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <button onClick={() => setShow(!show)}
        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#888] hover:text-[#666] cursor-pointer">
        <Sparkles className="h-3.5 w-3.5" /> {show ? t("hideAi") : t("generateWithAi")}
      </button>
      {show && (
        <div className="mt-2 border border-dashed border-[#e8e5de] rounded-xl p-3 space-y-2">
          <div className="flex gap-2">
            <select id="ai-editor-lang" defaultValue="polish" className="h-9 rounded-lg border border-[#e8e5de] px-2 text-[13px] flex-1">
              <option value="polish">Польский</option><option value="english">Английский</option><option value="german">Немецкий</option>
              <option value="french">Французский</option><option value="spanish">Испанский</option><option value="ukrainian">Украинский</option><option value="czech">Чешский</option>
            </select>
            <select id="ai-editor-level" defaultValue="A1" className="h-9 rounded-lg border border-[#e8e5de] px-2 text-[13px] w-20">
              <option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option>
            </select>
          </div>
          <button disabled={!title.trim() || loading}
            onClick={async () => {
              setLoading(true);
              try {
                const lang = (document.getElementById("ai-editor-lang") as HTMLSelectElement)?.value || "polish";
                const level = (document.getElementById("ai-editor-level") as HTMLSelectElement)?.value || "A1";
                let lessonContent: string | undefined;
                if (isHomework && hwLessonId) {
                  const parentLesson = lessons.find(l => l.id === hwLessonId);
                  if (parentLesson) {
                    lessonContent = [parentLesson.title, parentLesson.notes || "",
                      ...(parentLesson.sections || []).map(s => s.title + ": " + JSON.stringify(s.content).slice(0, 200))
                    ].join("\n");
                  }
                }
                const result = await generateContent({ type: isHomework ? "homework" : "lesson", topic: title.trim(), language: lang, level, lessonContent });
                if (result.sections?.length) onGenerated(result.sections);
                setShow(false);
              } catch (e: any) { alert("Ошибка AI: " + (e.message || "попробуйте позже")); }
              setLoading(false);
            }}
            className="w-full h-9 rounded-lg bg-[#f0ede6] text-[13px] font-medium text-[#1a1a1a] hover:bg-[#e8e5de] disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5">
            {loading ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {loading ? t("generating") : isHomework ? t("generateHomework") : t("generateSections")}
          </button>
          <p className="text-[11px] text-[#888]">{isHomework ? t("aiHintHw") : t("aiHintLesson")}</p>
        </div>
      )}
    </div>
  );
}
