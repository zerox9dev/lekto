import { useStore } from "@/features/store";
import { Users, BookOpen, ClipboardList, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export function DashboardPage() {
  const { students, lessons, homework } = useStore();

  const totalStudents = students.length;
  const totalLessons = lessons.length;
  const totalHomework = homework.length;
  const recentLessons = [...lessons].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const pendingHw = homework.filter((h) => {
    // homework without completed status
    return true;
  });

  const stats = [
    { label: "Учеников", value: totalStudents, icon: Users, color: "bg-[#2d5a3d]", href: "/app/students" },
    { label: "Уроков", value: totalLessons, icon: BookOpen, color: "bg-[#4a6fa5]", href: "/app/lessons" },
    { label: "Домашек", value: totalHomework, icon: ClipboardList, color: "bg-[#8b6914]", href: "/app/homework" },
  ];

  return (
    <div>
      <h1 className="text-[22px] font-bold font-serif text-[#1a1a1a] mb-1">Главная</h1>
      <p className="text-[14px] text-[#888] mb-6">Обзор вашей активности</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {stats.map((s) => (
          <Link key={s.label} to={s.href}
            className="bg-white rounded-2xl p-4 border border-[#e8e5de] hover:border-[#ccc] transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className={`h-9 w-9 rounded-xl ${s.color} flex items-center justify-center`}>
                <s.icon className="h-4 w-4 text-white" />
              </div>
              <TrendingUp className="h-3.5 w-3.5 text-[#2d5a3d]" />
            </div>
            <p className="text-[24px] font-bold text-[#1a1a1a]">{s.value}</p>
            <p className="text-[13px] text-[#888]">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#e8e5de] p-4">
        <h2 className="text-[16px] font-semibold text-[#1a1a1a] mb-3">Последние уроки</h2>
        {recentLessons.length === 0 ? (
          <p className="text-[14px] text-[#888] py-4 text-center">Пока нет уроков</p>
        ) : (
          <div className="space-y-2">
            {recentLessons.map((lesson) => {
              const student = students.find((s) => s.id === lesson.student_id);
              return (
                <Link key={lesson.id} to={`/app/students/${lesson.student_id}`}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-[#f5f3ee] transition-colors">
                  <div>
                    <p className="text-[14px] font-medium text-[#1a1a1a]">{lesson.title}</p>
                    <p className="text-[12px] text-[#888]">{student?.name || "—"} · {lesson.date}</p>
                  </div>
                  {lesson.sections && lesson.sections.length > 0 && (
                    <span className="text-[11px] bg-[#f0ede6] text-[#888] px-2 py-0.5 rounded-full">
                      {lesson.sections.length}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
