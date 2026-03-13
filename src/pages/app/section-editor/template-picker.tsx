import { useState } from "react";
import { Sparkles, Loader, FileDown, Trash2, Bookmark } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { typeLabels } from "@/components/sections-editor";
import type { HomeworkTemplate as Template } from "@/types/database";

export function TemplatePicker({ templates, onSelect, onDelete }: {
  templates: Template[]; onSelect: (t: Template) => void; onDelete: (id: string) => void;
}) {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);

  if (templates.length === 0) return null;

  return (
    <div>
      <button onClick={() => setShow(!show)}
        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-amber-600 hover:text-amber-700 cursor-pointer">
        <FileDown className="h-3.5 w-3.5" /> {show ? t("hideTemplates") : `${t("fromTemplate")} (${templates.length})`}
      </button>
      {show && (
        <div className="mt-2 space-y-1.5">
          {templates.map((tpl) => (
            <div key={tpl.id} className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 group/tpl">
              <button onClick={() => { onSelect(tpl); setShow(false); }} className="flex-1 text-left cursor-pointer min-w-0">
                <p className="text-[13px] font-medium text-[#666] truncate">{tpl.title}</p>
                <p className="text-[11px] text-[#888] truncate">{tpl.sections.length} секций · {tpl.sections.map((s) => typeLabels[s.type]).join(", ")}</p>
              </button>
              <button onClick={() => onDelete(tpl.id)}
                className="h-6 w-6 rounded flex items-center justify-center md:opacity-0 md:group-hover/tpl:opacity-100 hover:bg-red-100 cursor-pointer shrink-0">
                <Trash2 className="h-3 w-3 text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
