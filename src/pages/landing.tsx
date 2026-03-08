import { Link } from "react-router-dom";
import { BookOpen, Users, ClipboardCheck, Link2, ArrowRight, Sparkles } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Ученики",
    desc: "Добавляйте учеников и давайте каждому персональную ссылку на его материалы.",
  },
  {
    icon: BookOpen,
    title: "Уроки",
    desc: "Создавайте конспекты и прикрепляйте материалы к каждому занятию.",
  },
  {
    icon: ClipboardCheck,
    title: "Домашние задания",
    desc: "Тесты, вставить слово, соединить пары, расставить по порядку — с автопроверкой.",
  },
  {
    icon: Link2,
    title: "Ссылка ученику",
    desc: "Ученик открывает ссылку и видит свои уроки и домашки. Без регистрации.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-100">
        <div className="max-w-5xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-zinc-900 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-[15px] tracking-tight">Lekto</span>
          </Link>
          <Link
            to="/login"
            className="text-[13px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            Войти
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pt-12 md:pt-24 pb-12 md:pb-20">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-[12px] font-medium text-zinc-500 mb-4 md:mb-6">
            <Sparkles className="h-3 w-3" />
            Бесплатно для репетиторов
          </div>
          <h1 className="text-[28px] md:text-[42px] leading-[1.1] font-bold tracking-tight mb-4 md:mb-5">
            Уроки и домашки
            <br />
            <span className="text-zinc-400">в одном месте</span>
          </h1>
          <p className="text-[15px] md:text-[17px] leading-relaxed text-zinc-500 mb-6 md:mb-8 max-w-md">
            Создавайте уроки, назначайте интерактивные задания и делитесь ссылкой с учеником. Ему не нужно регистрироваться.
          </p>
          <Link
            to="/login"
            className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-5 py-3 md:py-2.5 rounded-xl bg-zinc-900 text-white text-[14px] font-medium hover:bg-zinc-800 transition-colors"
          >
            Начать бесплатно
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-16 md:pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-2xl border border-zinc-100 p-5 md:p-6 hover:border-zinc-200 hover:bg-zinc-50/50 transition-all"
            >
              <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center mb-3 md:mb-4 group-hover:bg-zinc-200/70 transition-colors">
                <Icon className="h-5 w-5 text-zinc-600" />
              </div>
              <h3 className="font-semibold text-[15px] mb-1.5">{title}</h3>
              <p className="text-[14px] leading-relaxed text-zinc-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-100">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-16 text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-3">Попробуйте сейчас</h2>
          <p className="text-[15px] text-zinc-500 mb-6">Бесплатно. Без карты. Без ограничений.</p>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 md:py-2.5 rounded-xl bg-zinc-900 text-white text-[14px] font-medium hover:bg-zinc-800 transition-colors"
          >
            Создать аккаунт
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-6">
        <div className="max-w-5xl mx-auto px-4 md:px-6 flex items-center justify-between text-[12px] text-zinc-400">
          <span>© {new Date().getFullYear()} Lekto</span>
          <a href="https://zerox9dev.com" className="hover:text-zinc-600 transition-colors">
            zerox9dev
          </a>
        </div>
      </footer>
    </div>
  );
}
