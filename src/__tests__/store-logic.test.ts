/**
 * Lekto Store & Homework Logic Tests
 * 
 * Tests the full CRUD flow + homework types + scoring logic.
 * Run: npx vitest run src/__tests__/store-logic.test.ts
 * 
 * These tests operate on the raw store data layer (no React).
 */

import { describe, it, expect, beforeEach } from "vitest";
import type { Student, Lesson, Homework, HomeworkSection, QuizQuestion, FillBlanksContent, MatchingContent, OrderingContent, CardsContent } from "@/types/database";

// ── Helpers (mimic store logic without React hooks) ──

function uid() { return crypto.randomUUID(); }
function shareSlug() { return Math.random().toString(36).slice(2, 10); }

interface StoreData {
  students: Student[];
  lessons: Lesson[];
  homework: Homework[];
}

function createStore(): StoreData & {
  addStudent: (name: string, telegram?: string) => Student;
  addLesson: (studentId: string, title: string, date: string, notes?: string) => Lesson;
  addHomework: (data: Omit<Homework, "id" | "created_at">) => Homework;
  updateHomework: (id: string, data: Partial<Homework>) => void;
  deleteStudent: (id: string) => void;
  deleteLesson: (id: string) => void;
  deleteHomework: (id: string) => void;
} {
  const store: StoreData = { students: [], lessons: [], homework: [] };

  return {
    get students() { return store.students; },
    get lessons() { return store.lessons; },
    get homework() { return store.homework; },

    addStudent(name: string, telegram?: string) {
      const s: Student = { id: uid(), name, telegram: telegram || null, share_id: shareSlug(), tutor_id: "local", created_at: new Date().toISOString() };
      store.students.unshift(s);
      return s;
    },
    addLesson(studentId: string, title: string, date: string, notes?: string) {
      const l: Lesson = { id: uid(), student_id: studentId, tutor_id: "local", title, date, notes: notes || null, materials_url: null, created_at: new Date().toISOString() };
      store.lessons.unshift(l);
      return l;
    },
    addHomework(data: Omit<Homework, "id" | "created_at">) {
      const h: Homework = { ...data, id: uid(), created_at: new Date().toISOString() };
      store.homework.unshift(h);
      return h;
    },
    updateHomework(id: string, data: Partial<Homework>) {
      const idx = store.homework.findIndex((h) => h.id === id);
      if (idx !== -1) store.homework[idx] = { ...store.homework[idx], ...data };
    },
    deleteStudent(id: string) {
      store.students = store.students.filter((s) => s.id !== id);
      store.lessons = store.lessons.filter((l) => l.student_id !== id);
      store.homework = store.homework.filter((h) => h.student_id !== id);
    },
    deleteLesson(id: string) {
      store.homework = store.homework.filter((h) => h.lesson_id !== id);
      store.lessons = store.lessons.filter((l) => l.id !== id);
    },
    deleteHomework(id: string) {
      store.homework = store.homework.filter((h) => h.id !== id);
    },
  };
}

// ── Score calculation (mirrors student-view logic) ──

