'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { homeworkFormSchema, type HomeworkFormData } from '@/lib/validations/homework'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { SelectField } from '@/components/ui/SelectField'
import { FileUpload } from '@/components/shared/FileUpload'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { formatDateTime } from '@/lib/utils/format'
import type { Homework, Student, Lesson } from '@/types'

const NO_LESSON_VALUE = '__NO_LESSON__'

interface HomeworkFormProps {
  homework?: Homework
  students: Pick<Student, 'id' | 'name'>[]
  defaultStudentId?: string
  defaultLessonId?: string
}

export function HomeworkForm({
  homework,
  students,
  defaultStudentId,
  defaultLessonId,
}: HomeworkFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [studentLessons, setStudentLessons] = useState<Lesson[]>([])
  const isEdit = !!homework

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<HomeworkFormData>({
    resolver: zodResolver(homeworkFormSchema),
    defaultValues: {
      student_id: homework?.student_id ?? defaultStudentId ?? '',
      lesson_id:  homework?.lesson_id ?? defaultLessonId ?? null,
      description: homework?.description ?? '',
      deadline:   homework?.deadline ?? '',
      file_url:   homework?.file_url ?? null,
    },
  })

  const studentId = watch('student_id')
  const fileUrl = watch('file_url')

  // При смене студента — загружаем его уроки
  useEffect(() => {
    if (!studentId) { setStudentLessons([]); return }
    const supabase = createClient()
    supabase
      .from('lessons')
      .select('*')
      .eq('student_id', studentId)
      .order('scheduled_at', { ascending: false })
      .limit(30)
      .then(({ data }) => setStudentLessons((data as Lesson[]) ?? []))
  }, [studentId])

  const lessonOptions = [
    { value: NO_LESSON_VALUE, label: 'Без привязки к уроку' },
    ...studentLessons.map((l) => ({
      value: l.id,
      label: `${formatDateTime(l.scheduled_at)}${l.topic ? ` — ${l.topic}` : ''}`,
    })),
  ]

  async function onSubmit(data: HomeworkFormData) {
    setLoading(true)
    const supabase = createClient()

    const payload = {
      student_id:  data.student_id,
      lesson_id:   data.lesson_id || null,
      description: data.description,
      deadline:    data.deadline || null,
      file_url:    data.file_url || null,
    }

    if (isEdit) {
      const { error } = await supabase.from('homework').update(payload).eq('id', homework.id)
      if (error) { toast.error(error.message); setLoading(false); return }
      toast.success('Изменения сохранены')
      router.push(`/homework/${homework.id}`)
      router.refresh()
    } else {
      const { data: created, error } = await supabase
        .from('homework')
        .insert(payload)
        .select()
        .single()
      if (error || !created) { toast.error(error?.message ?? 'Ошибка'); setLoading(false); return }
      toast.success('Задание добавлено')
      router.push(`/homework/${created.id}`)
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
              onValueChange={(v) => {
                field.onChange(v)
                setValue('lesson_id', null)
              }}
              placeholder="Выберите ученика..."
              options={studentOptions}
              error={errors.student_id?.message}
            />
          )}
        />
      </div>

      {/* Lesson */}
      <div>
        <Label>Урок (необязательно)</Label>
        <Controller
          name="lesson_id"
          control={control}
          render={({ field }) => (
            <SelectField
              value={field.value ?? (studentId ? NO_LESSON_VALUE : '')}
              onValueChange={(v) => field.onChange(v === NO_LESSON_VALUE ? null : v)}
              placeholder={studentId ? 'Выберите урок...' : 'Сначала выберите ученика'}
              options={lessonOptions}
              disabled={!studentId}
            />
          )}
        />
      </div>

      {/* Description */}
      <div>
        <Label required>Описание задания</Label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              value={field.value}
              onChange={field.onChange}
              placeholder="Выполните упражнение 3 на странице 45..."
              error={errors.description?.message}
            />
          )}
        />
      </div>

      {/* Deadline */}
      <div>
        <Label htmlFor="deadline">Дедлайн</Label>
        <Input id="deadline" type="date" {...register('deadline')} />
      </div>

      {/* File Upload */}
      <div>
        <Label>Файл (PDF, JPG, PNG — до 10 МБ)</Label>
        <FileUpload
          studentId={studentId}
          currentPath={fileUrl}
          onUpload={(path) => setValue('file_url', path)}
          onRemove={() => setValue('file_url', null)}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Отмена
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {isEdit ? 'Сохранить' : 'Добавить задание'}
        </Button>
      </div>
    </form>
  )
}
