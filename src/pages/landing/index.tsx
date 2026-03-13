import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { GraduationCap, School, Globe, Library, BookOpen, PenLine, LinkIcon, BarChart3, FileText, TrendingUp, Smartphone, Palette } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import s from "./landing.module.css";
import { PreviewSection } from "./preview";

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

const AUDIENCE_META = [
  { icon: GraduationCap, titleKey: "landingAudience1Title", descKey: "landingAudience1Desc", bg: s.audienceEmoji1 },
  { icon: School, titleKey: "landingAudience2Title", descKey: "landingAudience2Desc", bg: s.audienceEmoji2 },
  { icon: Globe, titleKey: "landingAudience3Title", descKey: "landingAudience3Desc", bg: s.audienceEmoji3 },
  { icon: Library, titleKey: "landingAudience4Title", descKey: "landingAudience4Desc", bg: s.audienceEmoji4 },
];

const FEATURES_META = [
  { icon: BookOpen, titleKey: "landingFeature1Title", descKey: "landingFeature1Desc" },
  { icon: PenLine, titleKey: "landingFeature2Title", descKey: "landingFeature2Desc" },
  { icon: LinkIcon, titleKey: "landingFeature3Title", descKey: "landingFeature3Desc" },
  { icon: BarChart3, titleKey: "landingFeature4Title", descKey: "landingFeature4Desc" },
];

const BENEFITS_META = [
  { icon: FileText, titleKey: "landingBenefit1Title", descKey: "landingBenefit1Desc" },
  { icon: TrendingUp, titleKey: "landingBenefit2Title", descKey: "landingBenefit2Desc" },
  { icon: LinkIcon, titleKey: "landingBenefit3Title", descKey: "landingBenefit3Desc" },
  { icon: Smartphone, titleKey: "landingBenefit4Title", descKey: "landingBenefit4Desc" },
  { icon: Palette, titleKey: "landingBenefit5Title", descKey: "landingBenefit5Desc" },
];

const PRICING_CLOUD_KEYS = [
  "landingPricingCloudF1", "landingPricingCloudF2", "landingPricingCloudF3",
  "landingPricingCloudF4", "landingPricingCloudF5", "landingPricingCloudF6",
];

const PRICING_SELF_KEYS = [
  "landingPricingSelfF1", "landingPricingSelfF2", "landingPricingSelfF3", "landingPricingSelfF4",
];

