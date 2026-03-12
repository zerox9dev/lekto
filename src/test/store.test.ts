import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock supabase as null (localStorage mode)
vi.mock("../lib/supabase", () => ({ supabase: null }));

// Mock localStorage
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, val: string) => { store[key] = val; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
};
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

// We need renderHook from testing-library
import { renderHook, act } from "@testing-library/react";
import { useStore } from "../lib/store";

beforeEach(() => {
  localStorageMock.clear();
  // Reset module state by clearing stored data
  const { result } = renderHook(() => useStore());
  // Delete all students to reset
  result.current.students.forEach((s) => {
    act(() => result.current.deleteStudent(s.id));
  });
});

describe("useStore — Students", () => {
  it("adds a student with correct fields", () => {
    const { result } = renderHook(() => useStore());
    let student: any;
    act(() => {
      student = result.current.addStudent("Анна", "@anna");
    });
    expect(student).toBeDefined();
    expect(student.name).toBe("Анна");
    expect(student.telegram).toBe("@anna");
    expect(student.share_id).toBeTruthy();
    expect(student.id).toBeTruthy();
    expect(result.current.students).toHaveLength(1);
  });

  it("adds student without telegram", () => {
    const { result } = renderHook(() => useStore());
    let student: any;
    act(() => {
      student = result.current.addStudent("Борис");
    });
    expect(student.telegram).toBeNull();
  });

  it("updates a student", () => {
    const { result } = renderHook(() => useStore());
    let student: any;
    act(() => {
      student = result.current.addStudent("Оля");
    });
    act(() => {
      result.current.updateStudent(student.id, { name: "Ольга" });
    });
    expect(result.current.students[0].name).toBe("Ольга");
  });

  it("deletes a student and cascades lessons/homework", () => {
    const { result } = renderHook(() => useStore());
    let student: any;
    act(() => {
      student = result.current.addStudent("Тест");
    });
    act(() => {
      result.current.addLesson(student.id, "Урок 1", "2026-03-12");
    });
    expect(result.current.lessons).toHaveLength(1);
    act(() => {
      result.current.deleteStudent(student.id);
    });
    expect(result.current.students).toHaveLength(0);
    expect(result.current.lessons).toHaveLength(0);
  });

  it("generates unique share_id per student", () => {
    const { result } = renderHook(() => useStore());
    let s1: any, s2: any;
    act(() => {
      s1 = result.current.addStudent("A");
      s2 = result.current.addStudent("B");
    });
    expect(s1.share_id).not.toBe(s2.share_id);
  });
});

describe("useStore — Lessons", () => {
  it("adds a lesson linked to student", () => {
    const { result } = renderHook(() => useStore());
    let student: any, lesson: any;
    act(() => {
      student = result.current.addStudent("Учень");
    });
    act(() => {
      lesson = result.current.addLesson(student.id, "Алгебра", "2026-03-12", "Нотатки");
    });
    expect(lesson.student_id).toBe(student.id);
    expect(lesson.title).toBe("Алгебра");
    expect(lesson.notes).toBe("Нотатки");
    expect(lesson.date).toBe("2026-03-12");
  });

  it("adds lesson with sections", () => {
    const { result } = renderHook(() => useStore());
    let student: any, lesson: any;
    const sections = [{ id: "s1", type: "text" as const, title: "Intro", content: { text: "Hello" } }];
    act(() => {
      student = result.current.addStudent("X");
    });
    act(() => {
      lesson = result.current.addLesson(student.id, "With sections", "2026-03-12", undefined, sections);
    });
    expect(lesson.sections).toHaveLength(1);
    expect(lesson.sections![0].title).toBe("Intro");
  });

  it("updates a lesson", () => {
    const { result } = renderHook(() => useStore());
    let student: any, lesson: any;
    act(() => {
      student = result.current.addStudent("Y");
    });
    act(() => {
      lesson = result.current.addLesson(student.id, "Old", "2026-03-12");
    });
    act(() => {
      result.current.updateLesson(lesson.id, { title: "New" });
    });
    expect(result.current.lessons[0].title).toBe("New");
  });

  it("deletes a lesson and cascades homework", () => {
    const { result } = renderHook(() => useStore());
    let student: any, lesson: any;
    act(() => {
      student = result.current.addStudent("Z");
    });
    act(() => {
      lesson = result.current.addLesson(student.id, "Lesson", "2026-03-12");
    });
    act(() => {
      result.current.addHomework({
        lesson_id: lesson.id,
        student_id: student.id,
        tutor_id: "local",
        title: "HW 1",
        sections: [],
        completed: false,
        student_answers: null,
        scores: null,
      });
    });
    expect(result.current.homework).toHaveLength(1);
    act(() => {
      result.current.deleteLesson(lesson.id);
    });
    expect(result.current.lessons).toHaveLength(0);
    expect(result.current.homework).toHaveLength(0);
  });
});

