import { z } from 'zod'

// ── Section content schemas ──

const quizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).min(2),
  correct: z.union([z.number(), z.array(z.number())]),
  explanation: z.string().optional(),
})

const fillBlanksSchema = z.object({
  text: z.string(),
  answers: z.array(z.string()).min(1),
})

const matchingSchema = z.object({
  pairs: z.array(z.object({ left: z.string(), right: z.string() })).min(2),
})

const orderingSchema = z.object({
  items: z.array(z.string()).min(2),
  correct_order: z.array(z.number()),
})

const cardsSchema = z.object({
  cards: z.array(z.object({ front: z.string(), back: z.string() })).min(1),
})

const trueFalseSchema = z.object({
  questions: z.array(z.object({
    statement: z.string(),
    correct: z.boolean(),
    explanation: z.string().optional(),
  })).min(1),
})

const openAnswerSchema = z.object({
  prompt: z.string(),
  placeholder: z.string().optional(),
  min_length: z.number().optional(),
})

const textSchema = z.object({
  text: z.string(),
})

// ── Section schema ──

export const sectionSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['quiz', 'fill_blanks', 'matching', 'ordering', 'cards', 'true_false', 'open_answer', 'text']),
  title: z.string(),
  content: z.any(),
}).transform((s) => ({
  ...s,
  id: s.id || crypto.randomUUID(),
}))

// ── AI response schemas ──

export const aiLessonSchema = z.object({
  notes: z.string().optional(),
  sections: z.array(sectionSchema).min(1),
})

export const aiHomeworkSchema = z.object({
  sections: z.array(sectionSchema).min(1),
})

// ── Content validators (for strict mode) ──

const contentValidators: Record<string, z.ZodType> = {
  quiz: z.array(quizQuestionSchema),
  fill_blanks: fillBlanksSchema,
  matching: matchingSchema,
  ordering: orderingSchema,
  cards: cardsSchema,
  true_false: trueFalseSchema,
  open_answer: openAnswerSchema,
  text: textSchema,
}

export function validateSectionContent(type: string, content: unknown): boolean {
  const validator = contentValidators[type]
  if (!validator) return false
  return validator.safeParse(content).success
}
