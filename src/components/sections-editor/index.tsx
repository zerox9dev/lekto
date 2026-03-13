import { useMemo } from "react";
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
  ordering: "Порядок", cards: "Карточки", text: "Текст",
  true_false: "Верно / Неверно", open_answer: "Открытый ответ", media: "Медиа",
};
export const typeIcons: Record<HomeworkType, string> = {
  quiz: "Т", fill_blanks: "В", matching: "П", ordering: "С", cards: "К", text: "Tx",
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
    case "ordering": return { id, type, title: "Порядок", content: { items: ["", ""], correct_order: [0, 1] } };
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
        {(Object.entries(typeLabels) as [HomeworkType, string][]).map(([key, label]) => (
          <button key={key} onClick={() => onAdd(emptySection(key))}
            className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-2 md:py-2.5 rounded-xl text-[11px] md:text-[12px] font-medium bg-[#f5f3ee] text-[#666] hover:bg-[#f0ede6] border border-[#e8e5de] hover:border-[#e8e5de] cursor-pointer transition-colors">
            {(() => {
              const Icon = typeIconComponents[key];
              return <Icon className="h-3.5 w-3.5 shrink-0" />;
            })()}
            <span className="truncate">{label}</span>
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
  const validationErrors = useMemo(() => validateSections(sections), [sections]);
  const errorsPerSection = useMemo(() => {
    const map: Record<number, string[]> = {};
    validationErrors.forEach((e) => {
      if (!map[e.sectionIndex]) map[e.sectionIndex] = [];
      map[e.sectionIndex].push(e.message);
    });
    return map;
  }, [validationErrors]);

  const moveSection = (i: number, dir: -1 | 1) => {
    const next = [...sections];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="sticky top-0 z-10 -mx-1 px-1 pb-1 bg-white">
        <AddSectionPicker onAdd={(sec) => onChange([...sections, sec])} />
      </div>
      {sections.length > 0 && <p className="text-[12px] font-medium text-[#888]">{sections.length} {sections.length === 1 ? t("sectionSingleCount") : t("sectionsCount")}</p>}
      {sections.map((sec, i) => (
        <SectionEditor key={sec.id} section={sec} index={i}
          onChange={(s) => onChange(sections.map((x, j) => j === i ? s : x))}
          onDelete={() => onChange(sections.filter((_, j) => j !== i))}
          onDuplicate={() => { const dup = duplicateSection(sec); const next = [...sections]; next.splice(i + 1, 0, dup); onChange(next); }}
          onMoveUp={() => moveSection(i, -1)} onMoveDown={() => moveSection(i, 1)}
          isFirst={i === 0} isLast={i === sections.length - 1}
          errors={showErrors ? (errorsPerSection[i] || []) : []} />
      ))}
    </div>
  );
}
