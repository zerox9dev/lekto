import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { GraduationCap, School, Globe, Library, BookOpen, PenLine, LinkIcon, BarChart3, FileText, TrendingUp, Smartphone, Palette } from "lucide-react";
import s from "./landing.module.css";

function useReveal() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add(s.revealVisible); observer.unobserve(el); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useReveal();
  return <section ref={ref} id={id} className={`${s.reveal} ${className}`}>{children}</section>;
}

const AUDIENCE = [
  { icon: GraduationCap, title: "Репетиторы", desc: "Ведут уроки один на один и хотят всё в одном месте", bg: s.audienceEmoji1 },
  { icon: School, title: "Преподаватели", desc: "Работают с группами и нужен порядок в материалах", bg: s.audienceEmoji2 },
  { icon: Globe, title: "Онлайн-учителя", desc: "Преподают удалённо и хотят удобную платформу", bg: s.audienceEmoji3 },
  { icon: Library, title: "Языковые школы", desc: "Нужна структура для нескольких преподавателей", bg: s.audienceEmoji4 },
];

const FEATURES = [
  { icon: BookOpen, title: "Уроки и конспекты", desc: "Создавайте конспекты, прикрепляйте материалы к каждому занятию" },
  { icon: PenLine, title: "10 типов домашек", desc: "Тесты, вставить слово, пары, сортировка, карточки — с автопроверкой" },
  { icon: LinkIcon, title: "Ссылка ученику", desc: "Ученик открывает ссылку и видит свои уроки и домашки. Без регистрации" },
  { icon: BarChart3, title: "Статистика", desc: "Следите за прогрессом каждого ученика" },
];

