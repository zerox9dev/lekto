import { Link } from "react-router-dom";

const audienceCards = [
  { emoji: "👩‍🏫", title: "Репетиторы", desc: "Ведут уроки один на один и хотят всё в одном месте", bg: "bg-[#e8f0e4]" },
  { emoji: "🏫", title: "Преподаватели", desc: "Работают с группами и нужен порядок в материалах", bg: "bg-[#fce8d5]" },
  { emoji: "🌍", title: "Онлайн-учителя", desc: "Преподают удалённо и хотят удобную платформу", bg: "bg-[#dde8f0]" },
  { emoji: "📚", title: "Языковые школы", desc: "Нужна структура для нескольких преподавателей", bg: "bg-[#f0e4ee]" },
];

const featureCards = [
  {
    title: "Уроки и конспекты",
    desc: "Создавайте конспекты, прикрепляйте материалы к каждому занятию",
    icon: "📖",
  },
  {
    title: "10 типов домашек",
    desc: "Тесты, вставить слово, пары, сортировка, карточки — с автопроверкой",
    icon: "✏️",
  },
  {
    title: "Ссылка ученику",
    desc: "Ученик открывает ссылку и видит свои уроки и домашки. Без регистрации",
    icon: "🔗",
  },
  {
    title: "Статистика",
    desc: "Следите за прогрессом каждого ученика",
    icon: "📊",
  },
];

const benefitCards = [
  { emoji: "📝", title: "Интерактивные домашки", desc: "10 типов заданий с автопроверкой" },
  { emoji: "📊", title: "Прогресс учеников", desc: "Статистика по каждому ученику" },
  { emoji: "🔗", title: "Персональная ссылка", desc: "Ученик видит всё без регистрации" },
  { emoji: "📱", title: "Мобильная версия", desc: "Работает на любом устройстве" },
];

const pricingFeatures = [
  "Неограниченное количество учеников",
  "Все 10 типов заданий",
  "Уроки и конспекты",
  "Персональные ссылки",
  "Статистика и прогресс",
  "Мобильная версия",
  "Без рекламы",
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8f7f4] font-sans text-[#1a1a1a]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-[#f8f7f4]/90 backdrop-blur-md border-b border-black/5">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-serif text-2xl font-bold tracking-tight text-[#1a1a1a] no-underline">
            Lekto
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors no-underline">
              Возможности
            </a>
            <a href="#audience" className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors no-underline">
              Для кого
            </a>
            <a href="#pricing" className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors no-underline">
              Цена
            </a>
          </nav>
          <Link
            to="/login"
            className="bg-[#1a1a1a] text-white text-sm font-medium px-5 py-2.5 rounded-full no-underline hover:bg-[#333] transition-colors"
          >
            Попробовать
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-24 pb-20 md:pt-32 md:pb-28 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-[#1a1a1a] mb-6">
            Платформа для
            <br />
            репетиторов, которые
            <br />
            ценят порядок
          </h1>
          <p className="text-lg md:text-xl text-[#666] max-w-xl mx-auto mb-10 leading-relaxed">
            Уроки, интерактивные домашки и персональная ссылка для каждого ученика. Бесплатно.
          </p>
          <Link
            to="/login"
            className="inline-block bg-[#1a1a1a] text-white text-base font-medium px-8 py-4 rounded-full no-underline hover:bg-[#333] transition-colors"
          >
            Начать бесплатно
          </Link>
          <p className="text-sm text-[#999] mt-4">Без регистрации для учеников</p>
        </div>

        {/* Decorative element */}
        <div className="flex justify-center mt-16">
          <div className="w-80 h-44 rounded-[2rem] bg-[#e8f0e4] border border-[#d4e0ce]" />
        </div>
      </section>

      {/* Для кого */}
      <section id="audience" className="px-6 py-20 md:py-28">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-center mb-4">Для кого это</h2>
          <p className="text-center text-[#666] text-lg max-w-lg mx-auto mb-14">
            Помогаем репетиторам организовать работу и сделать обучение удобнее
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {audienceCards.map(({ emoji, title, desc, bg }) => (
              <div key={title} className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-black/5">
                <div className={`w-12 h-12 ${bg} rounded-full flex items-center justify-center text-xl shrink-0`}>
                  {emoji}
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-1">{title}</h3>
                  <p className="text-sm text-[#666] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Возможности */}
      <section id="features" className="px-6 py-20 md:py-28 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-center mb-4">
            Всё что нужно для занятий
          </h2>
          <p className="text-center text-[#666] text-lg max-w-lg mx-auto mb-14">
            Каждая функция решает реальную проблему репетитора
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {featureCards.map(({ title, desc, icon }) => (
              <div
                key={title}
                className="p-8 rounded-2xl bg-[#f8f7f4] border border-black/5 hover:-translate-y-1 transition-transform"
              >
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="font-serif text-xl font-bold mb-2">{title}</h3>
                <p className="text-[#666] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Что вы получаете */}
      <section className="px-6 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-center mb-14">Что вы получаете</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {benefitCards.map(({ emoji, title, desc }) => (
              <div key={title} className="text-center p-6 rounded-2xl bg-white border border-black/5">
                <div className="text-3xl mb-3">{emoji}</div>
                <h3 className="font-semibold text-sm mb-1">{title}</h3>
                <p className="text-xs text-[#666] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-20 md:py-28 bg-white">
        <div className="max-w-md mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-4">Простая цена</h2>
          <div className="mt-10 p-10 rounded-3xl bg-[#f8f7f4] border border-black/5">
            <p className="text-sm text-[#666] uppercase tracking-wider mb-2">Навсегда</p>
            <p className="font-serif text-6xl font-bold text-[#1a1a1a] mb-1">$0</p>
            <p className="text-[#999] text-sm mb-8">Бесплатно</p>
            <ul className="text-left space-y-3 mb-10">
              {pricingFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-[#444]">
                  <span className="w-5 h-5 rounded-full bg-[#2d5a3d] flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/login"
              className="block w-full bg-[#1a1a1a] text-white text-base font-medium py-4 rounded-full no-underline hover:bg-[#333] transition-colors text-center"
            >
              Начать бесплатно
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white/60 px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <span className="font-serif text-white text-lg font-bold">Lekto</span>
          <span>© {new Date().getFullYear()} Lekto</span>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/zerox9dev/lekto"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors no-underline text-white/60"
            >
              GitHub
            </a>
            <a href="#" className="hover:text-white transition-colors no-underline text-white/60">
              Конфиденциальность
            </a>
            <a href="mailto:zerox9dev.work@icloud.com" className="hover:text-white transition-colors no-underline text-white/60">
              Контакты
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