function calculateSectionScore(section: HomeworkSection, answers: any): number | null {
  switch (section.type) {
    case "quiz": {
      const questions = section.content as QuizQuestion[];
      const userAnswers = answers as number[];
      if (userAnswers.length !== questions.length) return null;
      const correct = questions.reduce((acc, q, i) => acc + (userAnswers[i] === q.correct ? 1 : 0), 0);
      return Math.round((correct / questions.length) * 100);
    }
    case "fill_blanks": {
      const content = section.content as FillBlanksContent;
      const userAnswers = answers as string[];
      if (userAnswers.length !== content.answers.length) return null;
      const correct = content.answers.reduce((acc, a, i) => acc + (a.trim().toLowerCase() === userAnswers[i].trim().toLowerCase() ? 1 : 0), 0);
      return Math.round((correct / content.answers.length) * 100);
    }
    case "matching": {
      const content = section.content as MatchingContent;
      const userPairs = answers as { left: string; right: string }[];
      const correct = content.pairs.reduce((acc, p) => {
        const match = userPairs.find((up) => up.left === p.left && up.right === p.right);
        return acc + (match ? 1 : 0);
      }, 0);
      return Math.round((correct / content.pairs.length) * 100);
    }
    case "ordering": {
      const content = section.content as OrderingContent;
      const userOrder = answers as string[];
      const correctItems = content.correct_order.map((i) => content.items[i]);
      const correct = userOrder.reduce((acc, item, i) => acc + (item === correctItems[i] ? 1 : 0), 0);
      return Math.round((correct / content.items.length) * 100);
    }
    case "cards":
    case "text":
      return null; // not gradable
  }
}

function isHomeworkCompleted(hw: Homework): boolean {
  const gradable = (hw.sections || []).filter((s) => s.type !== "text" && s.type !== "cards");
  if (gradable.length === 0) return false;
  const scores = hw.scores || {};
  return gradable.every((s) => s.id in scores);
}

