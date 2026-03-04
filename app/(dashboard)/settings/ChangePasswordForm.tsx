'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

const schema = z
  .object({
    password:        z.string().min(8, 'Минимум 8 символов'),
    passwordConfirm: z.string(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: 'Пароли не совпадают',
    path: ['passwordConfirm'],
  })

type FormData = z.infer<typeof schema>

export function ChangePasswordForm() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: data.password })
    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success('Пароль изменён')
    reset()
    setOpen(false)
  }

  return (
    <div>
      {!open ? (
        <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
          Изменить пароль
        </Button>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 max-w-sm">
          <div>
            <Label htmlFor="password" required>Новый пароль</Label>
            <Input
              id="password"
              type="password"
              autoFocus
              error={errors.password?.message}
              {...register('password')}
            />
          </div>
          <div>
            <Label htmlFor="passwordConfirm" required>Подтвердите пароль</Label>
            <Input
              id="passwordConfirm"
              type="password"
              error={errors.passwordConfirm?.message}
              {...register('passwordConfirm')}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => { reset(); setOpen(false) }}
            >
              Отмена
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={loading}>
              Сохранить пароль
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