export function LandingPage() {
  const { t } = useTranslation();
  return (
    <div className={s.landing}>
      <div className={s.navWrap}>
        <nav className={s.nav}>
          <Link to="/" className={s.logo}>Lekto</Link>
          <div className={s.navLinks}>
            <a href="#features" className={s.navLink}>{t("landingNavFeatures")}</a>
            <a href="#audience" className={s.navLink}>{t("landingNavAudience")}</a>
            <a href="#pricing" className={s.navLink}>{t("landingNavPricing")}</a>
          </div>
          <a href="https://t.me/mirvald" target="_blank" rel="noopener noreferrer" className={s.navCta}>{t("landingNavCta")}</a>
        </nav>
      </div>

      <section className={s.hero}>
        <h1 className={s.heroTitle}>
          {t("landingHeroTitle").split("\n").map((line, i, arr) => <span key={i}>{line}{i < arr.length - 1 && <br />}</span>)}
        </h1>
        <p className={s.heroDesc}>{t("landingHeroDesc")}</p>
        <Link to="/login" className={s.heroCta}>{t("landingHeroCta")}</Link>
        <p className={s.heroNote}>{t("landingHeroNote")}</p>
      </section>

      <PreviewSection />

      <Reveal id="audience" className={s.section}>
        <h2 className={s.sectionTitle}>{t("landingAudienceTitle")}</h2>
        <p className={s.sectionDesc}>{t("landingAudienceDesc")}</p>
        <div className={s.audienceGrid}>
          {AUDIENCE_META.map((a) => (
            <div key={a.titleKey} className={s.audienceCard}>
              <div className={`${s.audienceEmoji} ${a.bg}`}><a.icon className="h-6 w-6 text-[#555]" /></div>
              <h3 className={s.audienceName}>{t(a.titleKey)}</h3>
              <p className={s.audienceDesc}>{t(a.descKey)}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal id="features" className={s.section}>
        <h2 className={s.sectionTitle}>{t("landingFeaturesTitle")}</h2>
        <p className={s.sectionDesc}>{t("landingFeaturesDesc")}</p>
        <div className={s.featuresGrid}>
          {FEATURES_META.map((f) => (
            <div key={f.titleKey} className={s.featureCard}>
              <div className={s.featureIcon}><f.icon className="h-7 w-7 text-[#555]" /></div>
              <h3 className={s.featureName}>{t(f.titleKey)}</h3>
              <p className={s.featureDesc}>{t(f.descKey)}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal className={s.section}>
        <h2 className={s.sectionTitle}>{t("landingBenefitsTitle")}</h2>
        <p className={s.sectionDesc}>{t("landingBenefitsDesc")}</p>
        <div className={s.benefitsWrap}>
          <div className={s.benefitsRow}>
            {BENEFITS_META.map((b) => (
              <div key={b.titleKey} className={s.benefitCard}>
                <div className={s.benefitEmoji}><b.icon className="h-7 w-7 text-[#555]" /></div>
                <h3 className={s.benefitName}>{t(b.titleKey)}</h3>
                <p className={s.benefitDesc}>{t(b.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
        <div className={s.statsRow}>
          <div className={s.stat}><div className={s.statValue}>{t("landingStat1Value")}</div><div className={s.statLabel}>{t("landingStat1Label")}</div></div>
          <div className={s.stat}><div className={s.statValue}>{t("landingStat2Value")}</div><div className={s.statLabel}>{t("landingStat2Label")}</div></div>
          <div className={s.stat}><div className={s.statValue}>{t("landingStat3Value")}</div><div className={s.statLabel}>{t("landingStat3Label")}</div></div>
        </div>
      </Reveal>

      <Reveal id="pricing" className={s.section}>
        <h2 className={s.sectionTitle}>{t("landingPricingTitle")}</h2>
        <p className={s.sectionDesc}>{t("landingPricingDesc")}</p>
        <div className={s.pricingGrid}>
          <div className={s.pricingCard}>
            <div className={s.pricingLabel}>{t("landingPricingCloud")}</div>
            <div className={s.pricingAmount}>{t("landingPricingAmount")}</div>
            <div className={s.pricingPeriod}>{t("landingPricingPeriod")}</div>
            <ul className={s.pricingFeatures}>
              {PRICING_CLOUD_KEYS.map((k) => <li key={k} className={s.pricingFeature}>{t(k)}</li>)}
            </ul>
            <a href="https://t.me/mirvald" target="_blank" rel="noopener noreferrer" className={s.pricingCta}>{t("landingPricingStart")}</a>
          </div>
          <div className={s.pricingCard}>
            <div className={s.pricingLabel}>{t("landingPricingSelf")}</div>
            <div className={s.pricingAmount}>{t("landingPricingSelfAmount")}</div>
            <div className={s.pricingPeriod}>{t("landingPricingSelfPeriod")}</div>
            <ul className={s.pricingFeatures}>
              {PRICING_SELF_KEYS.map((k) => <li key={k} className={s.pricingFeature}>{t(k)}</li>)}
            </ul>
            <a href="https://github.com/zerox9dev/lekto" target="_blank" rel="noopener noreferrer" className={s.pricingCtaOutline}>GitHub</a>
          </div>
        </div>
      </Reveal>

      <footer className={s.footer}>
        <div className={s.footerInner}>
          <span className={s.footerCopy}>{t("landingFooterCopy")}</span>
          <div className={s.footerLinks}>
            <a href="https://github.com/zerox9dev/lekto" target="_blank" rel="noopener noreferrer" className={s.footerLink}>{t("landingFooterGithub")}</a>
            <a href="https://t.me/mirvald" target="_blank" rel="noopener noreferrer" className={s.footerLink}>{t("landingFooterSupport")}</a>
            <a href="/privacy" className={s.footerLink}>{t("landingFooterPrivacy")}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