function averageScore(hw: Homework): number | null {
  const scores = hw.scores || {};
  const vals = Object.values(scores);
  if (vals.length === 0) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

// ══════════════════════════════════════════════════════
// TESTS
// ══════════════════════════════════════════════════════

describe("Student CRUD", () => {
  let store: ReturnType<typeof createStore>;
  beforeEach(() => { store = createStore(); });

  it("creates a student with telegram", () => {
    const s = store.addStudent("Иван Петров", "@ivan_p");
    expect(store.students).toHaveLength(1);
    expect(s.name).toBe("Иван Петров");
    expect(s.telegram).toBe("@ivan_p");
    expect(s.share_id).toBeTruthy();
    expect(s.id).toBeTruthy();
  });

  it("creates a student without telegram", () => {
    const s = store.addStudent("Мария");
    expect(s.telegram).toBeNull();
  });

  it("deleting student cascades to lessons and homework", () => {
    const s = store.addStudent("Иван");
    const l = store.addLesson(s.id, "Урок 1", "2026-03-07");
    store.addHomework({ lesson_id: l.id, student_id: s.id, tutor_id: "local", title: "ДЗ 1", sections: [], completed: false, student_answers: null, scores: null });

    expect(store.lessons).toHaveLength(1);
    expect(store.homework).toHaveLength(1);

    store.deleteStudent(s.id);
    expect(store.students).toHaveLength(0);
    expect(store.lessons).toHaveLength(0);
    expect(store.homework).toHaveLength(0);
  });
});

describe("Lesson CRUD", () => {
  let store: ReturnType<typeof createStore>;
  let student: Student;
  beforeEach(() => { store = createStore(); student = store.addStudent("Иван"); });

  it("creates a lesson tied to student", () => {
    const l = store.addLesson(student.id, "Present Simple", "2026-03-07", "Правила и упражнения");
    expect(store.lessons).toHaveLength(1);
    expect(l.student_id).toBe(student.id);
    expect(l.title).toBe("Present Simple");
    expect(l.notes).toBe("Правила и упражнения");
  });

  it("deleting lesson cascades to homework", () => {
    const l = store.addLesson(student.id, "Урок 1", "2026-03-07");
    store.addHomework({ lesson_id: l.id, student_id: student.id, tutor_id: "local", title: "ДЗ", sections: [], completed: false, student_answers: null, scores: null });
    expect(store.homework).toHaveLength(1);
    store.deleteLesson(l.id);
    expect(store.lessons).toHaveLength(0);
    expect(store.homework).toHaveLength(0);
  });
});

describe("Homework CRUD", () => {
  let store: ReturnType<typeof createStore>;
  let student: Student;
  let lesson: Lesson;
  beforeEach(() => {
    store = createStore();
    student = store.addStudent("Иван");
    lesson = store.addLesson(student.id, "Present Simple", "2026-03-07");
  });

  it("creates homework tied to lesson and student", () => {
    const hw = store.addHomework({
      lesson_id: lesson.id, student_id: student.id, tutor_id: "local",
      title: "Домашка #1", sections: [], completed: false, student_answers: null, scores: null,
    });
    expect(hw.lesson_id).toBe(lesson.id);
    expect(hw.student_id).toBe(student.id);
    expect(hw.completed).toBe(false);
  });

  it("homework requires lesson_id (by design — always string)", () => {
    const hw = store.addHomework({
      lesson_id: lesson.id, student_id: student.id, tutor_id: "local",
      title: "ДЗ", sections: [], completed: false, student_answers: null, scores: null,
    });
    expect(hw.lesson_id).toBeTruthy();
    expect(typeof hw.lesson_id).toBe("string");
  });
});

describe("Quiz section — scoring", () => {
  const section: HomeworkSection = {
    id: "quiz-1", type: "quiz", title: "Тест по глаголам",
    content: [
      { question: "I ___ a student", options: ["am", "is", "are"], correct: 0 },
      { question: "She ___ happy", options: ["am", "is", "are"], correct: 1 },
      { question: "They ___ friends", options: ["am", "is", "are"], correct: 2 },
    ] as QuizQuestion[],
  };

  it("all correct → 100%", () => {
    expect(calculateSectionScore(section, [0, 1, 2])).toBe(100);
  });

  it("all wrong → 0%", () => {
    expect(calculateSectionScore(section, [2, 2, 0])).toBe(0);
  });

  it("1 of 3 correct → 33%", () => {
    expect(calculateSectionScore(section, [0, 0, 0])).toBe(33);
  });

  it("2 of 3 correct → 67%", () => {
    expect(calculateSectionScore(section, [0, 1, 0])).toBe(67);
  });
});

describe("Fill blanks section — scoring", () => {
  const section: HomeworkSection = {
    id: "fb-1", type: "fill_blanks", title: "Вставь слово",
    content: { text: "The ___ is blue. The ___ is green.", answers: ["sky", "grass"] } as FillBlanksContent,
  };

  it("all correct → 100%", () => {
    expect(calculateSectionScore(section, ["sky", "grass"])).toBe(100);
  });

  it("case insensitive", () => {
    expect(calculateSectionScore(section, ["SKY", "Grass"])).toBe(100);
  });

  it("with extra spaces → still correct", () => {
    expect(calculateSectionScore(section, [" sky ", " grass "])).toBe(100);
  });

  it("1 wrong → 50%", () => {
    expect(calculateSectionScore(section, ["sky", "water"])).toBe(50);
  });

  it("all wrong → 0%", () => {
    expect(calculateSectionScore(section, ["water", "fire"])).toBe(0);
  });
});

describe("Matching section — scoring", () => {
  const section: HomeworkSection = {
    id: "m-1", type: "matching", title: "Соедини",
    content: { pairs: [{ left: "cat", right: "кошка" }, { left: "dog", right: "собака" }, { left: "bird", right: "птица" }] } as MatchingContent,
  };

  it("all correct → 100%", () => {
    expect(calculateSectionScore(section, [
      { left: "cat", right: "кошка" }, { left: "dog", right: "собака" }, { left: "bird", right: "птица" },
    ])).toBe(100);
  });

  it("all swapped → 0%", () => {
    expect(calculateSectionScore(section, [
      { left: "cat", right: "собака" }, { left: "dog", right: "птица" }, { left: "bird", right: "кошка" },
    ])).toBe(0);
  });

  it("1 of 3 correct → 33%", () => {
    expect(calculateSectionScore(section, [
      { left: "cat", right: "кошка" }, { left: "dog", right: "птица" }, { left: "bird", right: "собака" },
    ])).toBe(33);
  });
});

describe("Ordering section — scoring", () => {
  const section: HomeworkSection = {
    id: "o-1", type: "ordering", title: "Расставь по порядку",
    content: { items: ["first", "second", "third", "fourth"], correct_order: [0, 1, 2, 3] } as OrderingContent,
  };

  it("correct order → 100%", () => {
    expect(calculateSectionScore(section, ["first", "second", "third", "fourth"])).toBe(100);
  });

  it("reversed → 50% (only middle 2 match by chance? no — 0 match)", () => {
    expect(calculateSectionScore(section, ["fourth", "third", "second", "first"])).toBe(0);
  });

  it("1 swap → 50%", () => {
    expect(calculateSectionScore(section, ["first", "third", "second", "fourth"])).toBe(50);
  });
});

describe("Cards & Text — not gradable", () => {
  it("cards return null score", () => {
    const section: HomeworkSection = {
      id: "c-1", type: "cards", title: "Карточки",
      content: { cards: [{ front: "hello", back: "привет" }] } as CardsContent,
    };
    expect(calculateSectionScore(section, null)).toBeNull();
  });

  it("text returns null score", () => {
    const section: HomeworkSection = {
      id: "t-1", type: "text", title: "Задание",
      content: { text: "Прочитай текст" },
    };
    expect(calculateSectionScore(section, null)).toBeNull();
  });
});

describe("Homework completion logic", () => {
  it("completed when all gradable sections have scores", () => {
    const hw: Homework = {
      id: "hw-1", lesson_id: "l-1", student_id: "s-1", tutor_id: "local",
      title: "ДЗ", created_at: "",
      sections: [
        { id: "q1", type: "quiz", title: "Тест", content: [{ question: "?", options: ["a", "b"], correct: 0 }] },
        { id: "fb1", type: "fill_blanks", title: "Вставь", content: { text: "___", answers: ["ok"] } },
        { id: "t1", type: "text", title: "Прочитай", content: { text: "text" } },
        { id: "c1", type: "cards", title: "Карточки", content: { cards: [{ front: "a", back: "b" }] } },
      ],
      completed: false,
      student_answers: null,
      scores: { q1: 100, fb1: 50 }, // both gradable done (text+cards not gradable)
    };
    expect(isHomeworkCompleted(hw)).toBe(true);
  });

  it("NOT completed when some gradable sections missing scores", () => {
    const hw: Homework = {
      id: "hw-2", lesson_id: "l-1", student_id: "s-1", tutor_id: "local",
      title: "ДЗ", created_at: "",
      sections: [
        { id: "q1", type: "quiz", title: "Тест", content: [{ question: "?", options: ["a", "b"], correct: 0 }] },
        { id: "fb1", type: "fill_blanks", title: "Вставь", content: { text: "___", answers: ["ok"] } },
      ],
      completed: false,
      student_answers: null,
      scores: { q1: 100 }, // fb1 missing
    };
    expect(isHomeworkCompleted(hw)).toBe(false);
  });

  it("homework with only text+cards is never auto-completed", () => {
    const hw: Homework = {
      id: "hw-3", lesson_id: "l-1", student_id: "s-1", tutor_id: "local",
      title: "ДЗ", created_at: "",
      sections: [
        { id: "t1", type: "text", title: "Прочитай", content: { text: "text" } },
        { id: "c1", type: "cards", title: "Карточки", content: { cards: [{ front: "a", back: "b" }] } },
      ],
      completed: false, student_answers: null, scores: null,
    };
    expect(isHomeworkCompleted(hw)).toBe(false);
  });
});

describe("Average score calculation", () => {
  it("calculates average across sections", () => {
    const hw: Homework = {
      id: "hw-1", lesson_id: "l-1", student_id: "s-1", tutor_id: "local",
      title: "ДЗ", created_at: "",
      sections: [],
      completed: true, student_answers: null,
      scores: { q1: 100, fb1: 50, m1: 75 },
    };
    expect(averageScore(hw)).toBe(75); // (100+50+75)/3 = 75
  });

  it("returns null when no scores", () => {
    const hw: Homework = {
      id: "hw-2", lesson_id: "l-1", student_id: "s-1", tutor_id: "local",
      title: "ДЗ", created_at: "",
      sections: [], completed: false, student_answers: null, scores: null,
    };
    expect(averageScore(hw)).toBeNull();
  });

  it("single score → that score", () => {
    const hw: Homework = {
      id: "hw-3", lesson_id: "l-1", student_id: "s-1", tutor_id: "local",
      title: "ДЗ", created_at: "",
      sections: [], completed: false, student_answers: null,
      scores: { q1: 67 },
    };
    expect(averageScore(hw)).toBe(67);
  });
});

describe("Full flow: student → lesson → homework → answer → score", () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => { store = createStore(); });

  it("complete flow with multi-section homework", () => {
    // 1. Create student
    const student = store.addStudent("Анна Иванова", "@anna_i");
    expect(store.students).toHaveLength(1);

    // 2. Create lesson
    const lesson = store.addLesson(student.id, "Past Simple", "2026-03-07", "Правила образования Past Simple");
    expect(store.lessons).toHaveLength(1);
    expect(lesson.student_id).toBe(student.id);

    // 3. Create homework with 4 sections
    const quizSection: HomeworkSection = {
      id: "sec-quiz", type: "quiz", title: "Тест",
      content: [
        { question: "I ___ to school yesterday", options: ["go", "went", "gone"], correct: 1 },
        { question: "She ___ a book last night", options: ["read", "reads", "reading"], correct: 0 },
      ] as QuizQuestion[],
    };

    const fillSection: HomeworkSection = {
      id: "sec-fill", type: "fill_blanks", title: "Заполни пропуски",
      content: { text: "He ___ (play) football. They ___ (watch) TV.", answers: ["played", "watched"] } as FillBlanksContent,
    };

    const cardsSection: HomeworkSection = {
      id: "sec-cards", type: "cards", title: "Неправильные глаголы",
      content: { cards: [{ front: "go", back: "went" }, { front: "see", back: "saw" }] } as CardsContent,
    };

    const textSection: HomeworkSection = {
      id: "sec-text", type: "text", title: "Прочитай правило",
      content: { text: "Past Simple используется для действий в прошлом." },
    };

    const hw = store.addHomework({
      lesson_id: lesson.id, student_id: student.id, tutor_id: "local",
      title: "Домашка: Past Simple",
      sections: [quizSection, fillSection, cardsSection, textSection],
      completed: false, student_answers: null, scores: null,
    });

    expect(store.homework).toHaveLength(1);
    expect(hw.sections).toHaveLength(4);
    expect(hw.lesson_id).toBe(lesson.id);

    // 4. Student answers quiz — all correct
    const quizScore = calculateSectionScore(quizSection, [1, 0]);
    expect(quizScore).toBe(100);

    // 5. Student answers fill blanks — 1 wrong
    const fillScore = calculateSectionScore(fillSection, ["played", "saw"]);
    expect(fillScore).toBe(50);

    // 6. Update homework with scores
    const scores = { "sec-quiz": quizScore!, "sec-fill": fillScore! };
    store.updateHomework(hw.id, { scores });

    const updated = store.homework.find((h) => h.id === hw.id)!;
    expect(updated.scores).toEqual({ "sec-quiz": 100, "sec-fill": 50 });

    // 7. Check completion — both gradable sections answered
    expect(isHomeworkCompleted(updated)).toBe(true);

    // 8. Mark as completed
    store.updateHomework(hw.id, { completed: true });
    const final = store.homework.find((h) => h.id === hw.id)!;
    expect(final.completed).toBe(true);

    // 9. Average score
    expect(averageScore(final)).toBe(75); // (100+50)/2
  });

  it("multiple lessons with separate homework", () => {
    const s = store.addStudent("Борис");
    const l1 = store.addLesson(s.id, "Урок 1", "2026-03-01");
    const l2 = store.addLesson(s.id, "Урок 2", "2026-03-07");

    store.addHomework({ lesson_id: l1.id, student_id: s.id, tutor_id: "local", title: "ДЗ 1", sections: [], completed: false, student_answers: null, scores: null });
    store.addHomework({ lesson_id: l1.id, student_id: s.id, tutor_id: "local", title: "ДЗ 1b", sections: [], completed: false, student_answers: null, scores: null });
    store.addHomework({ lesson_id: l2.id, student_id: s.id, tutor_id: "local", title: "ДЗ 2", sections: [], completed: false, student_answers: null, scores: null });

    // Filter homework by lesson
    const l1hw = store.homework.filter((h) => h.lesson_id === l1.id);
    const l2hw = store.homework.filter((h) => h.lesson_id === l2.id);
    expect(l1hw).toHaveLength(2);
    expect(l2hw).toHaveLength(1);

    // Delete lesson 1 → cascades homework
    store.deleteLesson(l1.id);
    expect(store.homework).toHaveLength(1);
    expect(store.homework[0].lesson_id).toBe(l2.id);
  });

  it("delete student cascades everything", () => {
    const s = store.addStudent("Карина");
    const l = store.addLesson(s.id, "Урок", "2026-03-07");
    store.addHomework({ lesson_id: l.id, student_id: s.id, tutor_id: "local", title: "ДЗ", sections: [], completed: false, student_answers: null, scores: null });

    store.deleteStudent(s.id);
    expect(store.students).toHaveLength(0);
    expect(store.lessons).toHaveLength(0);
    expect(store.homework).toHaveLength(0);
  });
});

