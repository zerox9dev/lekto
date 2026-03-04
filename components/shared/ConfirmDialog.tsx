'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/Button'

interface ConfirmDialogProps {
  trigger: React.ReactNode
  title: string
  description?: string
  confirmLabel?: string
  variant?: 'destructive' | 'primary'
  loading?: boolean
  onConfirm: () => void
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = 'Подтвердить',
  variant = 'destructive',
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/25 backdrop-blur-[2px] animate-in fade-in duration-150 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-white rounded-xl border border-gray-200 shadow-xl p-6 animate-in zoom-in-95 fade-in duration-150 outline-none">
          <Dialog.Title className="text-sm font-semibold text-gray-900 mb-1">
            {title}
          </Dialog.Title>
          {description && (
            <Dialog.Description className="text-sm text-gray-500 mb-5">
              {description}
            </Dialog.Description>
          )}
          <div className="flex justify-end gap-2 mt-5">
            <Dialog.Close asChild>
              <Button variant="secondary" size="sm">Отмена</Button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Button variant={variant} size="sm" loading={loading} onClick={onConfirm}>
                {confirmLabel}
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
