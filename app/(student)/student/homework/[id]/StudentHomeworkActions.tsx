'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import type { HomeworkStatus } from '@/types'

interface StudentHomeworkActionsProps {
  homeworkId: string
  status: HomeworkStatus
}

export function StudentHomeworkActions({ homeworkId, status }: StudentHomeworkActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmitHomework() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('homework')
      .update({ status: 'submitted' })
      .eq('id', homeworkId)
    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Домашнее задание отправлено')
    router.refresh()
  }

  if (status !== 'assigned') return null

  return (
    <Button size="sm" onClick={handleSubmitHomework} loading={loading}>
      Сдать задание
    </Button>
  )
}
