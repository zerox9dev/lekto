'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

export function SignOutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) { toast.error('Ошибка при выходе'); setLoading(false); return }
    router.push('/login')
    router.refresh()
  }

  return (
    <Button variant="destructive" size="sm" loading={loading} onClick={handleSignOut}>
      Выйти
    </Button>
  )
}
