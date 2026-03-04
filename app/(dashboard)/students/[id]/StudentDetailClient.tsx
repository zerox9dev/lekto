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
  const [loadingArchive, setLoadingArchive] = useState(false)
  const [loadingRestore, setLoadingRestore] = useState(false)
  const [loadingDelete, setLoadingDelete] = useState(false)

  async function handleArchive() {
    setLoadingArchive(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('students')
      .update({ status: 'archived' })
      .eq('id', studentId)

    if (error) {
      toast.error(error.message)
      setLoadingArchive(false)
      return
    }
    toast.success('Ученик архивирован')
    router.push('/students')
    router.refresh()
    setLoadingArchive(false)
  }

  async function handleRestore() {
    setLoadingRestore(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('students')
      .update({ status: 'active' })
      .eq('id', studentId)

    if (error) {
      toast.error(error.message)
      setLoadingRestore(false)
      return
    }
    toast.success('Ученик восстановлен')
    router.refresh()
    setLoadingRestore(false)
  }

  async function handleDelete() {
    setLoadingDelete(true)
    const res = await fetch(`/api/students/${studentId}`, { method: 'DELETE' })
    setLoadingDelete(false)

    if (!res.ok) {
      const payload = (await res.json().catch(() => ({ error: 'Не удалось удалить ученика' }))) as {
        error?: string
      }
      toast.error(payload.error ?? 'Не удалось удалить ученика')
      return
    }

    toast.success('Ученик удалён')
    router.push('/students')
    router.refresh()
  }

  if (isArchived) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" loading={loadingRestore} onClick={handleRestore}>
          Восстановить
        </Button>
        <ConfirmDialog
          trigger={<Button variant="destructive" size="sm">Удалить</Button>}
          title="Удалить ученика?"
          description="Ученик, все его уроки, домашки и сообщения будут удалены без возможности восстановления."
          confirmLabel="Удалить навсегда"
          variant="destructive"
          loading={loadingDelete}
          onConfirm={handleDelete}
        />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
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
        loading={loadingArchive}
        onConfirm={handleArchive}
      />
      <ConfirmDialog
        trigger={<Button variant="secondary" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">Удалить</Button>}
        title="Удалить ученика?"
        description="Ученик, все его уроки, домашки и сообщения будут удалены без возможности восстановления."
        confirmLabel="Удалить навсегда"
        variant="destructive"
        loading={loadingDelete}
        onConfirm={handleDelete}
      />
    </div>
  )
}
