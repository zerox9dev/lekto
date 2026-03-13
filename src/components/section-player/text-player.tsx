import type { HomeworkSection } from "@/types/database";

export function TextPlayer({ section }: { section: HomeworkSection }) {
  return (
    <div className="text-[14px] md:text-[15px] text-[#666] leading-relaxed break-words space-y-3">
      {((section.content as { text: string }).text || "").split(/\n\n+/).map((paragraph, i) => (
        <p key={i} className="whitespace-pre-wrap">{paragraph.trim()}</p>
      ))}
    </div>
  );
}
