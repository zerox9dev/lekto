import { useState } from "react";
import { Plus, Copy, ExternalLink, Trash2 } from "lucide-react";

export function StudentsPage() {
  const [students] = useState<{ id: string; name: string; shareId: string; lessonsCount: number }[]>([]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-sm text-[var(--muted-foreground)]">{students.length} students</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90">
          <Plus className="h-4 w-4" /> Add Student
        </button>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <p className="text-lg mb-2">No students yet</p>
          <p className="text-sm">Add your first student to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {students.map((s) => (
            <div key={s.id} className="rounded-xl border p-4 flex items-center justify-between hover:bg-[var(--muted)]/50 transition-colors">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{s.lessonsCount} lessons</p>
              </div>
              <div className="flex items-center gap-2">
                <button title="Copy link" className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors">
                  <Copy className="h-4 w-4 text-[var(--muted-foreground)]" />
                </button>
                <a href={`/s/${s.shareId}`} target="_blank" className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors">
                  <ExternalLink className="h-4 w-4 text-[var(--muted-foreground)]" />
                </a>
                <button className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors">
                  <Trash2 className="h-4 w-4 text-[var(--destructive)]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
