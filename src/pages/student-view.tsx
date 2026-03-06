import { useParams } from "react-router-dom";
import { BookOpen, ClipboardCheck } from "lucide-react";

export function StudentView() {
  const { shareId } = useParams<{ shareId: string }>();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-indigo-500 text-white font-bold text-xs flex items-center justify-center">L</div>
          <span className="font-bold">Lekto</span>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Lessons</h1>
          <p className="text-sm text-gray-500">Student portal</p>
        </div>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2"><BookOpen className="h-5 w-5" /> Lessons</h2>
          <div className="rounded-xl bg-white border border-gray-200 p-6 text-center text-sm text-gray-400">
            No lessons yet. Your tutor will add them here.
          </div>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2"><ClipboardCheck className="h-5 w-5" /> Homework</h2>
          <div className="rounded-xl bg-white border border-gray-200 p-6 text-center text-sm text-gray-400">
            No homework yet.
          </div>
        </section>
      </main>
    </div>
  );
}
