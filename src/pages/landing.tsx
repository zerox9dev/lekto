import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  ClipboardCheck,
  Link2,
  ArrowRight,
  Sparkles,
  Zap,
  BarChart3,
  Smartphone,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Ученики",
    desc: "Добавляйте учеников, давайте каждому персональную ссылку. Без регистрации для них.",
    color: "#818cf8",
    bg: "#eef2ff",
  },
  {
    icon: BookOpen,
    title: "Уроки",
    desc: "Создавайте конспекты, прикрепляйте материалы к каждому занятию.",
    color: "#34d399",
    bg: "#ecfdf5",
  },
  {
    icon: ClipboardCheck,
    title: "Домашние задания",
    desc: "10 типов заданий с автопроверкой: тесты, вставить слово, пары, порядок и другие.",
    color: "#f472b6",
    bg: "#fdf2f8",
  },
  {
    icon: Link2,
    title: "Ссылка ученику",
    desc: "Ученик открывает ссылку и видит свои уроки и домашки. Просто и удобно.",
    color: "#38bdf8",
    bg: "#f0f9ff",
  },
  {
    icon: Zap,
    title: "Шаблоны заданий",
    desc: "Создавайте шаблоны домашек и используйте повторно для разных учеников.",
    color: "#fbbf24",
    bg: "#fffbeb",
  },
  {
    icon: BarChart3,
    title: "Прогресс",
    desc: "Смотрите результаты учеников: что сделано, какие ошибки, где нужна помощь.",
    color: "#a78bfa",
    bg: "#f5f3ff",
  },
];

const steps = [
  { num: "01", title: "Создайте урок", desc: "Добавьте тему, конспект и материалы" },
  { num: "02", title: "Назначьте домашку", desc: "Выберите тип задания и создайте за минуту" },
  { num: "03", title: "Отправьте ссылку", desc: "Ученик откроет и начнёт выполнять" },
];

const benefits = [
  "Бесплатно навсегда",
  "Без рекламы",
  "Без ограничений",
  "Без карты",
  "Работает на телефоне",
  "Данные в безопасности",
];

