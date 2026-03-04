'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { studentFormSchema, type StudentFormData, parsePricePerHour } from '@/lib/validations/student'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { SelectField } from '@/components/ui/SelectField'
import type { Student } from '@/types'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((l) => ({ value: l, label: l }))

interface StudentFormProps {
  student?: Student
}

export function StudentForm({ student }: StudentFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isEdit = !!student

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: student?.name ?? '',
      contact: student?.contact ?? '',
      level: (student?.level as StudentFormData['level']) ?? undefined,
      price_per_hour: student?.price_per_hour?.toString() ?? '',
      notes: student?.notes ?? '',
    },
  })

  const levelValue = watch('level')

  async function onSubmit(data: StudentFormData) {
    setLoading(true)
    const supabase = createClient()

    const payload = {
      name: data.name,
      contact: data.contact || null,
      level: data.level || null,
      price_per_hour: parsePricePerHour(data.price_per_hour),
      notes: data.notes || null,
    }

    if (isEdit) {
      const { error } = await supabase
        .from('students')
        .update(payload)
        .eq('id', student.id)

      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }
      toast.success('Изменения сохранены')
      router.push(`/students/${student.id}`)
      router.refresh()
    } else {
      const { data: authData, error: authError } = await supabase.auth.getUser()
      const userId = authData.user?.id

      if (authError || !userId) {
        toast.error(authError?.message ?? 'Не удалось определить пользователя')
        setLoading(false)
        return
      }

      const { data: created, error } = await supabase
        .from('students')
        .insert({
          ...payload,
          tutor_id: userId,
        })
        .select()
        .single()

      if (error || !created) {
        toast.error(error?.message ?? 'Ошибка при создании')
        setLoading(false)
        return
      }
      toast.success('Ученик добавлен')
      router.push(`/students/${created.id}`)
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name */}
      <div>
        <Label htmlFor="name" required>Имя</Label>
        <Input
          id="name"
          placeholder="Анна Ковальская"
          error={errors.name?.message}
          {...register('name')}
        />
      </div>

      {/* Contact */}
      <div>
        <Label htmlFor="contact">Контакт (Telegram / телефон / email)</Label>
        <Input
          id="contact"
          placeholder="@username или +7 900 000 00 00"
          {...register('contact')}
        />
      </div>

      {/* Level + Price */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Уровень</Label>
          <SelectField
            value={levelValue}
            onValueChange={(v) => setValue('level', v as StudentFormData['level'])}
            placeholder="Выбрать..."
            options={LEVELS}
            error={errors.level?.message}
          />
        </div>
        <div>
          <Label htmlFor="price_per_hour">Цена за урок</Label>
          <Input
            id="price_per_hour"
            type="number"
            min="0"
            step="0.01"
            placeholder="30"
            error={errors.price_per_hour?.message}
            {...register('price_per_hour')}
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Заметки</Label>
        <Textarea
          id="notes"
          placeholder="Цели, особенности, пожелания..."
          error={errors.notes?.message}
          {...register('notes')}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Отмена
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {isEdit ? 'Сохранить' : 'Добавить ученика'}
        </Button>
      </div>
    </form>
  )
}
