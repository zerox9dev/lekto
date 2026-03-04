'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/Button'

interface StudentDetailClientProps {
  studentId: string
  isArchived: boolean
}

export function StudentDetailClient({ studentId, isArchived }: StudentDetailClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleArchive() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('students')
      .update({ status: 'archived' })
      .eq('id', studentId)

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    toast.success('Ученик архивирован')
    router.push('/students')
    router.refresh()
  }

  async function handleRestore() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('students')
      .update({ status: 'active' })
      .eq('id', studentId)

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    toast.success('Ученик восстановлен')
    router.refresh()
  }

  if (isArchived) {
    return (
      <Button variant="secondary" size="sm" loading={loading} onClick={handleRestore}>
        Восстановить
      </Button>
    )
  }

  return (
    <ConfirmDialog
      trigger={
        <Button variant="destructive" size="sm">
          Архивировать
        </Button>
      }
      title="Архивировать ученика?"
      description="Ученик будет скрыт из активного списка. Его уроки и ДЗ сохранятся."
      confirmLabel="Архивировать"
      variant="destructive"
      loading={loading}
      onConfirm={handleArchive}
    />
  )
}
