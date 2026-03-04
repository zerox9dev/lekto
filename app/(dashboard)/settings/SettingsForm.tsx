'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
  settingsFormSchema,
  type SettingsFormData,
  DURATION_OPTIONS,
  CURRENCY_OPTIONS,
  TIMEZONE_OPTIONS,
} from '@/lib/validations/settings'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { SelectField } from '@/components/ui/SelectField'
import type { TutorSettings } from '@/types'

interface SettingsFormProps {
  settings: TutorSettings | null
  email: string
}

export function SettingsForm({ settings, email }: SettingsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, control, formState: { errors } } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      display_name:     settings?.display_name ?? '',
      default_price:    settings?.default_price?.toString() ?? '',
      default_duration: settings?.default_duration?.toString() ?? '60',
      currency:         settings?.currency ?? 'USD',
      timezone:         settings?.timezone ?? 'UTC',
    },
  })

  async function onSubmit(data: SettingsFormData) {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Не авторизован'); setLoading(false); return }

    const price = data.default_price?.trim()
      ? parseFloat(data.default_price)
      : null

    const { error } = await supabase
      .from('tutor_settings')
      .upsert({
        user_id:          user.id,
        display_name:     data.display_name || null,
        default_price:    isNaN(price as number) ? null : price,
        default_duration: parseInt(data.default_duration, 10),
        currency:         data.currency,
        timezone:         data.timezone,
      })

    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success('Настройки сохранены')
    router.refresh()
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* ── Профиль ────────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Профиль</h2>
        <div className="space-y-4">
          <div>
            <Label>Email</Label>
            <div className="h-9 flex items-center px-3 rounded-lg border border-gray-100 bg-gray-50 text-sm text-gray-400 select-none">
              {email}
            </div>
          </div>
          <div>
            <Label htmlFor="display_name">Отображаемое имя</Label>
            <Input
              id="display_name"
              placeholder="Анна Ковальская"
              {...register('display_name')}
            />
            <p className="mt-1 text-xs text-gray-400">Используется в приветствии на главной</p>
          </div>
        </div>
      </section>

      <hr className="border-gray-100" />

      {/* ── Значения по умолчанию ──────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Значения по умолчанию</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="default_price">Цена за урок</Label>
            <Input
              id="default_price"
              type="number"
              min="0"
              step="0.01"
              placeholder="30"
              {...register('default_price')}
            />
            <p className="mt-1 text-xs text-gray-400">Подставляется при добавлении ученика</p>
          </div>
          <div>
            <Label>Длительность урока</Label>
            <Controller
              name="default_duration"
              control={control}
              render={({ field }) => (
                <SelectField
                  value={field.value}
                  onValueChange={field.onChange}
                  options={DURATION_OPTIONS}
                />
              )}
            />
            <p className="mt-1 text-xs text-gray-400">Подставляется при создании урока</p>
          </div>
        </div>
      </section>

      <hr className="border-gray-100" />

      {/* ── Локализация ────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Локализация</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Валюта</Label>
            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <SelectField
                  value={field.value}
                  onValueChange={field.onChange}
                  options={CURRENCY_OPTIONS}
                />
              )}
            />
          </div>
          <div>
            <Label>Часовой пояс</Label>
            <Controller
              name="timezone"
              control={control}
              render={({ field }) => (
                <SelectField
                  value={field.value}
                  onValueChange={field.onChange}
                  options={TIMEZONE_OPTIONS}
                />
              )}
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" variant="primary" loading={loading}>
          Сохранить
        </Button>
      </div>
    </form>
  )
}
