import { z } from 'zod'

export const settingsFormSchema = z.object({
  display_name:     z.string().max(100).optional(),
  default_price:    z.string().optional(),
  default_duration: z.string().min(1),
  currency:         z.string().min(1),
  timezone:         z.string().min(1),
})

export type SettingsFormData = z.infer<typeof settingsFormSchema>

export const DURATION_OPTIONS = [
  { value: '30',  label: '30 мин' },
  { value: '45',  label: '45 мин' },
  { value: '60',  label: '60 мин' },
  { value: '75',  label: '75 мин' },
  { value: '90',  label: '90 мин' },
  { value: '120', label: '2 часа' },
]

export const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD — Доллар' },
  { value: 'EUR', label: 'EUR — Евро' },
  { value: 'PLN', label: 'PLN — Злотый' },
  { value: 'UAH', label: 'UAH — Гривна' },
  { value: 'RUB', label: 'RUB — Рубль' },
  { value: 'GBP', label: 'GBP — Фунт' },
  { value: 'CZK', label: 'CZK — Крона' },
  { value: 'TRY', label: 'TRY — Лира' },
]

export const TIMEZONE_OPTIONS = [
  { value: 'UTC',              label: 'UTC' },
  { value: 'Europe/Warsaw',    label: 'Варшава (UTC+1/+2)' },
  { value: 'Europe/Kyiv',      label: 'Киев (UTC+2/+3)' },
  { value: 'Europe/Moscow',    label: 'Москва (UTC+3)' },
  { value: 'Europe/London',    label: 'Лондон (UTC+0/+1)' },
  { value: 'Europe/Berlin',    label: 'Берлин (UTC+1/+2)' },
  { value: 'Europe/Prague',    label: 'Прага (UTC+1/+2)' },
  { value: 'America/New_York', label: 'Нью-Йорк (UTC-5/-4)' },
  { value: 'Asia/Dubai',       label: 'Дубай (UTC+4)' },
  { value: 'Asia/Tbilisi',     label: 'Тбилиси (UTC+4)' },
]
