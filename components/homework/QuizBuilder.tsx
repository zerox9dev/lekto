'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { SelectField } from '@/components/ui/SelectField'
import { Label } from '@/components/ui/Label'
import {
  buildQuizDefinition,
  normalizeQuizSchema,
  parseQuizDefinition,
  type QuizDefinition,
  type QuizQuestion,
  type QuizQuestionType,
} from '@/lib/homework-quiz'

interface QuizBuilderProps {
  value: QuizDefinition | null
  onChange: (value: QuizDefinition | null) => void
}

const QUESTION_TYPE_OPTIONS = [
  { value: 'short_text', label: 'Короткий текст' },
  { value: 'long_text', label: 'Длинный текст' },
  { value: 'single_choice', label: 'Один вариант (radio)' },
  { value: 'multiple_choice', label: 'Несколько вариантов' },
  { value: 'dropdown_choice', label: 'Выпадающий список' },
  { value: 'true_false', label: 'Да / Нет' },
  { value: 'number', label: 'Число' },
  { value: 'scale', label: 'Шкала (range)' },
  { value: 'date', label: 'Дата' },
] as const

function createQuestion(type: QuizQuestionType): QuizQuestion {
  return {
    id: crypto.randomUUID(),
    type,
    title: '',
    required: false,
    options:
      type === 'single_choice' || type === 'multiple_choice' || type === 'dropdown_choice'
        ? ['Вариант 1', 'Вариант 2']
        : [],
    min: 1,
    max: 10,
  }
}

function supportsOptions(type: QuizQuestionType): boolean {
  return type === 'single_choice' || type === 'multiple_choice' || type === 'dropdown_choice'
}

function supportsScale(type: QuizQuestionType): boolean {
  return type === 'scale'
}

export function QuizBuilder({ value, onChange }: QuizBuilderProps) {
  const normalized = normalizeQuizSchema(value)
  const externalKey = useMemo(() => JSON.stringify(normalized ?? null), [normalized])
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => parseQuizDefinition(normalized))

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuestions(parseQuizDefinition(normalizeQuizSchema(value)))
  }, [externalKey, value])

  function applyQuestions(next: QuizQuestion[]) {
    setQuestions(next)
    onChange(buildQuizDefinition(next))
  }

  function updateQuestion(id: string, patch: Partial<QuizQuestion>) {
    applyQuestions(questions.map((q) => (q.id === id ? { ...q, ...patch } : q)))
  }

  function removeQuestion(id: string) {
    applyQuestions(questions.filter((q) => q.id !== id))
  }

  function addQuestion(type: QuizQuestionType) {
    applyQuestions([...questions, createQuestion(type)])
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Добавьте интерактивы: тесты, true/false, шкалу, дату, текстовые и числовые ответы.
        </p>
        <Button type="button" size="sm" variant="secondary" onClick={() => applyQuestions([])}>
          Очистить
        </Button>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Быстро добавить</p>
        <div className="flex flex-wrap gap-2">
          {QUESTION_TYPE_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => addQuestion(opt.value as QuizQuestionType)}
            >
              <Plus className="w-3.5 h-3.5" />
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {questions.length === 0 ? (
        <p className="text-xs text-gray-400">Интерактивы не добавлены.</p>
      ) : (
        <div className="space-y-3">
          {questions.map((question, index) => (
            <div key={question.id} className="rounded-lg border border-gray-200 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Интерактив {index + 1}
                </p>
                <Button type="button" size="sm" variant="ghost" onClick={() => removeQuestion(question.id)}>
                  <X className="w-3.5 h-3.5" />
                  Удалить
                </Button>
              </div>

              <div>
                <Label>Тип</Label>
                <SelectField
                  value={question.type}
                  onValueChange={(v) => {
                    const type = v as QuizQuestionType
                    updateQuestion(question.id, {
                      type,
                      options: supportsOptions(type) ? (question.options.length ? question.options : ['Вариант 1', 'Вариант 2']) : [],
                      min: supportsScale(type) ? (question.min ?? 1) : undefined,
                      max: supportsScale(type) ? (question.max ?? 10) : undefined,
                    })
                  }}
                  options={QUESTION_TYPE_OPTIONS}
                />
              </div>

              <div>
                <Label>Задание / вопрос</Label>
                <Textarea
                  className="min-h-20"
                  value={question.title}
                  onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
                  placeholder="Например: Выберите правильный вариант"
                />
              </div>

              {supportsOptions(question.type) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Варианты ответа</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        updateQuestion(question.id, {
                          options: [...question.options, `Вариант ${question.options.length + 1}`],
                        })
                      }
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Вариант
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {question.options.map((opt, optIndex) => (
                      <div key={`${question.id}-opt-${optIndex}`} className="flex items-center gap-2">
                        <Input
                          value={opt}
                          onChange={(e) => {
                            const next = [...question.options]
                            next[optIndex] = e.target.value
                            updateQuestion(question.id, { options: next })
                          }}
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const next = question.options.filter((_, idx) => idx !== optIndex)
                            updateQuestion(question.id, { options: next })
                          }}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {supportsScale(question.type) && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Минимум</Label>
                    <Input
                      type="number"
                      value={String(question.min ?? 1)}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          min: Number.isFinite(Number(e.target.value)) ? Number(e.target.value) : 1,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Максимум</Label>
                    <Input
                      type="number"
                      value={String(question.max ?? 10)}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          max: Number.isFinite(Number(e.target.value)) ? Number(e.target.value) : 10,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500/20"
                  checked={question.required}
                  onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                />
                Обязательный интерактив
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
