import { useState } from "react";
import { X, Upload } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import type { HomeworkSection, MediaContent, MediaFile } from "@/types/database";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 5;
const ACCEPT_TYPES = "image/*,audio/*,application/pdf";

function getFileType(file: File): "image" | "pdf" | "audio" {
  if (file.type.startsWith("image/")) return "image";
  if (file.type === "application/pdf") return "pdf";
  return "audio";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " Б";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " КБ";
  return (bytes / (1024 * 1024)).toFixed(1) + " МБ";
}

export function MediaEditor({ section, onChange }: { section: HomeworkSection; onChange: (s: HomeworkSection) => void }) {
  const { t } = useTranslation();
  const c = section.content as MediaContent;
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (c.files.length + files.length > MAX_FILES) { setError(`Максимум ${MAX_FILES} файлов`); return; }
    const oversized = files.find((f) => f.size > MAX_FILE_SIZE);
    if (oversized) { setError(`Файл "${oversized.name}" превышает 10 МБ`); return; }
    setError(null);
    setUploading(true);
    const newFiles: MediaFile[] = [];
    for (const file of files) {
      const id = crypto.randomUUID();
      let url = "";
      if (supabase) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `uploads/${id}_${safeName}`;
        const { error: upErr } = await supabase.storage.from("media").upload(path, file, { contentType: file.type });
        if (upErr) { setError(`Ошибка загрузки: ${upErr.message}`); continue; }
        const { data: pubData } = supabase.storage.from("media").getPublicUrl(path);
        url = pubData.publicUrl;
      } else {
        url = URL.createObjectURL(file);
      }
      newFiles.push({ id, name: file.name, url, type: getFileType(file), size: file.size });
    }
    onChange({ ...section, content: { ...c, files: [...c.files, ...newFiles] } });
    setUploading(false);
  };

  const removeFile = (id: string) => {
    onChange({ ...section, content: { ...c, files: c.files.filter((f) => f.id !== id) } });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => { const inp = document.createElement("input"); inp.type = "file"; inp.multiple = true; inp.accept = ACCEPT_TYPES; inp.onchange = () => inp.files && addFiles(inp.files); inp.click(); }}
        className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
          dragOver ? "border-blue-400 bg-blue-50" : "border-[#e8e5de] hover:border-[#d0ccc4] bg-[#faf9f6]"
        }`}
      >
        <Upload className="h-5 w-5 text-[#888]" />
        <p className="text-[12px] text-[#888] text-center">{uploading ? t("uploading") : t("uploadHint")}</p>
        <p className="text-[10px] text-[#aaa]">Изображения, PDF, аудио · до 10 МБ · макс. {MAX_FILES} файлов</p>
      </div>
      {error && <p className="text-[11px] text-red-500">{error}</p>}
      {c.files.length > 0 && (
        <div className="space-y-1.5">
          {c.files.map((f) => (
            <div key={f.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#e8e5de] bg-white">
              {f.type === "image" && <img src={f.url} alt={f.name} className="h-10 w-10 rounded object-cover shrink-0" />}
              {f.type === "pdf" && <span className="text-[18px] shrink-0">PDF</span>}
              {f.type === "audio" && <span className="text-[14px] font-medium text-[#888] shrink-0">Audio</span>}
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium truncate">{f.name}</p>
                <p className="text-[10px] text-[#888]">{formatFileSize(f.size)}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                className="h-6 w-6 rounded flex items-center justify-center hover:bg-[#fef2f2] shrink-0 cursor-pointer">
                <X className="h-3 w-3 text-[#ccc] hover:text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}
      <input value={c.caption || ""} onChange={(e) => onChange({ ...section, content: { ...c, caption: e.target.value } })}
        placeholder={t("captionPlaceholder")} className="w-full h-8 rounded-lg border border-dashed border-[#e8e5de] px-3 text-[12px] text-[#888] outline-none focus:border-[#ccc]" />
    </div>
  );
}