const BENEFITS = [
  { icon: FileText, title: "Интерактивные домашки", desc: "10 типов заданий с автопроверкой" },
  { icon: TrendingUp, title: "Прогресс учеников", desc: "Статистика по каждому ученику" },
  { icon: LinkIcon, title: "Персональная ссылка", desc: "Ученик видит всё без регистрации" },
  { icon: Smartphone, title: "Мобильная версия", desc: "Работает на любом устройстве" },
  { icon: Palette, title: "Шаблоны заданий", desc: "Создавайте и используйте повторно" },
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

      {/* ── Preview ── */}
      <section className={s.previewSection}>
        <div className={s.previewWrap}>
          <div className={s.previewWindow}>
            {/* Sidebar */}
            <div className={s.prevSidebar}>
              <div className={s.prevLogo}>Lekto</div>
              <div className={`${s.prevNavItem} ${s.prevNavActive}`}>Ученики</div>
              <div className={s.prevNavItem}>Курсы</div>
              <div className={s.prevNavItem}>Настройки</div>
            </div>
            {/* Main content */}
            <div className={s.prevMain}>
              <div className={s.prevContent}>
                <div className={s.prevPageHeader}>
                  <div className={s.prevBackBtn}>←</div>
                  <div className={s.prevPageTitle}>Piotr Nowak</div>
                  <span className={s.prevAddBtn}>+ Урок</span>
                </div>
                {/* Stats */}
                <div className={s.prevStats}>
                  <div className={s.prevStatCard}><div className={s.prevStatVal}>12</div><div className={s.prevStatLbl}>Уроков</div></div>
                  <div className={s.prevStatCard}><div className={s.prevStatVal}>8</div><div className={s.prevStatLbl}>Домашек</div></div>
                  <div className={s.prevStatCard}><div className={s.prevStatVal}>85%</div><div className={s.prevStatLbl}>Средний балл</div></div>
                </div>
                {/* Lesson expanded */}
                <div className={`${s.prevLesson} ${s.prevLessonOpen}`}>
                  <div className={s.prevLessonHeader}>
                    <span className={s.prevDot} /><span className={s.prevLessonName}>Lesson 2: Numbers &amp; Colors</span><span className={s.prevDate}>15 окт</span>
                  </div>
                  <div className={s.prevLessonBody}>
                    <div className={s.prevTags}>
                      <span className={s.prevTag}>Теория</span>
                      <span className={s.prevTag}>Карточки</span>
                      <span className={s.prevTag}>Тест</span>
                      <span className={s.prevTag}>Пропуски</span>
                    </div>
                    {/* Quiz preview */}
                    <div className={s.prevQuiz}>
                      <div className={s.prevQuizQ}>Jak masz na imię?</div>
                      <div className={s.prevQuizOptions}>
                        <div className={s.prevQuizOpt}>Mam pięć lat</div>
                        <div className={`${s.prevQuizOpt} ${s.prevQuizCorrect}`}>Mam na imię Piotr</div>
                        <div className={s.prevQuizOpt}>Jestem z Polski</div>
                      </div>
                    </div>
                    <div className={s.prevHw}>
                      <span className={s.prevHwCheck}>✓</span>
                      <span className={s.prevHwName}>Домашка: Numbers &amp; Colors</span>
                      <span className={s.prevHwBadge}>92%</span>
                    </div>
                  </div>
                </div>
                {/* More lessons */}
                <div className={s.prevLesson}>
                  <span className={s.prevDot} /><span className={s.prevLessonName}>Lesson 1: Greetings &amp; Basics</span><span className={s.prevDate}>12 окт</span>
                </div>
                <div className={s.prevLesson}>
                  <span className={`${s.prevDot} ${s.prevDotGray}`} /><span className={s.prevLessonName}>Lesson 3: Food &amp; Drink</span><span className={s.prevDate}>18 окт</span>
                </div>
              </div>
            </div>
            {/* Student phone mockup */}
            <div className={s.prevPhone}>
              <div className={s.prevPhoneBar}>Ученик · Piotr</div>
              <div className={s.prevPhoneContent}>
                <div className={s.prevPhoneCard}>
                  <div className={s.prevPhoneCardFront}>Dzień dobry</div>
                </div>
                <div className={s.prevPhoneCardBack}>Доброе утро</div>
                <div className={s.prevPhoneDots}>
                  <span className={s.prevPhoneDotActive} />
                  <span className={s.prevPhoneDotInactive} />
                  <span className={s.prevPhoneDotInactive} />
                </div>
                <div className={s.prevPhoneFill}>
                  <div className={s.prevPhoneFillLabel}>Вставьте слово:</div>
                  <div className={s.prevPhoneFillText}>Mam na ___ Piotr</div>
                  <div className={s.prevPhoneFillInput}>imię</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
            </div>
          </div>
        </div>
      </section>

      {/* ── Who this is for ── */}
      <Reveal id="audience" className={s.section}>
        <h2 className={s.sectionTitle}>Для кого это</h2>
        <p className={s.sectionDesc}>Помогаем репетиторам организовать работу и сделать обучение удобнее</p>
        <div className={s.audienceGrid}>
          {AUDIENCE.map((a) => (
            <div key={a.title} className={s.audienceCard}>
              <div className={`${s.audienceEmoji} ${a.bg}`}><a.icon className="h-6 w-6 text-[#555]" /></div>
              <h3 className={s.audienceName}>{a.title}</h3>
              <p className={s.audienceDesc}>{a.desc}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ── Features ── */}
      <Reveal id="features" className={s.section}>
        <h2 className={s.sectionTitle}>Всё что нужно для занятий</h2>
        <p className={s.sectionDesc}>Каждая функция решает реальную проблему репетитора</p>
        <div className={s.featuresGrid}>
          {FEATURES.map((f) => (
            <div key={f.title} className={s.featureCard}>
              <div className={s.featureIcon}><f.icon className="h-7 w-7 text-[#555]" /></div>
              <h3 className={s.featureName}>{f.title}</h3>
              <p className={s.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ── What you get – horizontal scroll ── */}
      <Reveal className={s.section}>
        <h2 className={s.sectionTitle}>Что вы получаете</h2>
        <p className={s.sectionDesc}>Всё для продуктивных занятий</p>
        <div className={s.benefitsWrap}>
          <div className={s.benefitsRow}>
            {BENEFITS.map((b) => (
              <div key={b.title} className={s.benefitCard}>
                <div className={s.benefitEmoji}><b.icon className="h-7 w-7 text-[#555]" /></div>
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
      </Reveal>

      {/* ── Pricing ── */}
      <Reveal id="pricing" className={s.section}>
        <h2 className={s.sectionTitle}>Beta</h2>
        <p className={s.sectionDesc}>Набираем первых пользователей</p>
        <div className={s.pricingGrid}>
          <div className={s.pricingCard}>
            <div className={s.pricingLabel}>Beta</div>
            <div className={s.pricingAmount}>$0</div>
            <div className={s.pricingPeriod}>бесплатный триал на месяц</div>
            <ul className={s.pricingFeatures}>
              {PRICING_CLOUD.map((f) => (
                <li key={f} className={s.pricingFeature}>{f}</li>
              ))}
            </ul>
            <a href="https://t.me/mirvald" target="_blank" rel="noopener noreferrer" className={s.pricingCta}>Написать в Telegram</a>
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
      </Reveal>

      {/* ── Footer ── */}
      <footer className={s.footer}>
        <div className={s.footerInner}>
          <span className={s.footerCopy}>Lekto © 2025</span>
          <div className={s.footerLinks}>
            <a href="https://github.com/zerox9dev/lekto" target="_blank" rel="noopener noreferrer" className={s.footerLink}>GitHub</a>
            <a href="https://t.me/mirvald" target="_blank" rel="noopener noreferrer" className={s.footerLink}>Поддержка</a>
            <a href="/privacy" className={s.footerLink}>Конфиденциальность</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
