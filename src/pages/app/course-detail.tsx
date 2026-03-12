import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowUp, ArrowDown, X, Plus, ChevronRight, Search, ChevronDown } from "lucide-react";
import { useStore } from "@/lib/store";
import { SectionPlayer } from "@/components/section-player";
import * as Dialog from "@radix-ui/react-dialog";

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { courses, lessons, updateCourse, updateLesson } = useStore();
  const course = courses.find((c) => c.id === id);
  const [editTitle, setEditTitle] = useState(false);
  const [editDesc, setEditDesc] = useState(false);
  const [titleVal, setTitleVal] = useState("");
  const [descVal, setDescVal] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  const courseLessons = useMemo(() =>
    lessons.filter((l) => l.course_id === id).sort((a, b) => (a.order_index || 0) - (b.order_index || 0)),
    [lessons, id]
  );

  const unlinkedLessons = useMemo(() =>
    lessons.filter((l) => !l.course_id && l.title.toLowerCase().includes(search.toLowerCase())),
    [lessons, search]
  );

  if (!course) {
    return (
      <div className="text-center py-20">
        <p className="text-[15px] text-[#888]">Курс не найден</p>
        <Link to="/app/courses" className="text-[13px] text-[#1a1a1a] underline mt-2 inline-block">← Назад к курсам</Link>
      </div>
    );
  }

  const saveTitle = () => {
    if (titleVal.trim()) updateCourse(course.id, { title: titleVal.trim() });
    setEditTitle(false);
  };

  const saveDesc = () => {
    updateCourse(course.id, { description: descVal.trim() || null });
    setEditDesc(false);
  };

  const moveLesson = (lessonId: string, dir: -1 | 1) => {
    const idx = courseLessons.findIndex((l) => l.id === lessonId);
    if ((dir === -1 && idx <= 0) || (dir === 1 && idx >= courseLessons.length - 1)) return;
    const swapWith = courseLessons[idx + dir];
    const myOrder = courseLessons[idx].order_index || 0;
    const theirOrder = swapWith.order_index || 0;
    updateLesson(lessonId, { order_index: theirOrder });
    updateLesson(swapWith.id, { order_index: myOrder });
  };

  const unlinkLesson = (lessonId: string) => {
    updateLesson(lessonId, { course_id: null, order_index: 0 });
  };

  const addLessonToCourse = (lessonId: string) => {
    const maxOrder = courseLessons.reduce((max, l) => Math.max(max, l.order_index || 0), 0);
    updateLesson(lessonId, { course_id: course.id, order_index: maxOrder + 1 });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[13px] text-[#888]">
        <Link to="/app/courses" className="hover:text-[#1a1a1a]">Курсы</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-[#1a1a1a] font-medium truncate">{course.title}</span>
      </div>

      {/* Title */}
      {editTitle ? (
        <div className="flex items-center gap-2">
          <input value={titleVal} onChange={(e) => setTitleVal(e.target.value)} autoFocus onKeyDown={(e) => e.key === "Enter" && saveTitle()}
            className="text-lg md:text-xl font-bold font-serif bg-transparent border-b border-[#e8e5de] outline-none flex-1" />
          <button onClick={saveTitle} className="px-3 py-1 rounded-full bg-[#1a1a1a] text-white text-[12px] cursor-pointer">ОК</button>
        </div>
      ) : (
        <h1 onClick={() => { setTitleVal(course.title); setEditTitle(true); }}
          className="text-lg md:text-xl font-bold tracking-tight font-serif cursor-pointer hover:text-[#555]">{course.title}</h1>
      )}

      {/* Description */}
      {editDesc ? (
        <div className="space-y-2">
          <textarea value={descVal} onChange={(e) => setDescVal(e.target.value)} autoFocus
            className="w-full h-20 rounded-xl border border-[#e8e5de] px-3 py-2 text-[14px] outline-none focus:border-[#ccc] resize-none" />
          <button onClick={saveDesc} className="px-3 py-1 rounded-full bg-[#1a1a1a] text-white text-[12px] cursor-pointer">Сохранить</button>
        </div>
      ) : (
        <p onClick={() => { setDescVal(course.description || ""); setEditDesc(true); }}
          className="text-[14px] text-[#888] cursor-pointer hover:text-[#555]">
          {course.description || "Добавить описание..."}
        </p>
      )}

      {/* Lessons in course */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold">Уроки ({courseLessons.length})</h2>
        <button onClick={() => { setSearch(""); setAddOpen(true); }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a1a1a] text-white text-[12px] font-medium hover:bg-[#333] cursor-pointer">
          <Plus className="h-3.5 w-3.5" /> Добавить урок
        </button>
      </div>

      {courseLessons.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e8e5de] bg-white py-10 text-center">
          <p className="text-[14px] text-[#888]">В курсе пока нет уроков</p>
        </div>
      ) : (
        <div className="space-y-2">
          {courseLessons.map((l, idx) => (
            <div key={l.id}>
            <div className="rounded-xl border border-[#e8e5de] bg-white px-3 md:px-4 py-3 flex items-center gap-3 group">
              <span className="text-[12px] text-[#aaa] w-5 text-center shrink-0">{idx + 1}</span>
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedLesson(expandedLesson === l.id ? null : l.id)}>
                <p className="text-[14px] font-medium truncate">{l.title}</p>
                <p className="text-[12px] text-[#888]">{l.notes || l.date}</p>
              </div>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => moveLesson(l.id, -1)} disabled={idx === 0}
                  className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-[#f0ede6] disabled:opacity-20 cursor-pointer">
                  <ArrowUp className="h-3.5 w-3.5 text-[#888]" />
                </button>
                <button onClick={() => moveLesson(l.id, 1)} disabled={idx === courseLessons.length - 1}
                  className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-[#f0ede6] disabled:opacity-20 cursor-pointer">
                  <ArrowDown className="h-3.5 w-3.5 text-[#888]" />
                </button>
                <button onClick={() => unlinkLesson(l.id)}
                  className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-[#fef2f2] cursor-pointer" title="Убрать из курса">
                  <X className="h-3.5 w-3.5 text-[#888] hover:text-red-500" />
                </button>
              </div>
              <ChevronDown className={`h-4 w-4 text-[#aaa] transition-transform shrink-0 ${expandedLesson === l.id ? "rotate-180" : ""}`} />
            </div>
            {expandedLesson === l.id && (
              <div className="rounded-xl border border-[#e8e5de] bg-[#faf9f6] px-4 py-4 -mt-1 space-y-3">
                {l.notes && <p className="text-[13px] text-[#666] italic">{l.notes}</p>}
                {l.sections && l.sections.length > 0 ? (
                  l.sections.map((sec) => (
                    <div key={sec.id} className="bg-white rounded-xl border border-[#e8e5de] p-3">
                      <SectionPlayer section={sec} answer={undefined} onAnswer={() => {}} />
                    </div>
                  ))
                ) : (
                  <p className="text-[13px] text-[#aaa] text-center py-2">Контент пока не добавлен</p>
                )}
              </div>
            )}
            </div>
          ))}
        </div>
      )}

      {/* Add existing lesson dialog */}
      <Dialog.Root open={addOpen} onOpenChange={setAddOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:max-w-md rounded-t-2xl md:rounded-2xl bg-white p-5 md:p-6 shadow-xl z-50 space-y-4 overflow-x-hidden max-h-[80vh]">
            <Dialog.Title className="text-lg font-bold">Добавить урок в курс</Dialog.Title>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888]" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск уроков..."
                className="w-full h-10 rounded-xl border border-[#e8e5de] pl-9 pr-3 text-[14px] outline-none focus:border-[#ccc]" autoFocus />
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {unlinkedLessons.length === 0 ? (
                <p className="text-[13px] text-[#888] text-center py-4">Нет доступных уроков</p>
              ) : unlinkedLessons.map((l) => (
                <button key={l.id} onClick={() => { addLessonToCourse(l.id); setAddOpen(false); }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#f0ede6] transition-colors cursor-pointer">
                  <p className="text-[14px] font-medium truncate">{l.title}</p>
                  <p className="text-[12px] text-[#888]">{l.date}</p>
                </button>
              ))}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
