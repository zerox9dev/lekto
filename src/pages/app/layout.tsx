import { Routes, Route, NavLink, Link, useLocation } from "react-router-dom";
import { Users, Settings, LogOut, GraduationCap } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { StudentsPage } from "./students";
import { StudentDetailPage } from "./student-detail";
import { SettingsPage } from "./settings";

const nav = [
  { label: "Ученики", icon: Users, href: "/app" },
];

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

function MobileNav() {
  const location = useLocation();
  const isApp = location.pathname === "/app" || location.pathname === "/app/";
  const isSettings = location.pathname === "/app/settings";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#e8e5de] flex md:hidden">
      <NavLink to="/app" end
        className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
          isApp ? "text-[#1a1a1a]" : "text-[#888]"
        }`}>
        <Users className="h-5 w-5" />
        <span>Ученики</span>
      </NavLink>
      <NavLink to="/app/settings"
        className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
          isSettings ? "text-[#1a1a1a]" : "text-[#888]"
        }`}>
        <Settings className="h-5 w-5" />
        <span>Настройки</span>
      </NavLink>
    </nav>
  );
}

export function AppLayout() {
  const { signOut } = useAuth();
  return (
    <div className="min-h-screen flex bg-[#f5f3ee] overflow-x-hidden">
      <aside className="hidden md:flex h-screen w-52 flex-col border-r border-[#e8e5de] bg-white py-4 px-3 sticky top-0">
        <Link to="/" className="flex items-center gap-2.5 px-3 mb-6">
          <div className="h-7 w-7 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
            <GraduationCap className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-semibold font-serif text-[14px] tracking-tight">Lekto</span>
        </Link>
        <nav className="flex-1 flex flex-col gap-0.5">
          {nav.map((item) => (
            <SideLink key={item.href} {...item} end={item.href === "/app"} />
          ))}
        </nav>
        <div className="space-y-0.5 pt-2 border-t border-[#e8e5de]">
          <SideLink href="/app/settings" icon={Settings} label="Настройки" />
          <button onClick={signOut}
            className="flex items-center gap-2.5 rounded-full px-3 py-2 text-[13px] font-medium w-full text-[#888] hover:text-[#666] hover:bg-[#f0ede6] transition-all cursor-pointer">
            <LogOut className="h-[16px] w-[16px]" /> Выйти
          </button>
        </div>
      </aside>
      <main className="flex-1 min-h-screen pb-16 md:pb-0 overflow-x-hidden min-w-0">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-8">
          <Routes>
            <Route path="/" element={<StudentsPage />} />
            <Route path="/students/:id" element={<StudentDetailPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
