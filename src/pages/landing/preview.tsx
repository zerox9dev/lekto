import { BookOpen, ClipboardList, LayoutDashboard, Library, Settings, Users } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import s from "./landing.module.css";

const CALENDAR_DAYS = [
  ["29", false, 0], ["30", false, 0], ["1", true, 1], ["2", true, 0], ["3", true, 2], ["4", true, 0], ["5", true, 0],
  ["6", true, 0], ["7", true, 1], ["8", true, 0], ["9", true, 0], ["10", true, 0], ["11", true, 1], ["12", true, 0],
  ["13", true, 0], ["14", true, 2], ["15", true, 0], ["16", true, 0], ["17", true, 1], ["18", true, 0], ["19", true, 0],
  ["20", true, 1], ["21", true, 0], ["22", true, 0], ["23", true, 1], ["24", true, 0], ["25", true, 0], ["26", true, 0],
  ["27", true, 0], ["28", true, 1], ["29", true, 0], ["30", true, 0], ["31", true, 0], ["1", false, 0], ["2", false, 0],
];

export function PreviewSection() {
  const { t } = useTranslation();

  const nav = [
    { label: t("home"), icon: LayoutDashboard, active: true },
    { label: t("students"), icon: Users },
    { label: t("courses"), icon: Library },
    { label: t("lessons"), icon: BookOpen },
    { label: t("homework"), icon: ClipboardList },
  ];

  const stats = [
    { label: t("studentsCount"), value: "12", icon: Users, tone: s.prevStatToneGreen },
    { label: t("lessonsCount"), value: "28", icon: BookOpen, tone: s.prevStatToneBlue },
    { label: t("homeworkCount"), value: "16", icon: ClipboardList, tone: s.prevStatToneGold },
  ];

  const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  return (
    <section className={s.previewSection}>
      <div className={s.previewWrap}>
        <div className={s.previewWindow}>
          <aside className={s.prevSidebar}>
            <div className={s.prevLogo}>Lekto</div>
            <nav className={s.prevNav}>
              {nav.map(({ label, icon: Icon, active }) => (
                <div key={label} className={`${s.prevNavItem} ${active ? s.prevNavActive : ""}`}>
                  <Icon className={s.prevNavIcon} />
                  <span>{label}</span>
                </div>
              ))}
            </nav>
            <div className={s.prevSidebarFooter}>
              <div className={s.prevNavItem}>
                <Settings className={s.prevNavIcon} />
                <span>{t("settings")}</span>
              </div>
            </div>
          </aside>

          <div className={s.prevMain}>
            <div className={s.prevContent}>
              <div className={s.prevDashboardHeader}>
                <h3 className={s.prevDashboardTitle}>{t("dashboardTitle")}</h3>
                <p className={s.prevDashboardDesc}>{t("dashboardDesc")}</p>
              </div>

              <div className={s.prevStatsGrid}>
                {stats.map(({ label, value, icon: Icon, tone }) => (
                  <div key={label} className={s.prevStatCard}>
                    <div className={s.prevStatHead}>
                      <div className={`${s.prevStatIcon} ${tone}`}>
                        <Icon className={s.prevStatSvg} />
                      </div>
                      <div className={s.prevStatText}>
                        <div className={s.prevStatVal}>{value}</div>
                        <div className={s.prevStatLbl}>{label}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={s.prevDashboardGrid}>
                <section className={s.prevCalendarCard}>
                  <div className={s.prevCardHead}>
                    <div>
                      <h4 className={s.prevCardTitle}>{t("calendarTitle")}</h4>
                      <p className={s.prevCardMeta}>Март 2026</p>
                    </div>
                    <div className={s.prevCalendarControls}>
                      <span className={s.prevCalendarToday}>{t("today")}</span>
                      <span className={s.prevCalendarControl}>‹</span>
                      <span className={s.prevCalendarControl}>›</span>
                    </div>
                  </div>
                  <div className={s.prevWeekdays}>
                    {weekdays.map((day) => <span key={day}>{day}</span>)}
                  </div>
                  <div className={s.prevCalendarGrid}>
                    {CALENDAR_DAYS.map(([day, currentMonth, lessons], index) => (
                      <div
                        key={`${day}-${index}`}
                        className={`${s.prevCalendarDay} ${currentMonth ? "" : s.prevCalendarDayMuted} ${day === "14" ? s.prevCalendarDayActive : ""}`}
                      >
                        <div className={s.prevCalendarDayTop}>
                          <span>{day}</span>
                          {Number(lessons) > 0 && <span className={s.prevCalendarCountTop}>{lessons}</span>}
                        </div>
                        <div className={s.prevCalendarEvents}>
                          {day === "3" && (
                            <div className={s.prevCalendarEvent}>
                              <div className={s.prevCalendarEventTitle}>Anna Kowalska</div>
                            </div>
                          )}
                          {day === "7" && (
                            <div className={s.prevCalendarEvent}>
                              <div className={s.prevCalendarEventTitle}>Maksym Bondar</div>
                            </div>
                          )}
                          {day === "14" && (
                            <>
                              <div className={s.prevCalendarEvent}>
                                <div className={s.prevCalendarEventTitle}>Piotr Nowak</div>
                              </div>
                              <div className={s.prevCalendarEvent}>
                                <div className={s.prevCalendarEventTitle}>Anna Kowalska</div>
                              </div>
                            </>
                          )}
                          {day === "17" && (
                            <div className={s.prevCalendarEvent}>
                              <div className={s.prevCalendarEventTitle}>Oleh Martyn</div>
                            </div>
                          )}
                          {day === "23" && (
                            <div className={s.prevCalendarEvent}>
                              <div className={s.prevCalendarEventTitle}>Piotr Nowak</div>
                            </div>
                          )}
                          {day === "28" && (
                            <div className={s.prevCalendarEvent}>
                              <div className={s.prevCalendarEventTitle}>Anna Kowalska</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
