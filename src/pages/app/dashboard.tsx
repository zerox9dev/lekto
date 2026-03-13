import { useStore } from "@/features/store";
import { useTranslation } from "@/lib/i18n";
import { Users, BookOpen, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardCalendar } from "./dashboard-calendar";

export function DashboardPage() {
  const { students, lessons, homework } = useStore();
  const { t } = useTranslation();

  const totalStudents = students.length;
  const totalLessons = lessons.length;
  const totalHomework = homework.length;

  const stats = [
    { label: t("studentsCount"), value: totalStudents, icon: Users, color: "bg-[#2d5a3d]", href: "/app/students" },
    { label: t("lessonsCount"), value: totalLessons, icon: BookOpen, color: "bg-[#4a6fa5]", href: "/app/lessons" },
    { label: t("homeworkCount"), value: totalHomework, icon: ClipboardList, color: "bg-[#8b6914]", href: "/app/homework" },
  ];

  return (
    <div>
      <h1 className="text-[22px] font-bold font-serif text-[#1a1a1a] mb-1">{t("dashboardTitle")}</h1>
      <p className="text-[14px] text-[#888] mb-6">{t("dashboardDesc")}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {stats.map((s) => (
          <Link key={s.label} to={s.href}
            className="bg-white rounded-2xl p-4 border border-[#e8e5de] hover:border-[#ccc] transition-all cursor-pointer">
            <div className="flex items-center gap-3 justify-between">
              <div className={`h-9 w-9 rounded-xl ${s.color} flex items-center justify-center`}>
                <s.icon className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0 flex gap-4">
                <p className="text-[24px] leading-none font-bold text-[#1a1a1a]">{s.value}</p>
                <p className="text-[13px] text-[#888] mt-1">{s.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <DashboardCalendar lessons={lessons} students={students} />
    </div>
  );
}
