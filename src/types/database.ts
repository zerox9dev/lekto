export interface Student {
  id: string;
  name: string;
  telegram: string | null;
  share_id: string;
  tutor_id: string;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
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
  sections?: HomeworkSection[];
  course_id?: string | null;
  order_index?: number;
  created_at: string;
}

export type HomeworkType = "quiz" | "fill_blanks" | "matching" | "ordering" | "text" | "cards" | "true_false" | "open_answer" | "media";

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number | number[]; // single index OR array of correct indices (multi-select)
  explanation?: string; // shown after answer check
  image?: string; // optional image URL shown above the question
}

export interface TrueFalseQuestion {
  statement: string;
  correct: boolean; // true = "Верно", false = "Неверно"
  explanation?: string;
}

export interface TrueFalseContent {
  questions: TrueFalseQuestion[];
}

export interface OpenAnswerContent {
  prompt: string; // question / task for student
  placeholder?: string; // hint text in textarea
  min_length?: number; // optional minimum chars
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

export interface CardsContent {
  cards: { front: string; back: string; image?: string }[];
}

export interface MediaFile {
  id: string;
  name: string;
  url: string;       // Supabase Storage URL or blob URL for preview
  type: "image" | "pdf" | "audio";
  size: number;      // bytes
}

export interface MediaContent {
  files: MediaFile[];
  caption?: string;
}

export interface HomeworkSection {
  id: string;
  type: HomeworkType;
  title: string;
  content: QuizQuestion[] | FillBlanksContent | MatchingContent | OrderingContent | CardsContent | TrueFalseContent | OpenAnswerContent | MediaContent | { text: string };
}

export interface HomeworkTemplate {
  id: string;
  title: string;
  sections: HomeworkSection[];
  created_at: string;
}

export interface Homework {
  id: string;
  lesson_id: string;
  student_id: string;
  tutor_id: string;
  title: string;
  sections: HomeworkSection[];
  completed: boolean;
  student_answers: Record<string, any> | null;
  scores: Record<string, number> | null;
  created_at: string;
}
