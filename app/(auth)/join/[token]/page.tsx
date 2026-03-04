import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { JoinInviteForm } from './JoinInviteForm'

export const metadata = {
  title: 'Вход для ученика — Lekto',
}

interface StudentInviteRow {
  id: string
  name: string
  email: string | null
  portal_active: boolean | null
  auth_user_id: string | null
}

export default async function JoinPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const service = createServiceClient()
  const supabase = await createClient()

  const { data: inviteRow } = await service
    .from('students')
    .select('id, name, email, portal_active, auth_user_id')
    .eq('invite_token', token)
    .maybeSingle()

  const invite = inviteRow as StudentInviteRow | null

  if (!invite || !invite.portal_active) {
    return (
      <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-sm font-semibold text-gray-900 mb-2">Ссылка недействительна</h1>
        <p className="text-sm text-gray-500">
          Возможно, приглашение устарело. Попросите преподавателя отправить новую ссылку.
        </p>
      </div>
    )
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: tutorSettings } = await supabase
      .from('tutor_settings')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (tutorSettings) {
      redirect('/dashboard')
    }

    if (invite.auth_user_id && invite.auth_user_id !== user.id) {
      return (
        <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 p-6">
          <h1 className="text-sm font-semibold text-gray-900 mb-2">Приглашение уже использовано</h1>
          <p className="text-sm text-gray-500 mb-4">
            Этот инвайт уже привязан к другому аккаунту ученика.
          </p>
          <Link href="/login" className="text-sm text-brand-600 hover:underline">
            Перейти ко входу
          </Link>
        </div>
      )
    }

    if (!invite.auth_user_id) {
      await service
        .from('students')
        .update({
          auth_user_id: user.id,
          invite_token: null,
        })
        .eq('id', invite.id)
    }

    redirect('/student/homework')
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Lekto</h1>
        <p className="text-sm text-gray-400 mt-1">Вход для ученика</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">Вас пригласил преподаватель</h2>
        <p className="text-sm text-gray-500 mb-1">
          Ученик: <span className="text-gray-700">{invite.name}</span>
        </p>
        {invite.email ? (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Войдите по ссылке, которую отправим на: <span className="text-gray-700">{invite.email}</span>
            </p>
            <JoinInviteForm email={invite.email} token={token} />
          </>
        ) : (
          <p className="text-sm text-gray-500">
            Для этого ученика не указан email. Попросите преподавателя добавить email в профиль ученика.
          </p>
        )}
      </div>
    </div>
  )
}
