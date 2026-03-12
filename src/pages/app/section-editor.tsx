import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Eye, EyeOff, AlertCircle, FileDown, Bookmark, Trash2, Sparkles, Loader } from "lucide-react";
import { useStore } from "@/features/store";
import { useTranslation } from "@/lib/i18n";
import { generateContent } from "@/lib/ai";
import { SectionsListEditor, validateSections, typeLabels } from "@/components/sections-editor";
import { SectionPlayer } from "@/components/section-player";
import type { HomeworkSection } from "@/types/database";

export function SectionEditorPage() {
  const { id: studentId, hwId, lessonId } = useParams<{ id: string; hwId?: string; lessonId?: string }>();
  const navigate = useNavigate();
  const { students, homework, lessons, addHomework, updateHomework, addLesson, updateLesson, templates, addTemplate, deleteTemplate } = useStore();

  const { t } = useTranslation();
  const student = students.find((s) => s.id === studentId);
  const isHomework = !!hwId;
  const isNewHomework = hwId === "new";
  const isNewLesson = lessonId === "new";
  const isLesson = !!lessonId;

  // Parse lessonId from query for new homework
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const hwLessonId = searchParams.get("lessonId") || "";

  // Load existing data
  const existingHw = isHomework && !isNewHomework ? homework.find((h) => h.id === hwId) : null;
  const existingLesson = isLesson && !isNewLesson ? lessons.find((l) => l.id === lessonId) : null;

  const [title, setTitle] = useState("");
  const [sections, setSections] = useState<HomeworkSection[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAi, setShowAi] = useState(false);

  // Load data on mount
  useEffect(() => {
    if (existingHw) {
      setTitle(existingHw.title);
      setSections(existingHw.sections || []);
    } else if (existingLesson) {
      setTitle(existingLesson.title);
      setSections(existingLesson.sections || []);
    }
  }, [existingHw?.id, existingLesson?.id]);

  const validationErrors = useMemo(() => validateSections(sections), [sections]);

  const pageTitle = isHomework ? t("hwConstructor") : t("lessonConstructor");

  const handleSave = () => {
    if (!title.trim()) return;
    if (sections.length > 0 && validationErrors.length > 0) {
      setShowErrors(true);
      return;
    }

    if (isHomework) {
      if (isNewHomework) {
        addHomework({
          lesson_id: hwLessonId,
          student_id: studentId!,
          tutor_id: student!.tutor_id,
          title: title.trim(),
          sections,
          completed: false,
          student_answers: null,
          scores: null,
        });
      } else {
        updateHomework(hwId!, { title: title.trim(), sections });
      }
    } else if (isLesson) {
      if (isNewLesson) {
        // For new lesson, we only handle sections here. The lesson should already exist.
        // Navigate back
      } else {
        updateLesson(lessonId!, { sections: sections.length > 0 ? sections : undefined });
      }
    }

    setSaved(true);
    setTimeout(() => {
      navigate(`/app/students/${studentId}`);
    }, 400);
  };

  const handleBack = () => {
    navigate(`/app/students/${studentId}`);
  };

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f3ee]">
        <div className="text-center">
          <p className="text-[14px] text-[#888]">{t("studentNotFound")}</p>
          <button onClick={() => navigate("/app")} className="text-[13px] text-[#888] underline mt-2 cursor-pointer">{t("back")}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen flex flex-col bg-white">
      {/* Top bar */}
      <header className="h-14 border-b border-[#e8e5de] bg-white flex items-center px-4 md:px-6 gap-3 shrink-0 z-10">
        <button onClick={handleBack} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#f0ede6] transition-colors cursor-pointer shrink-0">
          <ArrowLeft className="h-4 w-4 text-[#888]" />
        </button>
        <h1 className="text-[14px] md:text-[15px] font-semibold truncate">{pageTitle}</h1>
        <span className="text-[12px] text-[#888] truncate hidden sm:block">· {student.name}</span>
        <div className="flex-1" />

        {/* Mobile preview toggle */}
        <button
          onClick={() => setMobilePreview(!mobilePreview)}
          className={`md:hidden h-8 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-medium cursor-pointer transition-colors ${
            mobilePreview ? "bg-[#1a1a1a] text-white" : "hover:bg-[#f0ede6] text-[#888]"
          }`}
        >
          {mobilePreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {mobilePreview ? t("editor") : t("preview")}
        </button>

        {showErrors && validationErrors.length > 0 && (
          <span className="text-[12px] text-red-500 flex items-center gap-1 shrink-0 hidden sm:flex">
            <AlertCircle className="h-3.5 w-3.5" /> {validationErrors.length} {t("errors")}
          </span>
        )}

        <button
          onClick={handleSave}
          disabled={!title.trim() || saved}
          className="h-8 px-4 rounded-lg bg-[#1a1a1a] text-white text-[13px] font-medium hover:bg-[#333] disabled:opacity-40 cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors"
        >
          <Save className="h-3.5 w-3.5" />
          {saved ? t("saved") : t("save")}
        </button>
      </header>

      {/* Split panels */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left panel — Constructor */}
        <div className={`${mobilePreview ? "hidden" : "flex"} md:flex flex-col w-full md:w-[55%] border-r border-[#e8e5de] overflow-hidden`}>
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 space-y-4">
            {/* Title */}
            <div>
              <label className="text-[12px] font-medium text-[#888] mb-1 block">{t("titleRequired")}</label>
              <input
                value={title}
                onChange={(e) => { setTitle(e.target.value); setSaved(false); }}
                placeholder={isHomework ? t("hwTitlePlaceholder") : t("lessonTitlePlaceholder")}
                className="w-full h-10 rounded-xl border border-[#e8e5de] px-3 text-[14px] outline-none focus:border-[#ccc]"
                autoFocus
              />
            </div>

            {/* Template picker (homework only, new only) */}
            {isHomework && isNewHomework && templates.length > 0 && (
              <div>
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-amber-600 hover:text-amber-700 cursor-pointer"
                >
                  <FileDown className="h-3.5 w-3.5" /> {showTemplates ? t("hideTemplates") : `${t("fromTemplate")} (${templates.length})`}
                </button>
                {showTemplates && (
                  <div className="mt-2 space-y-1.5">
                    {templates.map((t) => (
                      <div key={t.id} className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 group/tpl">
                        <button
                          onClick={() => {
                            setTitle(t.title);
                            setSections(t.sections.map((s) => ({ ...s, id: crypto.randomUUID() })));
                            setShowTemplates(false);
                            setSaved(false);
                          }}
                          className="flex-1 text-left cursor-pointer min-w-0"
                        >
                          <p className="text-[13px] font-medium text-[#666] truncate">{t.title}</p>
                          <p className="text-[11px] text-[#888] truncate">{t.sections.length} секций · {t.sections.map((s) => typeLabels[s.type]).join(", ")}</p>
                        </button>
                        <button
                          onClick={() => deleteTemplate(t.id)}
                          className="h-6 w-6 rounded flex items-center justify-center md:opacity-0 md:group-hover/tpl:opacity-100 hover:bg-red-100 cursor-pointer shrink-0"
                        >
                          <Trash2 className="h-3 w-3 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* AI Generation */}
            <div>
              <button
                onClick={() => setShowAi(!showAi)}
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#888] hover:text-[#666] cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" /> {showAi ? t("hideAi") : t("generateWithAi")}
              </button>
              {showAi && (
                <div className="mt-2 border border-dashed border-[#e8e5de] rounded-xl p-3 space-y-2">
                  <div className="flex gap-2">
                    <select id="ai-editor-lang" defaultValue="polish" className="h-9 rounded-lg border border-[#e8e5de] px-2 text-[13px] flex-1">
                      <option value="polish">Польский</option>
                      <option value="english">Английский</option>
                      <option value="german">Немецкий</option>
                      <option value="french">Французский</option>
                      <option value="spanish">Испанский</option>
                      <option value="ukrainian">Украинский</option>
                      <option value="czech">Чешский</option>
                    </select>
                    <select id="ai-editor-level" defaultValue="A1" className="h-9 rounded-lg border border-[#e8e5de] px-2 text-[13px] w-20">
                      <option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option>
                    </select>
                  </div>
                  <button
                    disabled={!title.trim() || aiLoading}
                    onClick={async () => {
                      setAiLoading(true);
                      try {
                        const lang = (document.getElementById("ai-editor-lang") as HTMLSelectElement)?.value || "polish";
                        const level = (document.getElementById("ai-editor-level") as HTMLSelectElement)?.value || "A1";
                        // For homework — send lesson content for context
                        let lessonContent: string | undefined;
                        if (isHomework && hwLessonId) {
                          const parentLesson = lessons.find(l => l.id === hwLessonId);
                          if (parentLesson) {
                            lessonContent = [parentLesson.title, parentLesson.notes || "",
                              ...(parentLesson.sections || []).map(s => s.title + ": " + JSON.stringify(s.content).slice(0, 200))
                            ].join("\n");
                          }
                        }
                        const result = await generateContent({
                          type: isHomework ? "homework" : "lesson",
                          topic: title.trim(),
                          language: lang, level, lessonContent,
                        });
                        if (result.sections?.length) {
                          setSections(prev => [...prev, ...result.sections]);
                          setSaved(false);
                        }
                        setShowAi(false);
                      } catch (e: any) {
                        alert("Ошибка AI: " + (e.message || "попробуйте позже"));
                      }
                      setAiLoading(false);
                    }}
                    className="w-full h-9 rounded-lg bg-[#f0ede6] text-[13px] font-medium text-[#1a1a1a] hover:bg-[#e8e5de] disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {aiLoading ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    {aiLoading ? t("generating") : isHomework ? t("generateHomework") : t("generateSections")}
                  </button>
                  <p className="text-[11px] text-[#888]">{isHomework ? t("aiHintHw") : t("aiHintLesson")}</p>
                </div>
              )}
            </div>

            {/* Sections editor */}
            <SectionsListEditor
              sections={sections}
              onChange={(s) => { setSections(s); setSaved(false); }}
              showErrors={showErrors}
            />

            {/* Save as template */}
            {sections.length > 0 && (
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => addTemplate(title || "Шаблон", sections)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-amber-600 hover:bg-amber-50 cursor-pointer"
                >
                  <Bookmark className="h-3 w-3" /> {t("saveAsTemplate")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right panel — Preview */}
        <div className={`${mobilePreview ? "flex" : "hidden"} md:flex flex-col w-full md:w-[45%] bg-[#f5f3ee] overflow-hidden`}>
          <div className="px-4 md:px-5 py-3 border-b border-[#e8e5de] bg-[#f5f3ee] shrink-0">
            <p className="text-[12px] font-semibold text-[#888] uppercase tracking-wider">{t("preview")}</p>
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
