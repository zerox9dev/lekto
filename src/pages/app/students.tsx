import { Plus, Copy, ExternalLink, Trash2 } from "lucide-react";

export function StudentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-sm text-gray-500">0 students</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors">
          <Plus className="h-4 w-4" /> Add Student
        </button>
      </div>
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg mb-2">No students yet</p>
        <p className="text-sm">Add your first student to get started.</p>
      </div>
    </div>
  );
}
