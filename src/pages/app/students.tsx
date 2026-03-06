import { useState } from "react";
import { Plus, Copy, ExternalLink, Trash2, Pencil, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import * as Dialog from "@radix-ui/react-dialog";

export function StudentsPage() {
  const { students, addStudent, updateStudent, deleteStudent } = useStore();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [telegram, setTelegram] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

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

  const handleEdit = (s: typeof students[0]) => {
    setEditId(s.id);
    setName(s.name);
    setTelegram(s.telegram || "");
    setOpen(true);
  };

  const handleNew = () => {
    setEditId(null);
    setName("");
    setTelegram("");
    setOpen(true);
  };

  const copyLink = (shareId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/s/${shareId}`);
    setCopied(shareId);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Ученики</h1>
          <p className="text-[13px] text-zinc-400 mt-0.5">{students.length} {students.length === 1 ? "ученик" : "учеников"}</p>
        </div>
        <button
          onClick={handleNew}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white text-[13px] font-medium hover:bg-zinc-800 active:bg-zinc-700 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Добавить
        </button>
      </div>

      {students.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white py-20 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
            <Plus className="h-5 w-5 text-zinc-400" />
          </div>
          <p className="text-[15px] font-medium text-zinc-900 mb-1">Пока нет учеников</p>
          <p className="text-[13px] text-zinc-400">Добавьте первого ученика, чтобы начать</p>
        </div>
      ) : (
        <div className="space-y-2">
          {students.map((s) => (
            <div key={s.id} className="rounded-xl border border-zinc-200 bg-white px-4 py-3 flex items-center gap-4 group hover:border-zinc-300 transition-colors">
              <img
                src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(s.name)}`}
                alt={s.name}
                className="h-9 w-9 rounded-full bg-zinc-100 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium truncate">{s.name}</p>
                {s.telegram && <p className="text-[12px] text-zinc-400 truncate">@{s.telegram.replace(/^@/, "")}</p>}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => copyLink(s.share_id)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-zinc-100 transition-colors cursor-pointer"
                  title="Скопировать ссылку"
                >
                  {copied === s.share_id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-zinc-400" />}
                </button>
                <a
                  href={`/s/${s.share_id}`}
                  target="_blank"
                  className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-zinc-100 transition-colors"
                  title="Открыть портал ученика"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                </a>
                <button
                  onClick={() => handleEdit(s)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-zinc-100 transition-colors cursor-pointer"
                  title="Редактировать"
                >
                  <Pencil className="h-3.5 w-3.5 text-zinc-400" />
                </button>
                <button
                  onClick={() => deleteStudent(s.id)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer"
                  title="Удалить"
                >
                  <Trash2 className="h-3.5 w-3.5 text-zinc-400 hover:text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl z-50 space-y-5">
            <Dialog.Title className="text-lg font-bold">
              {editId ? "Редактировать ученика" : "Новый ученик"}
            </Dialog.Title>
            <div className="space-y-3">
              <div>
                <label className="text-[12px] font-medium text-zinc-500 mb-1 block">Имя *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Иван Петров"
                  className="w-full h-10 rounded-xl border border-zinc-200 px-3 text-[14px] outline-none focus:border-zinc-400 transition-colors"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-zinc-500 mb-1 block">Telegram</label>
                <input
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder="@username"
                  className="w-full h-10 rounded-xl border border-zinc-200 px-3 text-[14px] outline-none focus:border-zinc-400 transition-colors"
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
                disabled={!name.trim()}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-[13px] font-medium hover:bg-zinc-800 transition-colors disabled:opacity-40 cursor-pointer"
              >
                {editId ? "Сохранить" : "Добавить"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
