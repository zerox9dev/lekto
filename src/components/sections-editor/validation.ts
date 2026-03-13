import type { HomeworkSection, QuizQuestion, FillBlanksContent, MatchingContent, OrderingContent, CardsContent, TrueFalseContent, OpenAnswerContent, MediaContent } from "@/types/database";

export interface ValidationError { sectionIndex: number; message: string; }

function getCorrectIndices(q: QuizQuestion): number[] {
  return Array.isArray(q.correct) ? q.correct : [q.correct];
}

export function validateSections(sections: HomeworkSection[]): ValidationError[] {
  const errors: ValidationError[] = [];
  sections.forEach((sec, i) => {
    if (!sec.title.trim()) errors.push({ sectionIndex: i, message: "Нет названия секции" });
    if (sec.type === "quiz") {
      const qs = sec.content as QuizQuestion[];
      if (qs.length === 0) { errors.push({ sectionIndex: i, message: "Нет вопросов" }); return; }
      qs.forEach((q, qi) => {
        if (!q.question.trim()) errors.push({ sectionIndex: i, message: `Вопрос ${qi + 1}: пустой текст` });
        if (q.options.some((o) => !o.trim())) errors.push({ sectionIndex: i, message: `Вопрос ${qi + 1}: пустой вариант` });
        if (q.options.length < 2) errors.push({ sectionIndex: i, message: `Вопрос ${qi + 1}: нужно минимум 2 варианта` });
        const correct = getCorrectIndices(q);
        if (correct.length === 0) errors.push({ sectionIndex: i, message: `Вопрос ${qi + 1}: не выбран правильный ответ` });
      });
    }
    if (sec.type === "fill_blanks") {
      const c = sec.content as FillBlanksContent;
      if (!c.text.trim()) errors.push({ sectionIndex: i, message: "Пустой текст" });
      if (!(c.text.match(/___/g) || []).length) errors.push({ sectionIndex: i, message: "Нет пропусков (___)" });
      if (c.answers.some((a) => !a.trim())) errors.push({ sectionIndex: i, message: "Пустой ответ" });
    }
    if (sec.type === "matching") {
      const c = sec.content as MatchingContent;
      if (c.pairs.length < 2) errors.push({ sectionIndex: i, message: "Нужно минимум 2 пары" });
      if (c.pairs.some((p) => !p.left.trim() || !p.right.trim())) errors.push({ sectionIndex: i, message: "Пустая пара" });
    }
    if (sec.type === "ordering") {
      const c = sec.content as OrderingContent;
      if (c.items.length < 2) errors.push({ sectionIndex: i, message: "Нужно минимум 2 элемента" });
      if (c.items.some((it) => !it.trim())) errors.push({ sectionIndex: i, message: "Пустой элемент" });
    }
    if (sec.type === "cards") {
      const c = sec.content as CardsContent;
      if (c.cards.length === 0) errors.push({ sectionIndex: i, message: "Нет карточек" });
      if (c.cards.some((card) => !card.front.trim() || !card.back.trim())) errors.push({ sectionIndex: i, message: "Пустая карточка" });
    }
    if (sec.type === "true_false") {
      const c = sec.content as TrueFalseContent;
      if (c.questions.length === 0) { errors.push({ sectionIndex: i, message: "Нет утверждений" }); return; }
      c.questions.forEach((q, qi) => {
        if (!q.statement.trim()) errors.push({ sectionIndex: i, message: `Утверждение ${qi + 1}: пустой текст` });
      });
    }
    if (sec.type === "open_answer") {
      const c = sec.content as OpenAnswerContent;
      if (!c.prompt.trim()) errors.push({ sectionIndex: i, message: "Пустой вопрос" });
    }
    if (sec.type === "text") {
      const c = sec.content as { text: string };
      if (!c.text.trim()) errors.push({ sectionIndex: i, message: "Пустой текст" });
    }
    if (sec.type === "media") {
      const c = sec.content as MediaContent;
      if (c.files.length === 0) errors.push({ sectionIndex: i, message: "Нет файлов" });
    }
  });
  return errors;
}
