import { useTranslation } from "@/lib/i18n";
import s from "./landing.module.css";

export function PreviewSection() {
  const { t } = useTranslation();
  return (
    <section className={s.previewSection}>
      <div className={s.previewWrap}>
        <div className={s.previewWindow}>
          <div className={s.prevSidebar}>
            <div className={s.prevLogo}>Lekto</div>
            <div className={`${s.prevNavItem} ${s.prevNavActive}`}>{t("landingPreviewStudents")}</div>
            <div className={s.prevNavItem}>{t("landingPreviewCourses")}</div>
            <div className={s.prevNavItem}>{t("landingPreviewSettings")}</div>
          </div>
          <div className={s.prevMain}>
            <div className={s.prevContent}>
              <div className={s.prevPageHeader}>
                <div className={s.prevBackBtn}>←</div>
                <div className={s.prevPageTitle}>Piotr Nowak</div>
                <span className={s.prevAddBtn}>{t("landingPreviewAddLesson")}</span>
              </div>
              <div className={s.prevStats}>
                <div className={s.prevStatCard}><div className={s.prevStatVal}>12</div><div className={s.prevStatLbl}>{t("landingPreviewLessons")}</div></div>
                <div className={s.prevStatCard}><div className={s.prevStatVal}>8</div><div className={s.prevStatLbl}>{t("landingPreviewHomework")}</div></div>
                <div className={s.prevStatCard}><div className={s.prevStatVal}>85%</div><div className={s.prevStatLbl}>{t("landingPreviewAvgScore")}</div></div>
              </div>
              <div className={`${s.prevLesson} ${s.prevLessonOpen}`}>
                <div className={s.prevLessonHeader}>
                  <span className={s.prevDot} /><span className={s.prevLessonName}>Lesson 2: Numbers &amp; Colors</span><span className={s.prevDate}>15 окт</span>
                </div>
                <div className={s.prevLessonBody}>
                  <div className={s.prevTags}>
                    <span className={s.prevTag}>{t("landingPreviewTheory")}</span>
                    <span className={s.prevTag}>{t("landingPreviewCards")}</span>
                    <span className={s.prevTag}>{t("landingPreviewTest")}</span>
                    <span className={s.prevTag}>{t("landingPreviewBlanks")}</span>
                  </div>
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
                    <span className={s.prevHwName}>{t("homeworkTitle")}: Numbers &amp; Colors</span>
                    <span className={s.prevHwBadge}>92%</span>
                  </div>
                </div>
              </div>
              <div className={s.prevLesson}>
                <span className={s.prevDot} /><span className={s.prevLessonName}>Lesson 1: Greetings &amp; Basics</span><span className={s.prevDate}>12 окт</span>
              </div>
              <div className={s.prevLesson}>
                <span className={`${s.prevDot} ${s.prevDotGray}`} /><span className={s.prevLessonName}>Lesson 3: Food &amp; Drink</span><span className={s.prevDate}>18 окт</span>
              </div>
            </div>
          </div>
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
  );
}
