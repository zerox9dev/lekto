import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import type { Lesson, Student } from "@/types/database";

const WEEKDAYS = {
  ru: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
  uk: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"],
};

const MONTHS = {
  ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
  uk: ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"],
};

const toDate = (value: string) => new Date(`${value}T12:00:00`);
const keyOf = (date: Date) => date.toISOString().slice(0, 10);

export function DashboardCalendar({ lessons, students }: { lessons: Lesson[]; students: Student[] }) {
  const { t, lang } = useTranslation();
  const today = useMemo(() => new Date(), []);
  const [monthCursor, setMonthCursor] = useState(() => {
    const base = lessons[0]?.date ? toDate(lessons[0].date) : today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const lessonsByDate = useMemo(() => {
    return lessons.reduce<Record<string, Lesson[]>>((acc, lesson) => {
      acc[lesson.date] = [...(acc[lesson.date] || []), lesson].sort((a, b) => a.title.localeCompare(b.title));
      return acc;
    }, {});
  }, [lessons]);

  const days = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const first = new Date(year, month, 1);
    const offset = (first.getDay() + 6) % 7;
    const start = new Date(year, month, 1 - offset);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const dateKey = keyOf(date);
      return {
        key: dateKey,
        label: date.getDate(),
        currentMonth: date.getMonth() === month,
        lessons: lessonsByDate[dateKey] || [],
        isToday: dateKey === keyOf(today),
      };
    });
  }, [lessonsByDate, monthCursor, today]);

  return (
    <div className="mb-8">
      <section className="bg-white rounded-2xl border border-[#e8e5de] p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0">
            <h2 className="text-[16px] font-semibold text-[#1a1a1a]">{t("calendarTitle")}</h2>
            <p className="text-[13px] text-[#888]">{MONTHS[lang][monthCursor.getMonth()]} {monthCursor.getFullYear()}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setMonthCursor(new Date(today.getFullYear(), today.getMonth(), 1))} className="h-9 px-3 rounded-xl border border-[#e8e5de] hover:bg-[#f5f3ee] text-[13px] text-[#666]">
              {t("today")}
            </button>
            <button onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))} className="h-9 w-9 rounded-xl border border-[#e8e5de] hover:bg-[#f5f3ee]">
              <ChevronLeft className="h-4 w-4 mx-auto text-[#666]" />
            </button>
            <button onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))} className="h-9 w-9 rounded-xl border border-[#e8e5de] hover:bg-[#f5f3ee]">
              <ChevronRight className="h-4 w-4 mx-auto text-[#666]" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {WEEKDAYS[lang].map((day) => <div key={day} className="text-[11px] font-medium text-[#888] px-1 py-2">{day}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => (
            <div key={day.key}
              className={`min-h-[112px] rounded-2xl border p-2 text-left ${
                day.isToday ? "border-[#4a6fa5] bg-[#f5f8fc]" : "border-[#eee9df] bg-white"
              } ${day.currentMonth ? "text-[#1a1a1a]" : "text-[#b2aca1]"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[13px] font-medium ${day.isToday ? "text-[#4a6fa5]" : ""}`}>{day.label}</span>
                {day.lessons.length > 0 && <span className="text-[10px] text-[#888]">{day.lessons.length}</span>}
              </div>
              <div className="flex flex-wrap gap-1">
                {day.lessons.slice(0, 2).map((lesson) => {
                  return (
                    <div key={lesson.id} className="max-w-full rounded-lg bg-[#eef3fb] px-2 py-1">
                      <p className="text-[10px] font-medium text-[#35527d] whitespace-nowrap truncate">{lesson.title}</p>
                    </div>
                  );
                })}
                {day.lessons.length > 2 && (
                  <div className="text-[10px] text-[#888] px-1 self-center whitespace-nowrap">+{day.lessons.length - 2} {t("moreLabel")}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
