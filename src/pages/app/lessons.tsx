import { useState } from "react";
import { Plus, BookOpen, Pencil, Trash2, ChevronDown } from "lucide-react";
import { useStore } from "@/lib/store";
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";

export function LessonsPage() {
  const { students, lessons, addLesson, updateLesson, deleteLesson } = useStore();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [studentId, setStudentId] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [filterStudent, setFilterStudent] = useState("all");

  const filtered = filterStudent === "all" ? lessons : lessons.filter((l) => l.student_id === filterStudent);

  const studentName = (id: string) => students.find((s) => s.id === id)?.name ?? "—";

  const handleSave = () => {
    if (!title.trim() || !studentId) return;
    if (editId) {
      updateLesson(editId, { title: title.trim(), student_id: studentId, date, notes: notes.trim() || null });
    } else {
      addLesson(studentId, title.trim(), date, notes.trim() || undefined);
    }
    closeDialog();
  };

  const handleEdit = (l: typeof lessons[0]) => {
    setEditId(l.id);
    setStudentId(l.student_id);
    setTitle(l.title);
    setDate(l.date);
    setNotes(l.notes || "");
    setOpen(true);
  };

  const handleNew = () => {
    setEditId(null);
    setStudentId(students[0]?.id ?? "");
    setTitle("");
    setDate(new Date().toISOString().slice(0, 10));
    setNotes("");
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setEditId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Уроки</h1>
          <p className="text-[13px] text-zinc-400 mt-0.5">{filtered.length} {filtered.length === 1 ? "урок" : "уроков"}</p>
        </div>
        <button
          onClick={handleNew}
          disabled={students.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white text-[13px] font-medium hover:bg-zinc-800 transition-colors disabled:opacity-40 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Добавить урок
        </button>
      </div>

      {/* Filter */}
      {students.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStudent("all")}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${
              filterStudent === "all" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
            }`}
          >
            Все
          </button>
          {students.map((s) => (
            <button
              key={s.id}
              onClick={() => setFilterStudent(s.id)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${
                filterStudent === s.id ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {students.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white py-20 text-center">
          <p className="text-[14px] text-zinc-400">Сначала добавьте ученика</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white py-20 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
            <BookOpen className="h-5 w-5 text-zinc-400" />
          </div>
          <p className="text-[15px] font-medium text-zinc-900 mb-1">Уроков пока нет</p>
          <p className="text-[13px] text-zinc-400">Создайте первый урок</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((l) => (
            <div key={l.id} className="rounded-xl border border-zinc-200 bg-white px-4 py-3 flex items-center gap-4 group hover:border-zinc-300 transition-colors">
              <div className="h-9 w-9 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                <BookOpen className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium truncate">{l.title}</p>
                <p className="text-[12px] text-zinc-400">{studentName(l.student_id)} · {l.date}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(l)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-zinc-100 transition-colors cursor-pointer">
                  <Pencil className="h-3.5 w-3.5 text-zinc-400" />
                </button>
                <button onClick={() => deleteLesson(l.id)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer">
                  <Trash2 className="h-3.5 w-3.5 text-zinc-400 hover:text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl z-50 space-y-5">
            <Dialog.Title className="text-lg font-bold">
              {editId ? "Редактировать урок" : "Новый урок"}
            </Dialog.Title>
            <div className="space-y-3">
              <div>
                <label className="text-[12px] font-medium text-zinc-500 mb-1 block">Ученик *</label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full h-10 rounded-xl border border-zinc-200 px-3 text-[14px] outline-none focus:border-zinc-400 transition-colors bg-white"
                >
                  <option value="">Выберите ученика</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[12px] font-medium text-zinc-500 mb-1 block">Название *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Present Simple — урок 5"
                  className="w-full h-10 rounded-xl border border-zinc-200 px-3 text-[14px] outline-none focus:border-zinc-400 transition-colors"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-zinc-500 mb-1 block">Дата</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-10 rounded-xl border border-zinc-200 px-3 text-[14px] outline-none focus:border-zinc-400 transition-colors"
                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-zinc-500 mb-1 block">Заметки</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Конспект урока, материалы..."
                  rows={4}
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-[14px] outline-none focus:border-zinc-400 transition-colors resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <button className="px-4 py-2 rounded-xl text-[13px] font-medium text-zinc-500 hover:bg-zinc-100 transition-colors cursor-pointer">
                  Отмена
                </button>
              </Dialog.Close>
              <button
                onClick={handleSave}
                disabled={!title.trim() || !studentId}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-[13px] font-medium hover:bg-zinc-800 transition-colors disabled:opacity-40 cursor-pointer"
              >
                {editId ? "Сохранить" : "Создать"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
