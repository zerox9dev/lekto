'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { SelectField } from '@/components/ui/SelectField'
import type { Student } from '@/types'

interface Props {
  lessonId: string
  students: Pick<Student, 'id' | 'name'>[]
}

export function AttachStudentButton({ lessonId, students }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const options = [
    { value: '', label: 'Выбрать ученика...' },
    ...students.map((s) => ({ value: s.id, label: s.name })),
  ]

  async function handleSelect(studentId: string) {
    if (!studentId) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('lessons')
      .update({ student_id: studentId })
      .eq('id', lessonId)
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Ученик привязан')
    router.refresh()
  }

  return (
    <div className="w-44" aria-label="Привязать ученика" title="Привязать ученика">
      <SelectField
        value=""
        onValueChange={handleSelect}
        options={options}
        disabled={saving}
      />
    </div>
  )
}
