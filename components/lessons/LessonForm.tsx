'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
  lessonFormSchema,
  type LessonFormData,
  DURATION_OPTIONS,
  STATUS_OPTIONS,
  buildScheduledAt,
  splitScheduledAt,
} from '@/lib/validations/lesson'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { SelectField } from '@/components/ui/SelectField'
import { CheckboxField } from '@/components/ui/CheckboxField'
import type { Lesson, Student } from '@/types'

interface LessonFormProps {
  lesson?: Lesson
  students: Pick<Student, 'id' | 'name'>[]
  defaultStudentId?: string
}

export function LessonForm({ lesson, students, defaultStudentId }: LessonFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isEdit = !!lesson

  const defaultDate = lesson
    ? splitScheduledAt(lesson.scheduled_at).date
    : new Date().toISOString().split('T')[0]

  const defaultTime = lesson
    ? splitScheduledAt(lesson.scheduled_at).time
    : '10:00'

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      student_id: lesson?.student_id ?? defaultStudentId ?? '',
      date: defaultDate,
      time: defaultTime,
      duration_min: lesson?.duration_min.toString() ?? '60',
      topic: lesson?.topic ?? '',
      status: lesson?.status ?? 'planned',
      is_paid: lesson?.is_paid ?? false,
    },
  })

  async function onSubmit(data: LessonFormData) {
    setLoading(true)
    const supabase = createClient()
    const scheduled_at = buildScheduledAt(data.date, data.time)

    const payload = {
      student_id: data.student_id,
      scheduled_at,
      duration_min: parseInt(data.duration_min, 10),
      topic: data.topic || null,
      status: data.status,
      is_paid: data.is_paid,
    }

    if (isEdit) {
      const { error } = await supabase.from('lessons').update(payload).eq('id', lesson.id)
      if (error) { toast.error(error.message); setLoading(false); return }
      toast.success('Урок обновлён')
      router.push(`/lessons/${lesson.id}`)
      router.refresh()
    } else {
      const { data: created, error } = await supabase
        .from('lessons')
        .insert(payload)
        .select()
        .single()
      if (error || !created) { toast.error(error?.message ?? 'Ошибка'); setLoading(false); return }
      toast.success('Урок создан')
      router.push(`/lessons/${created.id}`)
      router.refresh()
    }
  }

  const studentOptions = students.map((s) => ({ value: s.id, label: s.name }))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Student */}
      <div>
        <Label required>Ученик</Label>
        <Controller
          name="student_id"
          control={control}
          render={({ field }) => (
            <SelectField
              value={field.value}
              onValueChange={field.onChange}
              placeholder="Выберите ученика..."
              options={studentOptions}
              error={errors.student_id?.message}
            />
          )}
        />
      </div>

      {/* Date + Time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="date" required>Дата</Label>
          <Input
            id="date"
            type="date"
            error={errors.date?.message}
            {...register('date')}
          />
        </div>
        <div>
          <Label htmlFor="time" required>Время</Label>
          <Input
            id="time"
            type="time"
            error={errors.time?.message}
            {...register('time')}
          />
        </div>
      </div>

      {/* Duration + Status */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label required>Длительность</Label>
          <Controller
            name="duration_min"
            control={control}
            render={({ field }) => (
              <SelectField
                value={field.value}
                onValueChange={field.onChange}
                options={DURATION_OPTIONS}
                error={errors.duration_min?.message}
              />
            )}
          />
        </div>
        <div>
          <Label required>Статус</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <SelectField
                value={field.value}
                onValueChange={field.onChange}
                options={STATUS_OPTIONS}
                error={errors.status?.message}
              />
            )}
          />
        </div>
      </div>

      {/* Topic */}
      <div>
        <Label htmlFor="topic">Тема урока</Label>
        <Input
          id="topic"
          placeholder="Глаголы движения, Падежи..."
          {...register('topic')}
        />
        {errors.topic && <p className="mt-1.5 text-xs text-red-500">{errors.topic.message}</p>}
      </div>

      {/* is_paid */}
      <Controller
        name="is_paid"
        control={control}
        render={({ field }) => (
          <CheckboxField
            id="is_paid"
            label="Урок оплачен"
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        )}
      />

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Отмена
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {isEdit ? 'Сохранить' : 'Создать урок'}
        </Button>
      </div>
    </form>
  )
}
