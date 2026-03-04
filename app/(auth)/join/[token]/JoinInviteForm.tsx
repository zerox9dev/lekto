'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

interface JoinInviteFormProps {
  email: string
  token: string
}

export function JoinInviteForm({ email, token }: JoinInviteFormProps) {
  const [loading, setLoading] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const [sentOnce, setSentOnce] = useState(false)

  useEffect(() => {
    if (cooldownSeconds <= 0) return
    const id = window.setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => window.clearInterval(id)
  }, [cooldownSeconds])

  const cooldownActive = cooldownSeconds > 0

  function startCooldown(seconds: number) {
    setCooldownSeconds(seconds)
  }

  const handleSendMagicLink = useCallback(async () => {
    if (cooldownActive) {
      toast.message(`Повторная отправка будет доступна через ${cooldownSeconds} сек`)
      return
    }

    setLoading(true)
    const supabase = createClient()
    const origin = window.location.origin
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=/join/${token}`,
      },
    })
    setLoading(false)

    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('rate limit')) {
        startCooldown(60)
        toast.error('Слишком много попыток. Подождите 60 секунд и попробуйте снова.')
        return
      }
      if (msg.includes('expired') || msg.includes('invalid')) {
        toast.error('Ссылка устарела. Попросите преподавателя отправить новое приглашение.')
        return
      }
      toast.error('Не удалось отправить ссылку. Попробуйте ещё раз через минуту.')
      return
    }

    startCooldown(60)
    setSentOnce(true)
    toast.success('Ссылка для входа отправлена на вашу почту')
  }, [cooldownActive, cooldownSeconds, email, token])

  useEffect(() => {
    if (sentOnce || loading || cooldownActive) return
    const id = window.setTimeout(() => {
      void handleSendMagicLink()
    }, 0)
    return () => window.clearTimeout(id)
  }, [sentOnce, loading, cooldownActive, handleSendMagicLink])

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSendMagicLink}
        loading={loading}
        className="w-full"
        disabled={cooldownActive}
      >
        {cooldownActive ? `Повторить через ${cooldownSeconds} сек` : 'Отправить ссылку ещё раз'}
      </Button>
      <p className="text-xs text-gray-400">
        Мы отправили ссылку для входа на вашу почту автоматически. Если письмо не пришло, проверьте спам и отправьте ещё раз через 60 секунд.
      </p>
    </div>
  )
}
