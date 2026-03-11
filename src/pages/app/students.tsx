import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Copy, ExternalLink, Trash2, Pencil, Check, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import * as Dialog from "@radix-ui/react-dialog";

export function StudentsPage() {
  const { students, lessons, homework, addStudent, updateStudent, deleteStudent } = useStore();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [telegram, setTelegram] = useState("");

  const handleSave = () => {
    if (!name.trim()) return;
    if (editId) {
      updateStudent(editId, { name: name.trim(), telegram: telegram.trim() || null });
    } else {
      addStudent(name.trim(), telegram.trim() || undefined);
    }
    setOpen(false);
    setName("");
    setTelegram("");
    setEditId(null);
  };

  const handleEdit = (e: React.MouseEvent, s: typeof students[0]) => {
    e.preventDefault();
    e.stopPropagation();
    setEditId(s.id);
    setName(s.name);
    setTelegram(s.telegram || "");
    setOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    deleteStudent(id);
  };

  const handleNew = () => {
    setEditId(null);
    setName("");
    setTelegram("");
    setOpen(true);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg md:text-xl font-bold tracking-tight font-serif">Ученики</h1>
          <p className="text-[13px] text-[#888] mt-0.5">{students.length} {students.length === 1 ? "ученик" : "учеников"}</p>
        </div>
        <button onClick={handleNew}
          className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-[#1a1a1a] text-white text-[13px] font-medium hover:bg-[#333] cursor-pointer shrink-0">
          <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Добавить</span><span className="sm:hidden">Новый</span>
        </button>
      </div>

      {students.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e8e5de] bg-white py-12 md:py-20 text-center px-4">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-[#f0ede6] flex items-center justify-center mb-4">
            <Plus className="h-5 w-5 text-[#888]" />
          </div>
          <p className="text-[15px] font-medium text-[#1a1a1a] mb-1">Пока нет учеников</p>
          <p className="text-[13px] text-[#888]">Добавьте первого ученика, чтобы начать</p>
        </div>
      ) : (
        <div className="space-y-2">
          {students.map((s) => {
            const lessonCount = lessons.filter((l) => l.student_id === s.id).length;
            const hwCount = homework.filter((h) => h.student_id === s.id).length;
            const completedHw = homework.filter((h) => h.student_id === s.id && h.completed).length;
            return (
              <Link key={s.id} to={`/app/students/${s.id}`}
                className="rounded-2xl border border-[#e8e5de] bg-white px-3 md:px-4 py-3 flex items-center gap-3 md:gap-4 group hover:border-[#d0ccc4] transition-colors block">
                <img src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(s.name)}`}
                  alt={s.name} className="h-10 w-10 rounded-full bg-[#f0ede6] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium truncate">{s.name}</p>
                  <p className="text-[12px] text-[#888] truncate">
                    {lessonCount} уроков · {completedHw}/{hwCount} заданий
                    {s.telegram && <span className="hidden sm:inline"> · @{s.telegram.replace(/^@/, "")}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <div className="hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity items-center gap-1">
                    <button onClick={(e) => handleEdit(e, s)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#f0ede6] cursor-pointer">
                      <Pencil className="h-3.5 w-3.5 text-[#888]" />
                    </button>
                    <button onClick={(e) => handleDelete(e, s.id)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#fef2f2] cursor-pointer">
                      <Trash2 className="h-3.5 w-3.5 text-[#888] hover:text-red-500" />
                    </button>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#ccc]" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:max-w-md rounded-t-2xl md:rounded-2xl bg-white p-5 md:p-6 shadow-xl z-50 space-y-5">
            <Dialog.Title className="text-lg font-bold">{editId ? "Редактировать ученика" : "Новый ученик"}</Dialog.Title>
            <div className="space-y-3">
              <div>
                <label className="text-[12px] font-medium text-[#888] mb-1 block">Имя *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Иван Петров"
                  className="w-full h-10 rounded-xl border border-[#e8e5de] px-3 text-[14px] outline-none focus:border-[#ccc]" autoFocus />
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#888] mb-1 block">Telegram</label>
                <input value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="@username"
                  className="w-full h-10 rounded-xl border border-[#e8e5de] px-3 text-[14px] outline-none focus:border-[#ccc]" />
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
              <Dialog.Close asChild><button className="px-4 py-2.5 sm:py-2 rounded-full text-[13px] font-medium text-[#888] hover:bg-[#f0ede6] cursor-pointer">Отмена</button></Dialog.Close>
              <button onClick={handleSave} disabled={!name.trim()}
                className="px-4 py-2.5 sm:py-2 rounded-full bg-[#1a1a1a] text-white text-[13px] font-medium hover:bg-[#333] disabled:opacity-40 cursor-pointer">
                {editId ? "Сохранить" : "Добавить"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