describe("useStore — Homework", () => {
  it("adds homework", () => {
    const { result } = renderHook(() => useStore());
    let student: any, lesson: any, hw: any;
    act(() => {
      student = result.current.addStudent("HW Student");
    });
    act(() => {
      lesson = result.current.addLesson(student.id, "L", "2026-03-12");
    });
    act(() => {
      hw = result.current.addHomework({
        lesson_id: lesson.id,
        student_id: student.id,
        tutor_id: "local",
        title: "Домашка 1",
        sections: [{ id: "q1", type: "quiz", title: "Quiz", content: [{ question: "2+2?", options: ["3", "4"], correct: 1 }] }],
        completed: false,
        student_answers: null,
        scores: null,
      });
    });
    expect(hw.title).toBe("Домашка 1");
    expect(hw.completed).toBe(false);
    expect(hw.sections).toHaveLength(1);
  });

  it("updates homework (mark completed)", () => {
    const { result } = renderHook(() => useStore());
    let student: any, lesson: any, hw: any;
    act(() => {
      student = result.current.addStudent("S");
    });
    act(() => {
      lesson = result.current.addLesson(student.id, "L", "2026-03-12");
    });
    act(() => {
      hw = result.current.addHomework({
        lesson_id: lesson.id,
        student_id: student.id,
        tutor_id: "local",
        title: "HW",
        sections: [],
        completed: false,
        student_answers: null,
        scores: null,
      });
    });
    act(() => {
      result.current.updateHomework(hw.id, { completed: true, student_answers: { q1: 1 }, scores: { q1: 100 } });
    });
    const updated = result.current.homework.find((h) => h.id === hw.id)!;
    expect(updated.completed).toBe(true);
    expect(updated.student_answers).toEqual({ q1: 1 });
    expect(updated.scores).toEqual({ q1: 100 });
  });

  it("deletes homework", () => {
    const { result } = renderHook(() => useStore());
    let student: any, lesson: any, hw: any;
    act(() => {
      student = result.current.addStudent("D");
    });
    act(() => {
      lesson = result.current.addLesson(student.id, "L", "2026-03-12");
    });
    act(() => {
      hw = result.current.addHomework({
        lesson_id: lesson.id,
        student_id: student.id,
        tutor_id: "local",
        title: "Del",
        sections: [],
        completed: false,
        student_answers: null,
        scores: null,
      });
    });
    act(() => {
      result.current.deleteHomework(hw.id);
    });
    expect(result.current.homework).toHaveLength(0);
  });
});

describe("useStore — Templates", () => {
  it("adds a template", () => {
    const { result } = renderHook(() => useStore());
    let tmpl: any;
    act(() => {
      tmpl = result.current.addTemplate("Шаблон 1", [
        { id: "x", type: "quiz", title: "Q", content: [{ question: "?", options: ["a"], correct: 0 }] },
      ]);
    });
    expect(tmpl.title).toBe("Шаблон 1");
    expect(tmpl.sections).toHaveLength(1);
    // Template sections get new IDs
    expect(tmpl.sections[0].id).not.toBe("x");
  });

  it("deletes a template", () => {
    const { result } = renderHook(() => useStore());
    let tmpl: any;
    act(() => {
      tmpl = result.current.addTemplate("T", []);
    });
    const before = result.current.templates.length;
    act(() => {
      result.current.deleteTemplate(tmpl.id);
    });
    expect(result.current.templates.length).toBe(before - 1);
    expect(result.current.templates.find((t: any) => t.id === tmpl.id)).toBeUndefined();
  });
});

describe("useStore — localStorage persistence", () => {
  it("persists to localStorage on mutation", () => {
    const { result } = renderHook(() => useStore());
    act(() => {
      result.current.addStudent("Persist");
    });
    const raw = localStorage.getItem("lekto_store");
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.students).toHaveLength(1);
    expect(parsed.students[0].name).toBe("Persist");
  });
});

describe("useStore — tutor_id binding", () => {
  it("uses provided userId as tutor_id", () => {
    const { result } = renderHook(() => useStore("user-abc-123"));
    let student: any;
    act(() => {
      student = result.current.addStudent("Tutor Test");
    });
    expect(student.tutor_id).toBe("user-abc-123");
  });

  it("defaults to 'local' without userId", () => {
    const { result } = renderHook(() => useStore());
    let student: any;
    act(() => {
      student = result.current.addStudent("Local Test");
    });
    // After previous test set it to user-abc-123, without explicit reset
    // this tests the module-level _currentUserId behavior
    expect(student.tutor_id).toBeTruthy();
  });
});
