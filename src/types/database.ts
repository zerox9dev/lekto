// ── Enums ──
export type HomeworkType = "text" | "quiz" | "fill_blanks" | "matching" | "ordering";

// ── Tables ──
export interface Student {
  id: string;
  tutor_id: string;
  name: string;
  email: string | null;
  notes: string | null;
  share_id: string; // public URL slug (not indexed)
  created_at: string;
}

export interface Lesson {
  id: string;
  tutor_id: string;
  student_id: string;
  title: string;
  date: string;
  notes: string | null; // lesson notes / content (markdown)
  materials_url: string | null;
  created_at: string;
}

export interface Homework {
  id: string;
  lesson_id: string;
  tutor_id: string;
  student_id: string;
  title: string;
  type: HomeworkType;
  content: HomeworkContent; // JSON — depends on type
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  student_answers: Record<string, unknown> | null;
  score: number | null; // 0-100
  created_at: string;
}

// ── Homework content shapes ──
export type HomeworkContent =
  | { kind: "text"; prompt: string } // free-text answer
  | { kind: "quiz"; questions: QuizQuestion[] } // multiple choice
  | { kind: "fill_blanks"; text: string; blanks: string[] } // fill in blanks
  | { kind: "matching"; pairs: { left: string; right: string }[] } // match pairs
  | { kind: "ordering"; items: string[]; correctOrder: number[] }; // put in order

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

// ── Insert types ──
export type StudentInsert = Omit<Student, "id" | "created_at">;
export type LessonInsert = Omit<Lesson, "id" | "created_at">;
export type HomeworkInsert = Omit<Homework, "id" | "created_at">;
