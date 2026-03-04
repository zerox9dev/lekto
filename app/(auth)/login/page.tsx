import { LoginForm } from './LoginForm'

export const metadata = {
  title: 'Вход — Lekto',
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      {/* Logo / Brand */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Lekto</h1>
        <p className="text-sm text-gray-400 mt-1">Платформа для репетиторов</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-5">Войдите в аккаунт</h2>
        <LoginForm />
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        Нет аккаунта?{' '}
        <a href="mailto:support@lekto.app" className="text-brand-600 hover:underline">
          Свяжитесь с нами
        </a>
      </p>
    </div>
  )
}
