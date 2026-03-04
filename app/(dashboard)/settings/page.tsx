import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { SettingsForm } from './SettingsForm'
import { SubjectsClient } from './SubjectsClient'
import { ChangePasswordForm } from './ChangePasswordForm'
import { SignOutButton } from './SignOutButton'
import type { TutorSettings, Subject } from '@/types'

export const metadata = { title: 'Настройки — Lekto' }

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [settingsResult, subjectsResult] = await Promise.all([
    supabase
      .from('tutor_settings')
      .select('*')
      .eq('user_id', user!.id)
      .single(),
    supabase
      .from('subjects')
      .select('*')
      .order('created_at'),
  ])

  const settings = settingsResult.data as TutorSettings | null
  const subjects = (subjectsResult.data ?? []) as Subject[]
  const email = user?.email ?? ''

  return (
    <div className="max-w-2xl">
      <PageHeader title="Настройки" />

      {/* Main settings card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <SettingsForm settings={settings} email={email} />
      </div>

      {/* Subjects card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <SubjectsClient subjects={subjects} />
      </div>

      {/* Account card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Аккаунт</h2>
        <div className="space-y-4">
          <ChangePasswordForm />
          <hr className="border-gray-100" />
          <div>
            <p className="text-sm text-gray-600 mb-2">Завершить сессию на всех устройствах</p>
            <SignOutButton />
          </div>
        </div>
      </div>
    </div>
  )
}
