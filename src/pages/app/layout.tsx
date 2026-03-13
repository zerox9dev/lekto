import { Routes, Route, NavLink, Link, useLocation } from "react-router-dom";
import { Users, Settings, LogOut, BookOpen, ClipboardList, LayoutDashboard, Library, MessageCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useStore } from "@/features/store";
import { useTranslation } from "@/lib/i18n";
import { StudentsPage } from "./students";
import { StudentDetailPage } from "./student-detail/index";
import { SettingsPage } from "./settings";
import { DashboardPage } from "./dashboard";
import { LessonsPage } from "./lessons";
import { HomeworkPage } from "./homework-list";
import { CoursesPage } from "./courses";
import { CourseDetailPage } from "./course-detail";

function useNav() {
  const { t } = useTranslation();
  return [
    { label: t("home"), icon: LayoutDashboard, href: "/app" },
    { label: t("students"), icon: Users, href: "/app/students" },
    { label: t("courses"), icon: Library, href: "/app/courses" },
    { label: t("lessons"), icon: BookOpen, href: "/app/lessons" },
    { label: t("homework"), icon: ClipboardList, href: "/app/homework" },
  ];
}

function SideLink({ href, icon: Icon, label, end }: { href: string; icon: any; label: string; end?: boolean }) {
  return (
    <NavLink to={href} end={end}
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-full px-3 py-2 text-[13px] font-medium transition-all ${
          isActive ? "bg-[#1a1a1a] text-white" : "text-[#888] hover:text-[#1a1a1a] hover:bg-[#f0ede6]"
        }`
      }>
      <Icon className="h-[16px] w-[16px]" />
      {label}
    </NavLink>
  );
}

function MobileNavItem({ to, icon: Icon, label, end }: { to: string; icon: any; label: string; end?: boolean }) {
  return (
    <NavLink to={to} end={end}
      className={({ isActive }) =>
        `flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
          isActive ? "text-[#1a1a1a]" : "text-[#888]"
        }`
      }>
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </NavLink>
  );
}

function MobileNav() {
  const nav = useNav();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#e8e5de] flex md:hidden">
      {nav.map((item) => (
        <MobileNavItem key={item.href} to={item.href} icon={item.icon} label={item.label} end={item.href === "/app"} />
      ))}
    </nav>
  );
}

export function AppLayout() {
  const { signOut, user } = useAuth();
  const { t } = useTranslation();
  const nav = useNav();
  // Initialize store with user id for tutor_id binding
  useStore(user?.id);
  return (
    <div className="min-h-screen flex bg-[#f5f3ee] overflow-x-hidden">
      <aside className="hidden md:flex h-screen w-52 flex-col border-r border-[#e8e5de] bg-white py-4 px-3 fixed top-0 left-0 z-40">
        <Link to="/" className="flex items-center gap-2.5 px-3 mb-6">
          <span className="font-bold font-serif text-[18px] tracking-tight text-[#1a1a1a]">Lekto</span>
        </Link>
        <nav className="flex-1 flex flex-col gap-0.5">
          {nav.map((item) => (
            <SideLink key={item.href} {...item} end={item.href === "/app"} />
          ))}
        </nav>
        <div className="space-y-0.5 pt-2 border-t border-[#e8e5de]">
          <SideLink href="/app/settings" icon={Settings} label={t("settings")} />
          <button onClick={signOut}
            className="flex items-center gap-2.5 rounded-full px-3 py-2 text-[13px] font-medium w-full text-[#888] hover:text-[#666] hover:bg-[#f0ede6] transition-all cursor-pointer">
            <LogOut className="h-[16px] w-[16px]" /> {t("logout")}
          </button>
        </div>
      </aside>
      <main className="flex-1 min-h-screen pb-16 md:pb-0 overflow-x-hidden min-w-0 md:ml-52">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-8">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/students/:id" element={<StudentDetailPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/lessons" element={<LessonsPage />} />
            <Route path="/homework" element={<HomeworkPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </main>
      {/* Support button */}
      <a
        href="https://t.me/mirvald"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 h-11 px-4 rounded-full bg-[#1a1a1a] text-white text-[13px] font-medium flex items-center gap-2 hover:bg-[#333] transition-colors"
      >
        <MessageCircle className="h-4 w-4" /> {t("support")}
      </a>
      <MobileNav />
    </div>
  );
}
