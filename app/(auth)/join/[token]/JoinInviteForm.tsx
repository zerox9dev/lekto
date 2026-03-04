'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

interface JoinInviteFormProps {
  email: string
  token: string
}

export function JoinInviteForm({ email, token }: JoinInviteFormProps) {
  const [loading, setLoading] = useState(false)

  async function handleSendMagicLink() {
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
      toast.error(error.message)
      return
    }

    toast.success('Ссылка для входа отправлена на вашу почту')
  }

  return (
    <Button onClick={handleSendMagicLink} loading={loading} className="w-full">
      Получить ссылку для входа
    </Button>
  )
}
