import { useTranslation } from "@/lib/i18n";

export function StatsBar({ lessonsCount, completedHw, totalHw, avgScore }: {
  lessonsCount: number; completedHw: number; totalHw: number; avgScore: number | null;
}) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-3 gap-2 md:gap-3">
      <div className="rounded-xl border border-[#e8e5de] bg-white px-3 md:px-4 py-2.5 md:py-3 text-center">
        <p className="text-[18px] md:text-[20px] font-bold">{lessonsCount}</p>
        <p className="text-[10px] md:text-[11px] text-[#888]">{t("lessonsLabel")}</p>
      </div>
      <div className="rounded-xl border border-[#e8e5de] bg-white px-3 md:px-4 py-2.5 md:py-3 text-center">
        <p className="text-[18px] md:text-[20px] font-bold">{completedHw}/{totalHw}</p>
        <p className="text-[10px] md:text-[11px] text-[#888]">{t("tasksLabel")}</p>
      </div>
      <div className="rounded-xl border border-[#e8e5de] bg-white px-3 md:px-4 py-2.5 md:py-3 text-center">
        <p className="text-[18px] md:text-[20px] font-bold">{avgScore !== null ? `${avgScore}%` : "—"}</p>
        <p className="text-[10px] md:text-[11px] text-[#888]">{t("avgScore")}</p>
      </div>
    </div>
  );
}
