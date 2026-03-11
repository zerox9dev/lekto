import { useState } from "react";
import { Link } from "react-router-dom";
import s from "./landing.module.css";

const AUDIENCE = [
  { emoji: "👩‍🏫", title: "Репетиторы", desc: "Ведут уроки один на один и хотят всё в одном месте", bg: s.audienceEmoji1 },
  { emoji: "🏫", title: "Преподаватели", desc: "Работают с группами и нужен порядок в материалах", bg: s.audienceEmoji2 },
  { emoji: "🌍", title: "Онлайн-учителя", desc: "Преподают удалённо и хотят удобную платформу", bg: s.audienceEmoji3 },
  { emoji: "📚", title: "Языковые школы", desc: "Нужна структура для нескольких преподавателей", bg: s.audienceEmoji4 },
];

const FEATURES = [
  { icon: "📖", title: "Уроки и конспекты", desc: "Создавайте конспекты, прикрепляйте материалы к каждому занятию" },
  { icon: "✏️", title: "10 типов домашек", desc: "Тесты, вставить слово, пары, сортировка, карточки — с автопроверкой" },
  { icon: "🔗", title: "Ссылка ученику", desc: "Ученик открывает ссылку и видит свои уроки и домашки. Без регистрации" },
  { icon: "📊", title: "Статистика", desc: "Следите за прогрессом каждого ученика" },
];

const BENEFITS = [
  { emoji: "📝", title: "Интерактивные домашки", desc: "10 типов заданий с автопроверкой" },
  { emoji: "📊", title: "Прогресс учеников", desc: "Статистика по каждому ученику" },
  { emoji: "🔗", title: "Персональная ссылка", desc: "Ученик видит всё без регистрации" },
  { emoji: "📱", title: "Мобильная версия", desc: "Работает на любом устройстве" },
  { emoji: "🎨", title: "Шаблоны заданий", desc: "Создавайте и используйте повторно" },
];

const PRICING_CLOUD = [
  "Безлимитные ученики",
  "10 типов домашних заданий",
  "Статистика прогресса",
  "Шаблоны заданий",
  "Автоматические обновления",
  "Приоритетная поддержка",
];

const PRICING_SELF = [
  "Все функции Cloud",
  "Свой сервер, свои данные",
  "Открытый исходный код",
  "Безлимитно и бесплатно",
];

export function LandingPage() {
  return (
    <div className={s.landing}>
      {/* ── Floating Pill Navbar ── */}
      <div className={s.navWrap}>
        <nav className={s.nav}>
          <Link to="/" className={s.logo}>Lekto</Link>
          <div className={s.navLinks}>
            <a href="#features" className={s.navLink}>Возможности</a>
            <a href="#audience" className={s.navLink}>Для кого</a>
            <a href="#pricing" className={s.navLink}>Цены</a>
          </div>
          <Link to="/login" className={s.navCta}>Попробовать</Link>
        </nav>
      </div>

      {/* ── Hero ── */}
      <section className={s.hero}>
        <h1 className={s.heroTitle}>
          Платформа для<br />
          репетиторов, которые<br />
          ценят порядок
        </h1>
        <p className={s.heroDesc}>
          Уроки, интерактивные домашки и персональная ссылка для каждого ученика. Бесплатно.
        </p>
        <Link to="/login" className={s.heroCta}>Начать бесплатно</Link>
        <p className={s.heroNote}>Без регистрации для учеников</p>
      </section>

      {/* ── Who this is for ── */}
      <section id="audience" className={s.section}>
        <h2 className={s.sectionTitle}>Для кого это</h2>
        <p className={s.sectionDesc}>Помогаем репетиторам организовать работу и сделать обучение удобнее</p>
        <div className={s.audienceGrid}>
          {AUDIENCE.map((a) => (
            <div key={a.title} className={s.audienceCard}>
              <div className={`${s.audienceEmoji} ${a.bg}`}>{a.emoji}</div>
              <h3 className={s.audienceName}>{a.title}</h3>
              <p className={s.audienceDesc}>{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className={s.section}>
        <h2 className={s.sectionTitle}>Всё что нужно для занятий</h2>
        <p className={s.sectionDesc}>Каждая функция решает реальную проблему репетитора</p>
        <div className={s.featuresGrid}>
          {FEATURES.map((f) => (
            <div key={f.title} className={s.featureCard}>
              <div className={s.featureIcon}>{f.icon}</div>
              <h3 className={s.featureName}>{f.title}</h3>
              <p className={s.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── What you get – horizontal scroll ── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Что вы получаете</h2>
        <p className={s.sectionDesc}>Всё для продуктивных занятий</p>
        <div className={s.benefitsWrap}>
          <div className={s.benefitsRow}>
            {BENEFITS.map((b) => (
              <div key={b.title} className={s.benefitCard}>
                <div className={s.benefitEmoji}>{b.emoji}</div>
                <h3 className={s.benefitName}>{b.title}</h3>
                <p className={s.benefitDesc}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={s.statsRow}>
          <div className={s.stat}>
            <div className={s.statValue}>10</div>
            <div className={s.statLabel}>типов заданий</div>
          </div>
          <div className={s.stat}>
            <div className={s.statValue}>∞</div>
            <div className={s.statLabel}>учеников</div>
          </div>
          <div className={s.stat}>
            <div className={s.statValue}>0</div>
            <div className={s.statLabel}>регистраций для учеников</div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className={s.section}>
        <h2 className={s.sectionTitle}>Простые цены</h2>
        <p className={s.sectionDesc}>Начните бесплатно, обновитесь когда нужно</p>
        <div className={s.pricingGrid}>
          <div className={s.pricingCard}>
            <div className={s.pricingLabel}>Cloud</div>
            <div className={s.pricingAmount}>$5</div>
            <div className={s.pricingPeriod}>в месяц</div>
            <ul className={s.pricingFeatures}>
              {PRICING_CLOUD.map((f) => (
                <li key={f} className={s.pricingFeature}>{f}</li>
              ))}
            </ul>
            <Link to="/login" className={s.pricingCta}>Начать</Link>
          </div>
          <div className={s.pricingCard}>
            <div className={s.pricingLabel}>Self-hosted</div>
            <div className={s.pricingAmount}>$0</div>
            <div className={s.pricingPeriod}>навсегда</div>
            <ul className={s.pricingFeatures}>
              {PRICING_SELF.map((f) => (
                <li key={f} className={s.pricingFeature}>{f}</li>
              ))}
            </ul>
            <a href="https://github.com/zerox9dev/lekto" target="_blank" rel="noopener noreferrer" className={s.pricingCtaOutline}>GitHub</a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={s.footer}>
        <div className={s.footerInner}>
          <span className={s.footerCopy}>Lekto © 2025</span>
          <div className={s.footerLinks}>
            <a href="https://github.com/zerox9dev/lekto" target="_blank" rel="noopener noreferrer" className={s.footerLink}>GitHub</a>
            <a href="/privacy" className={s.footerLink}>Конфиденциальность</a>
            <a href="mailto:zerox9dev.work@icloud.com" className={s.footerLink}>Контакты</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
