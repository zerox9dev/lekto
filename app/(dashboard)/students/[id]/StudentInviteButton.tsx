'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'

interface StudentInviteButtonProps {
  studentId: string
  hasEmail: boolean
}

export function StudentInviteButton({ studentId, hasEmail }: StudentInviteButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleInvite() {
    if (!hasEmail) {
      toast.error('Добавьте email ученика, чтобы отправить приглашение')
      return
    }

    setLoading(true)
    const res = await fetch('/api/student-portal/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId }),
    })
    setLoading(false)

    const data = (await res.json().catch(() => ({}))) as {
      error?: string
      inviteLink?: string
      email?: string
    }

    if (!res.ok || !data.inviteLink) {
      toast.error(data.error ?? 'Не удалось создать приглашение')
      return
    }

    try {
      await navigator.clipboard.writeText(data.inviteLink)
      toast.success(`Ссылка приглашения скопирована. Отправьте ученику на ${data.email}.`)
    } catch {
      toast.success('Ссылка приглашения создана')
      toast.message(data.inviteLink)
    }
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleInvite} loading={loading}>
      Пригласить в портал
    </Button>
  )
}
