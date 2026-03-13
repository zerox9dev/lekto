import { useState } from "react";
import { useStore } from "@/features/store";
import { useTranslation } from "@/lib/i18n";
import { ClipboardList, Search, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const typeLabels: Record<string, string> = {
  quiz: "Тест", fill_blanks: "Вставить слово", matching: "Соединить пары",
  ordering: "Word order", cards: "Карточки", text: "Текст", true_false: "Верно/Неверно",
  open_answer: "Открытый ответ", media: "Медиа",
};
const typeIcons: Record<string, string> = {
  quiz: "Т", fill_blanks: "В", matching: "П", ordering: "W", cards: "К",
  text: "Tx", true_false: "В/Н", open_answer: "О", media: "М",
};

export function HomeworkPage() {
  const { students, lessons, homework } = useStore();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const sorted = [...homework]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .filter((hw) => {
      if (!search) return true;
      const q = search.toLowerCase();
      const student = students.find((s) => s.id === hw.student_id);
      const lesson = lessons.find((l) => l.id === hw.lesson_id);
      return hw.title.toLowerCase().includes(q)
        || (student?.name || "").toLowerCase().includes(q)
        || (lesson?.title || "").toLowerCase().includes(q);
    });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold font-serif text-[#1a1a1a] mb-1">{t("homeworkPageTitle")}</h1>
          <p className="text-[14px] text-[#888]">{homework.length} {t("tasksN")}</p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888]" />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchHomework")}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#e8e5de] text-[14px] placeholder:text-[#aaa] focus:outline-none focus:border-[#2d5a3d]"
        />
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e8e5de] p-8 text-center">
          <ClipboardList className="h-8 w-8 text-[#ccc] mx-auto mb-2" />
          <p className="text-[14px] text-[#888]">{search ? t("nothingFound") : t("noTasksYet")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((hw) => {
            const student = students.find((s) => s.id === hw.student_id);
            const lesson = lessons.find((l) => l.id === hw.lesson_id);
            const sections = hw.sections || [];

            return (
              <Link key={hw.id} to={`/app/students/${hw.student_id}`}
                className="flex items-center justify-between bg-white rounded-2xl border border-[#e8e5de] px-4 py-3 hover:border-[#ccc] transition-all">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[14px] font-medium text-[#1a1a1a] truncate">{hw.title}</p>
                    <div className="flex gap-1 shrink-0">
                      {sections.map((sec, i) => (
                        <span key={i} className="text-[11px]" title={typeLabels[sec.type]}>
                          {typeIcons[sec.type] || "Tx"}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-[#888]">
                    <span>{student?.name || "—"}</span>
                    {lesson && <><span>·</span><span>{lesson.title}</span></>}
                    <span>·</span>
                    <span>{sections.length} {sections.length === 1 ? t("sectionSingle") : t("sectionsPlural")}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[#ccc] shrink-0 ml-2" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