describe("Edge cases", () => {
  it("quiz with single question, wrong answer", () => {
    const section: HomeworkSection = {
      id: "q", type: "quiz", title: "Q",
      content: [{ question: "2+2?", options: ["3", "4", "5"], correct: 1 }] as QuizQuestion[],
    };
    expect(calculateSectionScore(section, [0])).toBe(0);
    expect(calculateSectionScore(section, [1])).toBe(100);
  });

  it("fill blanks with single blank", () => {
    const section: HomeworkSection = {
      id: "fb", type: "fill_blanks", title: "FB",
      content: { text: "Hello ___", answers: ["world"] } as FillBlanksContent,
    };
    expect(calculateSectionScore(section, ["world"])).toBe(100);
    expect(calculateSectionScore(section, ["WORLD"])).toBe(100); // case insensitive
    expect(calculateSectionScore(section, ["earth"])).toBe(0);
  });

  it("ordering with 2 items", () => {
    const section: HomeworkSection = {
      id: "o", type: "ordering", title: "O",
      content: { items: ["A", "B"], correct_order: [0, 1] } as OrderingContent,
    };
    expect(calculateSectionScore(section, ["A", "B"])).toBe(100);
    expect(calculateSectionScore(section, ["B", "A"])).toBe(0);
  });

  it("matching with single pair", () => {
    const section: HomeworkSection = {
      id: "m", type: "matching", title: "M",
      content: { pairs: [{ left: "A", right: "1" }] } as MatchingContent,
    };
    expect(calculateSectionScore(section, [{ left: "A", right: "1" }])).toBe(100);
    expect(calculateSectionScore(section, [{ left: "A", right: "2" }])).toBe(0);
  });

  it("empty scores → null average", () => {
    const hw: Homework = {
      id: "h", lesson_id: "l", student_id: "s", tutor_id: "t",
      title: "H", created_at: "", sections: [],
      completed: false, student_answers: null, scores: {},
    };
    expect(averageScore(hw)).toBeNull();
  });
});
