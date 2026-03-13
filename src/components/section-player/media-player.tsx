import { useState } from "react";
import type { HomeworkSection, MediaContent } from "@/types/database";

export function MediaPlayer({ section }: { section: HomeworkSection }) {
  const c = section.content as MediaContent;
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {c.files.map((f) => (
        <div key={f.id}>
          {f.type === "image" && (
            <img src={f.url} alt={f.name} onClick={() => setLightbox(f.url)}
              className="max-w-full rounded-xl border border-[#e8e5de] cursor-pointer hover:opacity-90 transition-opacity" />
          )}
          {f.type === "pdf" && (
            <a href={f.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#e8e5de] hover:bg-[#f5f3ee] transition-colors">
              <span className="text-[14px] font-medium text-[#888]">PDF</span>
              <div className="min-w-0">
                <p className="text-[14px] font-medium truncate">{f.name}</p>
                <p className="text-[12px] text-[#888]">{(f.size / 1024).toFixed(0)} КБ · Скачать</p>
              </div>
            </a>
          )}
          {f.type === "audio" && (
            <div className="space-y-1">
              <p className="text-[12px] text-[#888]">{f.name}</p>
              <audio controls src={f.url} className="w-full" />
            </div>
          )}
        </div>
      ))}
      {c.caption && <p className="text-[14px] text-[#666]">{c.caption}</p>}
      {lightbox && (
        <div onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer">
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}
    </div>
  );
}
