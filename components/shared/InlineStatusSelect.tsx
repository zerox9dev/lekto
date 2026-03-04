'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import * as Select from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Option<T extends string> {
  value: T
  label: string
}

interface InlineStatusSelectProps<T extends string> {
  table: 'lessons' | 'homework' | 'students'
  rowId: string
  value: T
  options: readonly Option<T>[]
}

const statusClasses: Record<string, string> = {
  planned: 'bg-amber-50 text-amber-700 border-amber-200',
  done: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
  assigned: 'bg-blue-50 text-blue-700 border-blue-200',
  submitted: 'bg-amber-50 text-amber-700 border-amber-200',
  reviewed: 'bg-green-50 text-green-700 border-green-200',
  active: 'bg-green-50 text-green-700 border-green-200',
  archived: 'bg-gray-100 text-gray-400 border-gray-100',
}

export function InlineStatusSelect<T extends string>({
  table,
  rowId,
  value,
  options,
}: InlineStatusSelectProps<T>) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [optimisticValue, setOptimisticValue] = useState<T | null>(null)

  const currentValue = optimisticValue ?? value
  const currentOption = options.find((opt) => opt.value === currentValue)
  const currentLabel = currentOption?.label ?? currentValue
  const currentClass = statusClasses[currentValue] ?? 'bg-gray-100 text-gray-600 border-gray-200'

  async function handleChange(nextValue: string) {
    const typedNext = nextValue as T
    if (typedNext === currentValue) return

    setOptimisticValue(typedNext)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from(table).update({ status: typedNext }).eq('id', rowId)

    setLoading(false)
    if (error) {
      setOptimisticValue(null)
      toast.error(error.message)
      return
    }

    toast.success('Статус обновлён')
    router.refresh()
  }

  return (
    <Select.Root value={currentValue} onValueChange={handleChange} disabled={loading}>
      <Select.Trigger
        className={[
          'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors',
          'disabled:opacity-60 disabled:cursor-not-allowed',
          currentClass,
        ].join(' ')}
      >
        <Select.Value>{currentLabel}</Select.Value>
        <Select.Icon>
          <ChevronDown className="w-3 h-3" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={6}
          className="z-50 min-w-[180px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg animate-in fade-in-80 zoom-in-95 duration-100"
        >
          <Select.Viewport className="p-1">
            {options.map((opt) => (
              <Select.Item
                key={opt.value}
                value={opt.value}
                className="relative flex h-8 cursor-pointer select-none items-center rounded-md px-3 pr-8 text-sm text-gray-700 outline-none data-[highlighted]:bg-gray-50 data-[highlighted]:text-gray-900 data-[state=checked]:text-brand-600 data-[state=checked]:font-medium"
              >
                <Select.ItemText>{opt.label}</Select.ItemText>
                <Select.ItemIndicator className="absolute right-2">
                  <Check className="w-3.5 h-3.5" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
