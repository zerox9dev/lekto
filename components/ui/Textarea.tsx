import { forwardRef } from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          rows={4}
          className={[
            'w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900',
            'placeholder:text-gray-400 transition-colors resize-none',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/15 focus:border-brand-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-red-400/15'
              : 'border-gray-200 hover:border-gray-300',
            className,
          ].join(' ')}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
