import { Plus } from "lucide-react";

export function StudentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Ученики</h1>
          <p className="text-[13px] text-zinc-400 mt-0.5">0 учеников</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white text-[13px] font-medium hover:bg-zinc-800 active:bg-zinc-700 transition-colors cursor-pointer">
          <Plus className="h-4 w-4" />
          Добавить
        </button>
      </div>

      {/* Empty state */}
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-white py-20 text-center">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
          <Plus className="h-5 w-5 text-zinc-400" />
        </div>
        <p className="text-[15px] font-medium text-zinc-900 mb-1">Пока нет учеников</p>
        <p className="text-[13px] text-zinc-400">Добавьте первого ученика, чтобы начать</p>
      </div>
    </div>
  );
}
