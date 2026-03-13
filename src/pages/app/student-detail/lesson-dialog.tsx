import { useState } from "react";
import { X, Sparkles, Loader } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { generateContent } from "@/lib/ai";
import * as Dialog from "@radix-ui/react-dialog";
import type { Student } from "@/types/database";

export function LessonDialog({ open, onOpenChange, editLessonId, student, onSave, onAiCreate }: {
  open: boolean; onOpenChange: (open: boolean) => void;
  editLessonId: string | null; student: Student;
  onSave: (title: string, date: string, notes: string) => void;
  onAiCreate: (title: string, date: string, notes: string, lang: string, level: string) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const resetFields = (lt?: string, ld?: string, ln?: string) => {
    setTitle(lt || ""); setDate(ld || new Date().toISOString().slice(0, 10)); setNotes(ln || "");
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:max-w-lg h-full md:h-auto md:max-h-[90vh] overflow-y-auto overflow-x-hidden md:rounded-2xl bg-white z-50">
          <div className="sticky top-0 bg-white border-b border-[#e8e5de] px-4 md:px-6 py-3 md:py-4 flex items-center justify-between z-10">
            <Dialog.Title className="text-base md:text-lg font-bold truncate">{editLessonId ? t("editLesson") : t("newLesson")}</Dialog.Title>
            <Dialog.Close asChild><button className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#f0ede6] cursor-pointer"><X className="h-4 w-4 text-[#888]" /></button></Dialog.Close>
          </div>
          <div className="px-4 md:px-6 py-4 space-y-4">
            <div><label className="text-[12px] font-medium text-[#888] mb-1 block">{t("titleRequired")}</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("titlePlaceholder")} className="w-full h-10 rounded-xl border border-[#e8e5de] px-3 text-[14px] outline-none focus:border-[#ccc]" autoFocus /></div>
            <div><label className="text-[12px] font-medium text-[#888] mb-1 block">{t("dateLabel")}</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full h-10 rounded-xl border border-[#e8e5de] px-3 text-[14px] outline-none focus:border-[#ccc]" /></div>
            <div><label className="text-[12px] font-medium text-[#888] mb-1 block">{t("notesLabel")}</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("notesPlaceholder")} rows={3}
                className="w-full rounded-xl border border-[#e8e5de] px-3 py-2.5 text-[14px] outline-none focus:border-[#ccc] resize-y min-h-[80px]" /></div>
            {!editLessonId && (
              <div className="border border-dashed border-[#e8e5de] rounded-xl p-3 space-y-2">
                <p className="text-[12px] font-medium text-[#888]">{t("aiGeneration")}</p>
                <div className="flex gap-2">
                  <select id="ai-lang" defaultValue="polish" className="h-9 rounded-lg border border-[#e8e5de] px-2 text-[13px] flex-1">
                    <option value="polish">Польский</option><option value="english">Английский</option><option value="german">Немецкий</option>
                    <option value="french">Французский</option><option value="spanish">Испанский</option><option value="ukrainian">Украинский</option><option value="czech">Чешский</option>
                  </select>
                  <select id="ai-level" defaultValue="A1" className="h-9 rounded-lg border border-[#e8e5de] px-2 text-[13px] w-20">
                    <option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option>
                  </select>
                </div>
                <button type="button" disabled={!title.trim() || aiLoading}
                  onClick={async () => {
                    setAiLoading(true); setAiError(null);
                    try {
                      const lang = (document.getElementById("ai-lang") as HTMLSelectElement)?.value || "polish";
                      const level = (document.getElementById("ai-level") as HTMLSelectElement)?.value || "A1";
                      await onAiCreate(title.trim(), date, notes.trim(), lang, level);
                      onOpenChange(false);
                    } catch (e: any) { setAiError(e.message || "Ошибка AI"); }
                    setAiLoading(false);
                  }}
                  className="w-full h-9 rounded-lg bg-[#f0ede6] text-[13px] font-medium text-[#1a1a1a] hover:bg-[#e8e5de] disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5">
                  {aiLoading ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  {aiLoading ? t("generating") : t("generateWithAi")}
                </button>
                {aiError && <p className="text-[12px] text-red-500">{aiError}</p>}
              </div>
            )}
          </div>
          <div className="sticky bottom-0 bg-white border-t border-[#e8e5de] px-4 md:px-6 py-3 md:py-4 flex justify-end gap-2">
            <Dialog.Close asChild><button className="px-4 py-2.5 sm:py-2 rounded-full text-[13px] font-medium text-[#888] hover:bg-[#f0ede6] cursor-pointer">{t("cancel")}</button></Dialog.Close>
            <button onClick={() => { if (title.trim()) { onSave(title.trim(), date, notes.trim()); onOpenChange(false); } }} disabled={!title.trim()}
              className="px-5 py-2.5 sm:py-2 rounded-full bg-[#1a1a1a] text-white text-[13px] font-medium hover:bg-[#333] disabled:opacity-40 cursor-pointer">
              {editLessonId ? t("save") : t("create")}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
