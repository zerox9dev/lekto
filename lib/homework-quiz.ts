export type QuizQuestionType =
  | 'short_text'
  | 'long_text'
  | 'single_choice'
  | 'multiple_choice'
  | 'dropdown_choice'
  | 'true_false'
  | 'number'
  | 'scale'
  | 'date'

export interface QuizQuestion {
  id: string
  type: QuizQuestionType
  title: string
  required: boolean
  options: string[]
  min?: number
  max?: number
}

export interface QuizDefinition {
  schema: Record<string, unknown>
  uiSchema?: Record<string, unknown>
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function normalizeQuizSchema(value: unknown): QuizDefinition | null {
  if (!isObject(value)) return null
  if (!isObject(value.schema)) return null

  const schemaType = value.schema.type
  const properties = value.schema.properties
  if (schemaType !== 'object' || !isObject(properties)) return null

  return {
    schema: value.schema,
    uiSchema: isObject(value.uiSchema) ? value.uiSchema : undefined,
  }
}

export function buildQuizDefinition(questions: QuizQuestion[]): QuizDefinition | null {
  const valid = questions
    .map((q) => ({
      ...q,
      title: q.title.trim() || 'Новый вопрос',
      options: q.options.map((o) => o.trim()).filter(Boolean),
    }))

  if (valid.length === 0) return null

  const properties: Record<string, unknown> = {}
  const uiSchema: Record<string, unknown> = {}
  const required: string[] = []

  for (const q of valid) {
    const key = q.id
    if (q.required) required.push(key)

    if (q.type === 'short_text') {
      properties[key] = { type: 'string', title: q.title }
      continue
    }

    if (q.type === 'long_text') {
      properties[key] = { type: 'string', title: q.title }
      uiSchema[key] = { 'ui:widget': 'textarea' }
      continue
    }

    if (q.type === 'single_choice') {
      properties[key] = {
        type: 'string',
        title: q.title,
        enum: q.options,
      }
      uiSchema[key] = { 'ui:widget': 'radio' }
      continue
    }

    if (q.type === 'dropdown_choice') {
      properties[key] = {
        type: 'string',
        title: q.title,
        enum: q.options,
      }
      uiSchema[key] = { 'ui:widget': 'select' }
      continue
    }

    if (q.type === 'multiple_choice') {
      properties[key] = {
        type: 'array',
        title: q.title,
        uniqueItems: true,
        items: {
          type: 'string',
          enum: q.options,
        },
      }
      uiSchema[key] = { 'ui:widget': 'checkboxes' }
      continue
    }

    if (q.type === 'true_false') {
      properties[key] = { type: 'boolean', title: q.title }
      uiSchema[key] = { 'ui:widget': 'radio' }
      continue
    }

    if (q.type === 'date') {
      properties[key] = { type: 'string', title: q.title, format: 'date' }
      continue
    }

    if (q.type === 'number') {
      properties[key] = { type: 'number', title: q.title }
      continue
    }

    properties[key] = {
      type: 'integer',
      title: q.title,
      minimum: Number.isFinite(q.min) ? q.min : 1,
      maximum: Number.isFinite(q.max) ? q.max : 10,
    }
    uiSchema[key] = { 'ui:widget': 'range' }
  }

  return {
    schema: {
      type: 'object',
      title: 'Квиз',
      properties,
      required,
      additionalProperties: false,
    },
    uiSchema,
  }
}

export function parseQuizDefinition(definition: QuizDefinition | null): QuizQuestion[] {
  if (!definition) return []
  const schema = definition.schema
  const uiSchema = isObject(definition.uiSchema) ? definition.uiSchema : {}
  if (!isObject(schema.properties)) return []

  const requiredSet = new Set(
    Array.isArray(schema.required) ? schema.required.filter((v): v is string => typeof v === 'string') : []
  )

  const questions: QuizQuestion[] = []

  for (const [key, raw] of Object.entries(schema.properties)) {
    if (!isObject(raw)) continue
    const title = typeof raw.title === 'string' ? raw.title : key
    const fieldUi = isObject(uiSchema[key]) ? uiSchema[key] : {}
    const widget = typeof fieldUi['ui:widget'] === 'string' ? fieldUi['ui:widget'] : ''

    let type: QuizQuestionType = 'short_text'
    let options: string[] = []
    let min: number | undefined
    let max: number | undefined

    if (raw.type === 'string' && Array.isArray(raw.enum)) {
      type = widget === 'select' ? 'dropdown_choice' : 'single_choice'
      options = raw.enum.filter((v): v is string => typeof v === 'string')
    } else if (
      raw.type === 'array' &&
      isObject(raw.items) &&
      Array.isArray(raw.items.enum)
    ) {
      type = 'multiple_choice'
      options = raw.items.enum.filter((v): v is string => typeof v === 'string')
    } else if (raw.type === 'boolean') {
      type = 'true_false'
    } else if (raw.type === 'number') {
      type = 'number'
    } else if (raw.type === 'integer' && (typeof raw.minimum === 'number' || typeof raw.maximum === 'number')) {
      type = 'scale'
      min = typeof raw.minimum === 'number' ? raw.minimum : 1
      max = typeof raw.maximum === 'number' ? raw.maximum : 10
    } else if (raw.type === 'string' && raw.format === 'date') {
      type = 'date'
    } else if (raw.type === 'string') {
      type = widget === 'textarea' ? 'long_text' : 'short_text'
    }

    questions.push({
      id: key,
      type,
      title,
      required: requiredSet.has(key),
      options,
      min,
      max,
    })
  }

  return questions
}
