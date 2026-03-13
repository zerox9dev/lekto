import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Eye, EyeOff, AlertCircle, Bookmark, GraduationCap, Loader } from "lucide-react";
import { useStore } from "@/features/store";
import { useTranslation } from "@/lib/i18n";
import { SectionsListEditor, validateSections } from "@/components/sections-editor";
import { SectionPlayer } from "@/components/section-player";
import type { HomeworkSection } from "@/types/database";
import { AiPanel } from "./ai-panel";
import { TemplatePicker } from "./template-picker";

export function SectionEditorPage() {
  const { id: studentId, hwId, lessonId } = useParams<{ id: string; hwId?: string; lessonId?: string }>();
  const navigate = useNavigate();
  const { students, homework, lessons, addHomework, updateHomework, updateLesson, templates, addTemplate, deleteTemplate } = useStore();

  const { t } = useTranslation();
  const student = students.find((s) => s.id === studentId);
  const isHomework = !!hwId;
  const isNewHomework = hwId === "new";
  const isNewLesson = lessonId === "new";
  const isLesson = !!lessonId;

  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const hwLessonId = searchParams.get("lessonId") || "";

  const existingHw = isHomework && !isNewHomework ? homework.find((h) => h.id === hwId) : null;
  const existingLesson = isLesson && !isNewLesson ? lessons.find((l) => l.id === lessonId) : null;

  const [title, setTitle] = useState("");
  const [sections, setSections] = useState<HomeworkSection[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [mobilePreview, setMobilePreview] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const autosaveTimer = useRef<number | null>(null);

  useEffect(() => {
    if (existingHw) { setTitle(existingHw.title); setSections(existingHw.sections || []); }
    else if (existingLesson) { setTitle(existingLesson.title); setSections(existingLesson.sections || []); }
    setInitialized(true);
  }, [existingHw?.id, existingLesson?.id]);

  const validationErrors = useMemo(() => validateSections(sections), [sections]);
  const pageTitle = isHomework ? t("hwConstructor") : t("lessonConstructor");
  const canAutosave = (isHomework && !isNewHomework && !!existingHw) || (isLesson && !isNewLesson && !!existingLesson);

  const persistChanges = async (shouldNavigate = false) => {
    if (!title.trim()) return;
    if (sections.length > 0 && validationErrors.length > 0) {
      if (shouldNavigate) setShowErrors(true);
      return;
    }
    if (isHomework) {
      if (isNewHomework) {
        await addHomework({ lesson_id: hwLessonId, student_id: studentId!, tutor_id: student!.tutor_id,
          title: title.trim(), sections, completed: false, student_answers: null, scores: null });
      } else {
        await updateHomework(hwId!, { title: title.trim(), sections });
      }
    } else if (isLesson && !isNewLesson) {
      await updateLesson(lessonId!, { sections: sections.length > 0 ? sections : undefined });
    }
    setSaveState("saved");
    if (shouldNavigate) setTimeout(() => navigate(`/app/students/${studentId}`), 250);
  };

  const handleSave = async () => {
    try {
      setSaveState("saving");
      await persistChanges(true);
    } catch {
      setSaveState("error");
    }
  };

  useEffect(() => {
    if (!initialized || !canAutosave) return;
    if (!title.trim()) {
      setSaveState("idle");
      return;
    }
    if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current);
    setSaveState("saving");
    autosaveTimer.current = window.setTimeout(async () => {
      try {
        await persistChanges(false);
      } catch {
        setSaveState("error");
      }
    }, 30000);
    return () => {
      if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current);
    };
  }, [canAutosave, initialized, title, sections]);

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f3ee]">
        <p className="text-[14px] text-[#888]">{t("studentNotFound")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen flex flex-col bg-white">
      <header className="h-14 border-b border-[#e8e5de] bg-white flex items-center px-4 md:px-6 gap-3 shrink-0 z-10">
        <button onClick={() => navigate(`/app/students/${studentId}`)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#f0ede6] transition-colors cursor-pointer shrink-0">
          <ArrowLeft className="h-4 w-4 text-[#888]" />
        </button>
        <h1 className="text-[14px] md:text-[15px] font-semibold truncate">{pageTitle}</h1>
        <span className="text-[12px] text-[#888] truncate hidden sm:block">· {student.name}</span>
        <div className="flex-1" />
        <button onClick={() => setMobilePreview(!mobilePreview)}
          className={`md:hidden h-8 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-medium cursor-pointer transition-colors ${mobilePreview ? "bg-[#1a1a1a] text-white" : "hover:bg-[#f0ede6] text-[#888]"}`}>
          {mobilePreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {mobilePreview ? t("editor") : t("preview")}
        </button>
        {showErrors && validationErrors.length > 0 && (
          <span className="text-[12px] text-red-500 flex items-center gap-1 shrink-0 hidden sm:flex">
            <AlertCircle className="h-3.5 w-3.5" /> {validationErrors.length} {t("errors")}
          </span>
        )}
        {canAutosave && (
          <span className={`text-[12px] shrink-0 hidden sm:flex items-center gap-1 ${
            saveState === "error" ? "text-red-500" : "text-[#888]"
          }`}>
            {saveState === "saving" && <Loader className="h-3.5 w-3.5 animate-spin" />}
            {saveState === "saved" && t("saved")}
            {saveState === "saving" && t("savingLabel")}
            {saveState === "error" && t("saveError")}
            {saveState === "idle" && t("autosaveLabel")}
          </span>
        )}
        <button onClick={handleSave} disabled={!title.trim() || saveState === "saving"}
          className="h-8 px-4 rounded-lg bg-[#1a1a1a] text-white text-[13px] font-medium hover:bg-[#333] disabled:opacity-40 cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors">
          {saveState === "saving" ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {isNewHomework ? t("save") : t("saveAndClose")}
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className={`${mobilePreview ? "hidden" : "flex"} md:flex flex-col w-full md:w-[55%] border-r border-[#e8e5de] overflow-hidden`}>
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 space-y-4">
            <div>
              <label className="text-[12px] font-medium text-[#888] mb-1 block">{t("titleRequired")}</label>
              <input value={title} onChange={(e) => { setTitle(e.target.value); setSaveState("idle"); }}
                placeholder={isHomework ? t("hwTitlePlaceholder") : t("lessonTitlePlaceholder")}
                className="w-full h-10 rounded-xl border border-[#e8e5de] px-3 text-[14px] outline-none focus:border-[#ccc]" autoFocus />
            </div>
            {isHomework && isNewHomework && (
              <TemplatePicker templates={templates}
                onSelect={(tpl) => { setTitle(tpl.title); setSections(tpl.sections.map((s) => ({ ...s, id: crypto.randomUUID() }))); setSaveState("idle"); }}
                onDelete={deleteTemplate} />
            )}
            <AiPanel title={title} isHomework={isHomework} hwLessonId={hwLessonId} lessons={lessons}
              onGenerated={(s) => { setSections((prev) => [...prev, ...s]); setSaveState("idle"); }} />
            <SectionsListEditor sections={sections} onChange={(s) => { setSections(s); setSaveState("idle"); }} showErrors={showErrors} />
            {sections.length > 0 && (
              <div className="flex items-center gap-2 pt-2">
                <button onClick={() => addTemplate(title || "Шаблон", sections)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-amber-600 hover:bg-amber-50 cursor-pointer">
                  <Bookmark className="h-3 w-3" /> {t("saveAsTemplate")}
                </button>
              </div>
            )}
          </div>
        </div>
        <div className={`${mobilePreview ? "flex" : "hidden"} md:flex flex-col w-full md:w-[45%] bg-[#f5f3ee] overflow-hidden`}>
          <div className="px-4 md:px-5 py-3 border-b border-[#e8e5de] bg-[#f5f3ee] shrink-0 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold text-[#888] uppercase tracking-wider">{t("studentPreviewLabel")}</p>
              <div className="h-9 w-9 rounded-xl bg-white border border-[#e8e5de] flex items-center justify-center shrink-0">
                <GraduationCap className="h-4 w-4 text-[#666]" />
              </div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
              <p className="text-[12px] font-medium text-amber-900">{t("studentPreviewDesc")}</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6">
            {sections.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#e8e5de] bg-white p-8 text-center">
                <p className="text-[14px] text-[#888]">{t("addSectionsHint")}</p>
              </div>
            ) : (
              <div className="rounded-2xl bg-white border border-[#e8e5de] p-4 md:p-6 space-y-4 md:space-y-6">
                <h3 className="text-[16px] md:text-[17px] font-bold">{title || t("noTitle")}</h3>
                {sections.map((sec, i) => (
                  <div key={sec.id}>
                    {i > 0 && <div className="border-t border-[#e8e5de] mb-4 md:mb-6" />}
                    <SectionPlayer section={sec} onScore={() => {}} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
