import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { SettingsForm } from './SettingsForm'
import { SubjectsClient } from './SubjectsClient'
import { ChangePasswordForm } from './ChangePasswordForm'
import { SignOutButton } from './SignOutButton'
import { GoogleCalendarBlock } from './GoogleCalendarBlock'
import { DeleteAccountButton } from './DeleteAccountButton'
import type { TutorSettings, Subject, GoogleCalendarToken, Student } from '@/types'

export const metadata = { title: 'Настройки — Lekto' }

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [settingsResult, subjectsResult, gcalResult, studentsResult] = await Promise.all([
    supabase
      .from('tutor_settings')
      .select('*')
      .eq('user_id', user!.id)
      .single(),
    supabase
      .from('subjects')
      .select('*')
      .order('created_at'),
    supabase
      .from('google_calendar_tokens')
      .select('*')
      .eq('user_id', user!.id)
      .maybeSingle(),
    supabase
      .from('students')
      .select('id, name')
      .eq('status', 'active')
      .order('name'),
  ])

  const settings = settingsResult.data as TutorSettings | null
  const subjects = (subjectsResult.data ?? []) as Subject[]
  const gcalToken = gcalResult.data as GoogleCalendarToken | null
  const students = (studentsResult.data ?? []) as Pick<Student, 'id' | 'name'>[]
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

      {/* Google Calendar card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <GoogleCalendarBlock token={gcalToken} students={students} />
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
          <hr className="border-gray-100" />
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Полностью удалить аккаунт и все данные из Lekto
            </p>
            <DeleteAccountButton />
          </div>
        </div>
      </div>
    </div>
  )
}