export function LandingPage() {
  return (
    <div className="landing">
      <style>{`
        .landing {
          --accent: #818cf8;
          --accent-light: #c7d2fe;
          --gradient-start: #818cf8;
          --gradient-end: #38bdf8;
          font-family: 'Inter', -apple-system, sans-serif;
          min-height: 100vh;
          background: #fff;
          color: #0f172a;
          overflow-x: hidden;
        }

        /* NAV */
        .l-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .l-nav-inner {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 24px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .l-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: inherit;
        }
        .l-logo-icon {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .l-logo-icon svg { color: #fff; width: 18px; height: 18px; }
        .l-logo-text { font-weight: 700; font-size: 18px; letter-spacing: -0.02em; }
        .l-nav-btn {
          padding: 8px 20px;
          border-radius: 10px;
          background: #0f172a;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .l-nav-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }

        /* HERO */
        .l-hero {
          position: relative;
          padding: 80px 24px 100px;
          text-align: center;
          overflow: hidden;
        }
        .l-hero::before {
          content: '';
          position: absolute;
          top: -200px;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(129,140,248,0.15) 0%, rgba(56,189,248,0.08) 40%, transparent 70%);
          pointer-events: none;
        }
        .l-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          border-radius: 100px;
          background: linear-gradient(135deg, #eef2ff, #f0f9ff);
          font-size: 13px;
          font-weight: 600;
          color: #6366f1;
          margin-bottom: 24px;
        }
        .l-hero-badge svg { width: 14px; height: 14px; }
        .l-hero h1 {
          font-size: clamp(36px, 6vw, 64px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin-bottom: 20px;
          position: relative;
        }
        .l-hero h1 span {
          background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .l-hero-desc {
          font-size: 18px;
          line-height: 1.6;
          color: #64748b;
          max-width: 520px;
          margin: 0 auto 32px;
        }
        .l-hero-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 32px;
          border-radius: 14px;
          background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
          color: #fff;
          font-size: 16px;
          font-weight: 700;
          text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(129,140,248,0.35);
        }
        .l-hero-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(129,140,248,0.45); }
        .l-hero-cta svg { width: 18px; height: 18px; }

        /* FEATURES */
        .l-section {
          max-width: 1120px;
          margin: 0 auto;
          padding: 80px 24px;
        }
        .l-section-title {
          text-align: center;
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 12px;
        }
        .l-section-desc {
          text-align: center;
          font-size: 16px;
          color: #64748b;
          max-width: 480px;
          margin: 0 auto 48px;
        }
        .l-features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .l-feature {
          padding: 28px;
          border-radius: 20px;
          border: 1px solid rgba(0,0,0,0.06);
          background: #fff;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .l-feature:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.06); }
        .l-feature-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        .l-feature-icon svg { width: 22px; height: 22px; }
        .l-feature h3 { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
        .l-feature p { font-size: 14px; line-height: 1.6; color: #64748b; }

        /* STEPS */
        .l-steps-bg {
          background: #0f172a;
          color: #fff;
        }
        .l-steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }
        .l-step-num {
          font-size: 48px;
          font-weight: 800;
          background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 12px;
        }
        .l-step h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
        .l-step p { font-size: 14px; color: #94a3b8; line-height: 1.6; }

        /* BENEFITS */
        .l-benefits {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
          margin-top: 32px;
        }
        .l-benefit {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          border-radius: 100px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          font-size: 14px;
          font-weight: 500;
          color: #334155;
        }
        .l-benefit svg { width: 16px; height: 16px; color: #34d399; }

        /* CTA */
        .l-cta-bg {
          background: linear-gradient(135deg, #eef2ff 0%, #f0f9ff 50%, #fdf2f8 100%);
        }
        .l-cta-inner {
          text-align: center;
        }
        .l-cta-inner h2 {
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 16px;
        }
        .l-cta-inner p {
          font-size: 16px;
          color: #64748b;
          margin-bottom: 32px;
        }

        /* FOOTER */
        .l-footer {
          border-top: 1px solid #f1f5f9;
          padding: 24px;
        }
        .l-footer-inner {
          max-width: 1120px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
          color: #94a3b8;
        }
        .l-footer a { color: #64748b; text-decoration: none; }
        .l-footer a:hover { color: #0f172a; }

        /* MOBILE */
        @media (max-width: 768px) {
          .l-hero { padding: 48px 20px 64px; }
          .l-hero-desc { font-size: 16px; }
          .l-features { grid-template-columns: 1fr; }
          .l-steps { grid-template-columns: 1fr; gap: 24px; }
          .l-section { padding: 56px 20px; }
          .l-benefits { gap: 8px; }
          .l-benefit { font-size: 13px; padding: 8px 14px; }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .l-features { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      {/* Nav */}
      <header className="l-nav">
        <div className="l-nav-inner">
          <Link to="/" className="l-logo">
            <div className="l-logo-icon"><Sparkles /></div>
            <span className="l-logo-text">Lekto</span>
          </Link>
          <Link to="/login" className="l-nav-btn">Войти</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="l-hero">
        <div className="l-hero-badge">
          <Zap /> Бесплатно для репетиторов
        </div>
        <h1>
          Платформа для
          <br />
          <span>репетиторов</span>
        </h1>
        <p className="l-hero-desc">
          Создавайте уроки, назначайте интерактивные домашки и делитесь ссылкой с учеником. Ему не нужно регистрироваться.
        </p>
        <Link to="/login" className="l-hero-cta">
          Начать бесплатно <ArrowRight />
        </Link>
      </section>

      {/* Features */}
      <section className="l-section">
        <h2 className="l-section-title">Всё для уроков</h2>
        <p className="l-section-desc">
          Создавайте, назначайте, проверяйте — всё в одном месте
        </p>
        <div className="l-features">
          {features.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="l-feature">
              <div className="l-feature-icon" style={{ background: bg }}>
                <Icon style={{ color }} />
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="l-steps-bg">
        <div className="l-section">
          <h2 className="l-section-title" style={{ color: "#fff" }}>Как это работает</h2>
          <p className="l-section-desc" style={{ color: "#94a3b8" }}>
            Три шага — и ученик уже делает домашку
          </p>
          <div className="l-steps">
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="l-step">
                <div className="l-step-num">{num}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="l-section">
        <h2 className="l-section-title">Почему Lekto?</h2>
        <p className="l-section-desc">Создано репетитором для репетиторов</p>
        <div className="l-benefits">
          {benefits.map((b) => (
            <div key={b} className="l-benefit">
              <CheckCircle2 /> {b}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="l-cta-bg">
        <div className="l-section l-cta-inner">
          <h2>Готовы начать?</h2>
          <p>Создайте первый урок за 2 минуты. Бесплатно.</p>
          <Link to="/login" className="l-hero-cta">
            Создать аккаунт <ArrowRight />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="l-footer">
        <div className="l-footer-inner">
          <span>© {new Date().getFullYear()} Lekto</span>
          <a href="https://zerox9dev.com">zerox9dev</a>
        </div>
      </footer>
    </div>
  );
}
