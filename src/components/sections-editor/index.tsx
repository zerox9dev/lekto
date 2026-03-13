import { useEffect, useMemo, useState } from "react";
import {
  Trash2,
  CopyPlus,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ListChecks,
  ScanText,
  GitCompareArrows,
  ArrowUpWideNarrow,
  PanelsTopLeft,
  FileText,
  CircleHelp,
  MessageSquareQuote,
  Image,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import type { HomeworkType, HomeworkSection } from "@/types/database";
import { QuizEditor } from "./quiz-editor";
import { FillBlanksEditor } from "./fill-blanks-editor";
import { MatchingEditor } from "./matching-editor";
import { OrderingEditor } from "./ordering-editor";
import { CardsEditor } from "./cards-editor";
import { TrueFalseEditor } from "./true-false-editor";
import { OpenAnswerEditor } from "./open-answer-editor";
import { TextEditor } from "./text-editor";
import { MediaEditor } from "./media-editor";
import { validateSections } from "./validation";
export { validateSections };
export type { ValidationError } from "./validation";

export const typeLabels: Record<HomeworkType, string> = {
  quiz: "Тест", fill_blanks: "Вставить слово", matching: "Соединить пары",
  ordering: "Word order", cards: "Карточки", text: "Текст",
  true_false: "Верно / Неверно", open_answer: "Открытый ответ", media: "Медиа",
};
export const typeIcons: Record<HomeworkType, string> = {
  quiz: "Т", fill_blanks: "В", matching: "П", ordering: "W", cards: "К", text: "Tx",
  true_false: "В/Н", open_answer: "О", media: "М",
};
export const typeIconComponents: Record<HomeworkType, any> = {
  quiz: ListChecks,
  fill_blanks: ScanText,
  matching: GitCompareArrows,
  ordering: ArrowUpWideNarrow,
  cards: PanelsTopLeft,
  text: FileText,
  true_false: CircleHelp,
  open_answer: MessageSquareQuote,
  media: Image,
};

const addableSectionTypes: HomeworkType[] = [
  "quiz",
  "fill_blanks",
  "matching",
  "ordering",
  "cards",
  "text",
  "true_false",
  "open_answer",
  "media",
];

// ── Section Editor wrapper ──

export function SectionEditor({ section, onChange, onDelete, onDuplicate, onMoveUp, onMoveDown, isFirst, isLast, index, errors }: {
  section: HomeworkSection; onChange: (s: HomeworkSection) => void;
  onDelete: () => void; onDuplicate: () => void;
  onMoveUp: () => void; onMoveDown: () => void;
  isFirst: boolean; isLast: boolean; index: number;
  errors: string[];
}) {
  const { t } = useTranslation();
  const editors: Record<HomeworkType, any> = { quiz: QuizEditor, fill_blanks: FillBlanksEditor, matching: MatchingEditor, ordering: OrderingEditor, cards: CardsEditor, text: TextEditor, true_false: TrueFalseEditor, open_answer: OpenAnswerEditor, media: MediaEditor };
  const Editor = editors[section.type];
  const Icon = typeIconComponents[section.type];
  const hasErrors = errors.length > 0;

  return (
    <div className={`rounded-xl border overflow-hidden ${hasErrors ? "border-red-200" : "border-[#e8e5de]"} bg-white`}>
      <div className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 border-b ${hasErrors ? "bg-red-50 border-red-100" : "bg-[#f5f3ee] border-[#e8e5de]"} overflow-x-auto`}>
        <Icon className="h-3.5 w-3.5 text-[#666] shrink-0" />
        <span className="text-[12px] font-medium text-[#666] truncate">{typeLabels[section.type]}</span>
        <span className="text-[11px] text-[#888] shrink-0">#{index + 1}</span>
        {hasErrors && <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />}
        <div className="flex-1" />
        <button onClick={onMoveUp} disabled={isFirst} className="h-6 w-6 rounded flex items-center justify-center hover:bg-[#f0ede6] disabled:opacity-20 cursor-pointer shrink-0"><ChevronUp className="h-3.5 w-3.5 text-[#888]" /></button>
        <button onClick={onMoveDown} disabled={isLast} className="h-6 w-6 rounded flex items-center justify-center hover:bg-[#f0ede6] disabled:opacity-20 cursor-pointer shrink-0"><ChevronDown className="h-3.5 w-3.5 text-[#888]" /></button>
        <div className="w-px h-4 bg-[#e8e5de] shrink-0" />
        <button onClick={onDuplicate} className="h-6 w-6 rounded flex items-center justify-center hover:bg-[#f0ede6] cursor-pointer shrink-0" title="Дублировать"><CopyPlus className="h-3.5 w-3.5 text-[#888]" /></button>
        <button onClick={onDelete} className="h-6 w-6 rounded flex items-center justify-center hover:bg-[#fef2f2] cursor-pointer shrink-0" title="Удалить"><Trash2 className="h-3.5 w-3.5 text-[#888] hover:text-red-500" /></button>
      </div>
      <div className="p-3 md:p-4 space-y-3">
        <input value={section.title} onChange={(e) => onChange({ ...section, title: e.target.value })}
          placeholder={t("sectionTitle")} className="w-full h-9 rounded-lg border border-[#e8e5de] px-3 text-[14px] font-medium outline-none focus:border-[#ccc]" />
        <Editor section={section} onChange={onChange} />
        {hasErrors && (
          <div className="rounded-lg bg-red-50 px-3 py-2 space-y-1">
            {errors.map((e, i) => <p key={i} className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3 shrink-0" /> {e}</p>)}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Factory helpers ──

export function emptySection(type: HomeworkType): HomeworkSection {
  const id = crypto.randomUUID();
  switch (type) {
    case "quiz": return { id, type, title: "Тест", content: [{ question: "", options: ["", ""], correct: 0 }] };
    case "fill_blanks": return { id, type, title: "Вставить слово", content: { text: "", answers: [] } };
    case "matching": return { id, type, title: "Соединить пары", content: { pairs: [{ left: "", right: "" }] } };
    case "ordering": return { id, type, title: "Word order", content: { items: ["", ""], correct_order: [0, 1] } };
    case "cards": return { id, type, title: "Карточки", content: { cards: [{ front: "", back: "" }] } };
    case "text": return { id, type, title: "Задание", content: { text: "" } };
    case "true_false": return { id, type, title: "Верно / Неверно", content: { questions: [{ statement: "", correct: true }] } };
    case "open_answer": return { id, type, title: "Открытый ответ", content: { prompt: "" } };
    case "media": return { id, type, title: "Медиа", content: { files: [], caption: "" } };
  }
}

export function duplicateSection(sec: HomeworkSection): HomeworkSection {
  return { ...sec, id: crypto.randomUUID(), title: sec.title + " (копия)" };
}

// ── Add Section Picker ──

export function AddSectionPicker({ onAdd }: { onAdd: (section: HomeworkSection) => void }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-dashed border-[#e8e5de] p-3 md:p-4">
      <p className="text-[12px] text-[#888] mb-3">{t("addSectionLabel")}</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 md:gap-2">
        {addableSectionTypes.map((key) => (
          <button key={key} onClick={() => onAdd(emptySection(key))}
            className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-2 md:py-2.5 rounded-xl text-[11px] md:text-[12px] font-medium bg-[#f5f3ee] text-[#666] hover:bg-[#f0ede6] border border-[#e8e5de] hover:border-[#e8e5de] cursor-pointer transition-colors">
            {(() => {
              const Icon = typeIconComponents[key];
              return <Icon className="h-3.5 w-3.5 shrink-0" />;
            })()}
            <span className="truncate">{typeLabels[key]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Sections List Editor ──

export function SectionsListEditor({ sections, onChange, showErrors }: {
  sections: HomeworkSection[];
  onChange: (sections: HomeworkSection[]) => void;
  showErrors: boolean;
}) {
  const { t } = useTranslation();
  const [activeSectionId, setActiveSectionId] = useState<string | null>(sections[0]?.id || null);
  const validationErrors = useMemo(() => validateSections(sections), [sections]);
  const errorsPerSection = useMemo(() => {
    const map: Record<number, string[]> = {};
    validationErrors.forEach((e) => {
      if (!map[e.sectionIndex]) map[e.sectionIndex] = [];
      map[e.sectionIndex].push(e.message);
    });
    return map;
  }, [validationErrors]);

  useEffect(() => {
    if (sections.length === 0) {
      setActiveSectionId(null);
      return;
    }
    if (!activeSectionId || !sections.some((section) => section.id === activeSectionId)) {
      setActiveSectionId(sections[0].id);
    }
  }, [activeSectionId, sections]);

  const moveSection = (i: number, dir: -1 | 1) => {
    const next = [...sections];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(next);
  };

  const addSection = (section: HomeworkSection) => {
    onChange([...sections, section]);
    setActiveSectionId(section.id);
  };

  const activeIndex = sections.findIndex((section) => section.id === activeSectionId);
  const activeSection = activeIndex >= 0 ? sections[activeIndex] : null;

  return (
    <div className="space-y-3">
      <div className="sticky top-0 z-10 -mx-1 px-1 pb-1 bg-white">
        <AddSectionPicker onAdd={addSection} />
      </div>
      {sections.length > 0 && <p className="text-[12px] font-medium text-[#888]">{sections.length} {sections.length === 1 ? t("sectionSingleCount") : t("sectionsCount")}</p>}
      {sections.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)] gap-3 items-start">
          <div className="rounded-xl border border-[#e8e5de] bg-white p-2 space-y-1">
            {sections.map((sec, i) => {
              const Icon = typeIconComponents[sec.type];
              const errors = showErrors ? (errorsPerSection[i] || []) : [];
              const isActive = sec.id === activeSectionId;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSectionId(sec.id)}
                  className={`w-full text-left rounded-xl border px-3 py-2.5 transition-colors cursor-pointer ${
                    isActive ? "border-[#1a1a1a] bg-[#f5f3ee]" : "border-transparent hover:bg-[#f8f6f1]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-[#666] shrink-0" />
                    <span className="text-[12px] font-medium text-[#1a1a1a] truncate flex-1">
                      {sec.title.trim() || typeLabels[sec.type]}
                    </span>
                    <span className="text-[10px] text-[#888] shrink-0">#{i + 1}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-[11px] text-[#888] truncate">{typeLabels[sec.type]}</span>
                    {errors.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-red-500 shrink-0">
                        <AlertCircle className="h-3 w-3" /> {errors.length}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {activeSection && (
            <SectionEditor
              key={activeSection.id}
              section={activeSection}
              index={activeIndex}
              onChange={(section) => onChange(sections.map((item, index) => index === activeIndex ? section : item))}
              onDelete={() => {
                const next = sections.filter((_, index) => index !== activeIndex);
                onChange(next);
                setActiveSectionId(next[Math.max(0, activeIndex - 1)]?.id || null);
              }}
              onDuplicate={() => {
                const duplicate = duplicateSection(activeSection);
                const next = [...sections];
                next.splice(activeIndex + 1, 0, duplicate);
                onChange(next);
                setActiveSectionId(duplicate.id);
              }}
              onMoveUp={() => moveSection(activeIndex, -1)}
              onMoveDown={() => moveSection(activeIndex, 1)}
              isFirst={activeIndex === 0}
              isLast={activeIndex === sections.length - 1}
              errors={showErrors ? (errorsPerSection[activeIndex] || []) : []}
            />
          )}
        </div>
      )}
    </div>
  );
}
