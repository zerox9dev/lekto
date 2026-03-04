'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface InlinePaidToggleProps {
  lessonId: string
  isPaid: boolean
}

export function InlinePaidToggle({ lessonId, isPaid }: InlinePaidToggleProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [optimisticPaid, setOptimisticPaid] = useState<boolean | null>(null)

  const currentPaid = optimisticPaid ?? isPaid

  async function togglePaid() {
    if (loading) return

    const nextValue = !currentPaid
    setOptimisticPaid(nextValue)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from('lessons').update({ is_paid: nextValue }).eq('id', lessonId)

    setLoading(false)
    if (error) {
      setOptimisticPaid(null)
      toast.error(error.message)
      return
    }

    toast.success(nextValue ? 'Отмечено как оплачено' : 'Отмечено как не оплачено')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={togglePaid}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-md p-1 hover:bg-gray-100 transition-colors disabled:opacity-60"
      title={currentPaid ? 'Снять оплату' : 'Отметить как оплачено'}
      aria-label={currentPaid ? 'Снять оплату' : 'Отметить как оплачено'}
    >
      {currentPaid ? (
        <CheckCircle2 className="w-4 h-4 text-green-500" />
      ) : (
        <span className="text-xs text-gray-300">—</span>
      )}
    </button>
  )
}
