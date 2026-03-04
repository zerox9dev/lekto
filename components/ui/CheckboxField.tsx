'use client'

import * as Checkbox from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'

interface CheckboxFieldProps {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}

export function CheckboxField({ id, label, checked, onCheckedChange, disabled }: CheckboxFieldProps) {
  return (
    <div className="flex items-center gap-2.5">
      <Checkbox.Root
        id={id}
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
        disabled={disabled}
        className="h-4 w-4 rounded border border-gray-300 bg-white data-[state=checked]:bg-brand-600 data-[state=checked]:border-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Checkbox.Indicator className="flex items-center justify-center">
          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
        </Checkbox.Indicator>
      </Checkbox.Root>
      <label htmlFor={id} className="text-sm text-gray-700 cursor-pointer select-none">
        {label}
      </label>
    </div>
  )
}
