'use client'

import * as Select from '@radix-ui/react-select'
import { ChevronDown, Check } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface SelectFieldProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  options: readonly Option[]
  error?: string
  disabled?: boolean
  className?: string
}

export function SelectField({
  value,
  onValueChange,
  placeholder = 'Выбрать...',
  options,
  error,
  disabled,
  className = '',
}: SelectFieldProps) {
  return (
    <div className={`w-full ${className}`}>
      <Select.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <Select.Trigger
          className={[
            'flex h-9 w-full items-center justify-between rounded-lg border bg-white px-3',
            'text-sm text-gray-900 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/15 focus:border-brand-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'data-[placeholder]:text-gray-400 data-[state=open]:border-brand-500',
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-red-400/15'
              : 'border-gray-200 hover:border-gray-300',
          ].join(' ')}
        >
          <Select.Value placeholder={placeholder} />
          <Select.Icon>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={4}
            className="z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg animate-in fade-in-80 zoom-in-95 duration-100"
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

      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  )
}
