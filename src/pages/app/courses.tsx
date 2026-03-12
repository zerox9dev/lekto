/*
SQL Migration:
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  tutor_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_courses_tutor_id ON courses (tutor_id);
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id) ON DELETE SET NULL;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS order_index INT DEFAULT 0;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tutor read courses" ON courses FOR SELECT TO authenticated USING (tutor_id = auth.uid()::text);
CREATE POLICY "Tutor insert courses" ON courses FOR INSERT TO authenticated WITH CHECK (tutor_id = auth.uid()::text);
CREATE POLICY "Tutor update courses" ON courses FOR UPDATE TO authenticated USING (tutor_id = auth.uid()::text);
CREATE POLICY "Tutor delete courses" ON courses FOR DELETE TO authenticated USING (tutor_id = auth.uid()::text);
CREATE POLICY "Anon read courses" ON courses FOR SELECT TO anon USING (true);
*/
import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, Pencil, ChevronRight, Library, Download } from "lucide-react";
import { useStore } from "@/lib/store";
import { STARTER_COURSES } from "@/lib/starter-courses";
import * as Dialog from "@radix-ui/react-dialog";

export function CoursesPage() {
  const { courses, lessons, addCourse, updateCourse, deleteCourse, addLesson, updateLesson, addHomework, students } = useStore();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const handleSave = () => {
    if (!title.trim()) return;
    if (editId) {
      updateCourse(editId, { title: title.trim(), description: desc.trim() || null });
    } else {
      addCourse(title.trim(), desc.trim() || undefined);
    }
    setOpen(false); setTitle(""); setDesc(""); setEditId(null);
  };

  const handleEdit = (e: React.MouseEvent, c: typeof courses[0]) => {
    e.preventDefault(); e.stopPropagation();
    setEditId(c.id); setTitle(c.title); setDesc(c.description || ""); setOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    deleteCourse(id);
  };

  const handleNew = () => { setEditId(null); setTitle(""); setDesc(""); setOpen(true); };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg md:text-xl font-bold tracking-tight font-serif">Курсы</h1>
          <p className="text-[13px] text-[#888] mt-0.5">{courses.length} {courses.length === 1 ? "курс" : "курсов"}</p>
        </div>
        <button onClick={handleNew}
          className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-[#1a1a1a] text-white text-[13px] font-medium hover:bg-[#333] cursor-pointer shrink-0">
          <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Добавить курс</span><span className="sm:hidden">Новый</span>
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e8e5de] bg-white py-12 md:py-20 text-center px-4">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-[#f0ede6] flex items-center justify-center mb-4">
            <Library className="h-5 w-5 text-[#888]" />
          </div>
          <p className="text-[15px] font-medium text-[#1a1a1a] mb-1">Пока нет курсов</p>
          <p className="text-[13px] text-[#888]">Создайте курс, чтобы группировать уроки</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {courses.map((c) => {
            const lessonCount = lessons.filter((l) => l.course_id === c.id).length;
            const created = new Date(c.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
            return (
              <Link key={c.id} to={`/app/courses/${c.id}`}
                className="rounded-2xl border border-[#e8e5de] bg-white px-4 py-4 group hover:border-[#d0ccc4] transition-colors block">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-[15px] font-semibold font-serif truncate">{c.title}</h3>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={(e) => handleEdit(e, c)} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-[#f0ede6] cursor-pointer">
                      <Pencil className="h-3.5 w-3.5 text-[#888]" />
                    </button>
                    <button onClick={(e) => handleDelete(e, c.id)} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-[#fef2f2] cursor-pointer">
                      <Trash2 className="h-3.5 w-3.5 text-[#888] hover:text-red-500" />
                    </button>
                  </div>
                </div>
                {c.description && <p className="text-[13px] text-[#888] line-clamp-2 mb-3">{c.description}</p>}
                <div className="flex items-center justify-between text-[12px] text-[#aaa]">
                  <span>{lessonCount} уроков</span>
                  <span>{created}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Starter courses */}
      {STARTER_COURSES.filter((sc) => !courses.some((c) => c.title === sc.title)).length > 0 && (
        <div className="space-y-3 pt-2">
          <h2 className="text-[14px] font-semibold text-[#888]">Готовые курсы</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {STARTER_COURSES.filter((sc) => !courses.some((c) => c.title === sc.title)).map((sc) => (
              <div key={sc.id} className="rounded-2xl border border-dashed border-[#d0ccc4] bg-[#faf9f6] px-4 py-4">
                <h3 className="text-[15px] font-semibold font-serif mb-1">{sc.title}</h3>
                <p className="text-[13px] text-[#888] line-clamp-2 mb-3">{sc.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[#aaa]">{sc.lessons.length} уроков</span>
                  <button onClick={async () => {
                    // Create course and wait for DB confirmation
                    const course = addCourse(sc.title, sc.description);
                    const saveResult = await (course as any)._saved;
                    if (saveResult?.error) { console.error("Course save error:", saveResult.error); return; }
                    // Now create lessons sequentially
                    for (const sl of sc.lessons) {
                      const today = new Date().toISOString().slice(0, 10);
                      const lesson = addLesson(null, sl.title, sl.date || today, sl.notes || undefined, sl.sections, course.id, sl.order_index);
                      await (lesson as any)._saved;
                    }
                  }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a1a1a] text-white text-[12px] font-medium hover:bg-[#333] cursor-pointer">
                    <Download className="h-3.5 w-3.5" /> Добавить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:max-w-md rounded-t-2xl md:rounded-2xl bg-white p-5 md:p-6 shadow-xl z-50 space-y-5 overflow-x-hidden">
            <Dialog.Title className="text-lg font-bold">{editId ? "Редактировать курс" : "Новый курс"}</Dialog.Title>
            <div className="space-y-3">
              <div>
                <label className="text-[12px] font-medium text-[#888] mb-1 block">Название *</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Английский B2"
                  className="w-full h-10 rounded-xl border border-[#e8e5de] px-3 text-[14px] outline-none focus:border-[#ccc]" autoFocus />
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#888] mb-1 block">Описание</label>
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Описание курса..."
                  className="w-full h-20 rounded-xl border border-[#e8e5de] px-3 py-2 text-[14px] outline-none focus:border-[#ccc] resize-none" />
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
              <Dialog.Close asChild><button className="px-4 py-2.5 sm:py-2 rounded-full text-[13px] font-medium text-[#888] hover:bg-[#f0ede6] cursor-pointer">Отмена</button></Dialog.Close>
              <button onClick={handleSave} disabled={!title.trim()}
                className="px-4 py-2.5 sm:py-2 rounded-full bg-[#1a1a1a] text-white text-[13px] font-medium hover:bg-[#333] disabled:opacity-40 cursor-pointer">
                {editId ? "Сохранить" : "Создать"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
