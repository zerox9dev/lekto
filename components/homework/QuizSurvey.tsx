'use client'

import Form from '@rjsf/core'
import validator from '@rjsf/validator-ajv8'
import { normalizeQuizSchema, type QuizDefinition } from '@/lib/homework-quiz'

interface QuizSurveyProps {
  schema: QuizDefinition | null
  data?: Record<string, unknown>
  mode?: 'display' | 'edit'
  onDataChange?: (data: Record<string, unknown>) => void
}

export function QuizSurvey({ schema, data, mode = 'display', onDataChange }: QuizSurveyProps) {
  const normalized = normalizeQuizSchema(schema)
  if (!normalized) return null

  return (
    <div className="rjsf-quiz">
      <Form
        schema={normalized.schema}
        uiSchema={normalized.uiSchema}
        formData={data ?? {}}
        validator={validator}
        liveValidate={false}
        noHtml5Validate
        showErrorList={false}
        disabled={mode === 'display'}
        readonly={mode === 'display'}
        onChange={(event) => {
          onDataChange?.((event.formData as Record<string, unknown>) ?? {})
        }}
      >
        <div />
      </Form>
    </div>
  )
}
