export interface Student {
  id: string;
  name: string;
  email: string | null;
  share_id: string;
  tutor_id: string;
  created_at: string;
}

export interface Lesson {
  id: string;
  student_id: string;
  tutor_id: string;
  title: string;
  date: string;
  notes: string | null;
  materials_url: string | null;
  created_at: string;
}

export type HomeworkType = "quiz" | "fill_blanks" | "matching" | "ordering" | "text";

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

export interface FillBlanksContent {
  text: string; // "The capital of France is ___"
  answers: string[];
}

export interface MatchingContent {
  pairs: { left: string; right: string }[];
}

export interface OrderingContent {
  items: string[];
  correct_order: number[];
}

export interface Homework {
  id: string;
  lesson_id: string;
  student_id: string;
  tutor_id: string;
  title: string;
  type: HomeworkType;
  content: QuizQuestion[] | FillBlanksContent | MatchingContent | OrderingContent | { text: string };
  completed: boolean;
  student_answers: any | null;
  score: number | null;
  created_at: string;
}
