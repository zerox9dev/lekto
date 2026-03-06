import { Routes, Route, NavLink, Link } from "react-router-dom";
import { Users, BookOpen, ClipboardCheck, Settings, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { StudentsPage } from "./students";
import { LessonsPage } from "./lessons";
import { HomeworkPage } from "./homework";
import { SettingsPage } from "./settings";

const nav = [
  { label: "Ученики", icon: Users, href: "/app" },
  { label: "Уроки", icon: BookOpen, href: "/app/lessons" },
  { label: "Домашки", icon: ClipboardCheck, href: "/app/homework" },
];

function SideLink({ href, icon: Icon, label, end }: { href: string; icon: any; label: string; end?: boolean }) {
  return (
    <NavLink to={href} end={end}
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-all ${
          isActive
            ? "bg-zinc-900 text-white"
            : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
        }`
      }>
      <Icon className="h-[16px] w-[16px]" />
      {label}
    </NavLink>
  );
}

export function AppLayout() {
  const { signOut, user } = useAuth();
  return (
    <div className="min-h-screen flex bg-zinc-50">
      {/* Sidebar */}
      <aside className="hidden md:flex h-screen w-52 flex-col border-r border-zinc-200 bg-white py-4 px-3 sticky top-0">
        <Link to="/" className="flex items-center gap-2.5 px-3 mb-6">
          <div className="h-7 w-7 rounded-lg bg-zinc-900 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-semibold text-[14px] tracking-tight">Lekto</span>
        </Link>

        <nav className="flex-1 flex flex-col gap-0.5">
          {nav.map((item) => (
            <SideLink key={item.href} {...item} end={item.href === "/app"} />
          ))}
        </nav>

        <div className="space-y-0.5 pt-2 border-t border-zinc-100">
          <SideLink href="/app/settings" icon={Settings} label="Настройки" />
          <button
            onClick={signOut}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium w-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-all cursor-pointer"
          >
            <LogOut className="h-[16px] w-[16px]" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-h-screen">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<StudentsPage />} />
            <Route path="/lessons" element={<LessonsPage />} />
            <Route path="/homework" element={<HomeworkPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
