'use client'

import { Slot } from '@radix-ui/react-slot'
import { forwardRef } from 'react'
import { Spinner } from './Spinner'

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive'
type Size = 'sm' | 'md' | 'lg'

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
  secondary:
    'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50',
  ghost:
    'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  destructive:
    'bg-white text-red-600 border border-red-200 hover:bg-red-50',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-10 px-5 text-sm',
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      asChild = false,
      disabled,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const cls = [
      'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30',
      'disabled:pointer-events-none disabled:opacity-50',
      variantClasses[variant],
      sizeClasses[size],
      className,
    ].join(' ')

    // asChild передаёт стили через Slot — спиннер не поддерживается,
    // Slot требует ровно один дочерний элемент.
    if (asChild) {
      return (
        <Slot ref={ref} className={cls} {...props}>
          {children}
        </Slot>
      )
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cls}
        {...props}
      >
        {loading && <Spinner className="w-4 h-4" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
