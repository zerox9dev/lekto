import { useParams } from "react-router-dom";
import { BookOpen, ClipboardCheck, Sparkles } from "lucide-react";

export function StudentView() {
  const { shareId } = useParams<{ shareId: string }>();

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-zinc-900 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-semibold text-[14px] tracking-tight">Lekto</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Мои занятия</h1>
          <p className="text-[13px] text-zinc-400 mt-0.5">Портал ученика</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-[14px] font-semibold flex items-center gap-2 text-zinc-700">
            <BookOpen className="h-4 w-4" /> Уроки
          </h2>
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-8 text-center">
            <p className="text-[14px] text-zinc-400">Уроков пока нет. Ваш репетитор добавит их сюда.</p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-[14px] font-semibold flex items-center gap-2 text-zinc-700">
            <ClipboardCheck className="h-4 w-4" /> Домашние задания
          </h2>
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-8 text-center">
            <p className="text-[14px] text-zinc-400">Заданий пока нет.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
