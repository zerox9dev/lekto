'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'

export function DeleteAccountButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDeleteAccount() {
    setLoading(true)
    const res = await fetch('/api/account/delete', { method: 'POST' })
    setLoading(false)

    if (!res.ok) {
      const payload = await res.json().catch(() => ({ error: 'Ошибка удаления аккаунта' }))
      toast.error(payload.error ?? 'Ошибка удаления аккаунта')
      return
    }

    toast.success('Аккаунт и данные удалены')
    router.push('/login')
    router.refresh()
  }

  return (
    <ConfirmDialog
      title="Удалить аккаунт?"
      description="Это действие необратимо. Будут удалены профиль, ученики, уроки, домашние задания и связанные файлы."
      confirmLabel="Удалить аккаунт"
      variant="destructive"
      loading={loading}
      onConfirm={handleDeleteAccount}
      trigger={
        <Button variant="destructive" size="sm">
          Удалить аккаунт
        </Button>
      }
    />
  )
}
