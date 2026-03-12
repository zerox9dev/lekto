import { useState } from "react";
import { useStore } from "@/features/store";
import { BookOpen, Search, Plus, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const typeLabels: Record<string, string> = {
  quiz: "Тест", fill_blanks: "Вставить слово", matching: "Соединить пары",
  ordering: "Порядок", cards: "Карточки", text: "Текст", true_false: "Верно/Неверно",
  open_answer: "Открытый ответ", media: "Медиа",
};

export function LessonsPage() {
  const { students, lessons } = useStore();
  const [search, setSearch] = useState("");

  const sorted = [...lessons]
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter((l) => {
      if (!search) return true;
      const q = search.toLowerCase();
      const student = students.find((s) => s.id === l.student_id);
      return l.title.toLowerCase().includes(q) || (student?.name || "").toLowerCase().includes(q);
    });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold font-serif text-[#1a1a1a] mb-1">Уроки</h1>
          <p className="text-[14px] text-[#888]">{lessons.length} уроков</p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888]" />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по названию или ученику..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#e8e5de] text-[14px] placeholder:text-[#aaa] focus:outline-none focus:border-[#2d5a3d]"
        />
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e8e5de] p-8 text-center">
          <BookOpen className="h-8 w-8 text-[#ccc] mx-auto mb-2" />
          <p className="text-[14px] text-[#888]">{search ? "Ничего не найдено" : "Пока нет уроков"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((lesson) => {
            const student = students.find((s) => s.id === lesson.student_id);
            const sectionCount = lesson.sections?.length || 0;
            const sectionTypes = lesson.sections?.map((s) => typeLabels[s.type] || s.type) || [];
            const uniqueTypes = [...new Set(sectionTypes)];

            return (
              <Link key={lesson.id} to={`/app/students/${lesson.student_id}`}
                className="flex items-center justify-between bg-white rounded-2xl border border-[#e8e5de] px-4 py-3 hover:border-[#ccc] transition-all">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[14px] font-medium text-[#1a1a1a] truncate">{lesson.title}</p>
                    {sectionCount > 0 && (
                      <span className="text-[11px] bg-[#e8f5e9] text-[#2d5a3d] px-2 py-0.5 rounded-full shrink-0">
                        {sectionCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-[#888]">
                    <span>{student?.name || "—"}</span>
                    <span>·</span>
                    <span>{lesson.date}</span>
                    {uniqueTypes.length > 0 && (
                      <>
                        <span>·</span>
                        <span className="truncate">{uniqueTypes.join(", ")}</span>
                      </>
                    )}
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
