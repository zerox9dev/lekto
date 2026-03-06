import { BookOpen } from "lucide-react";

export function LessonsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Уроки</h1>
        <p className="text-[13px] text-zinc-400 mt-0.5">Конспекты и материалы к занятиям</p>
      </div>

      <div className="rounded-2xl border border-dashed border-zinc-200 bg-white py-20 text-center">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
          <BookOpen className="h-5 w-5 text-zinc-400" />
        </div>
        <p className="text-[15px] font-medium text-zinc-900 mb-1">Уроков пока нет</p>
        <p className="text-[13px] text-zinc-400">Сначала добавьте ученика, потом создайте урок</p>
      </div>
    </div>
  );
}
