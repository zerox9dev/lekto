import { Routes, Route, NavLink, Link } from "react-router-dom";
import { Users, BookOpen, ClipboardCheck, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { StudentsPage } from "./students";
import { LessonsPage } from "./lessons";
import { HomeworkPage } from "./homework";
import { SettingsPage } from "./settings";

const nav = [
  { label: "Students", icon: Users, href: "/app" },
  { label: "Lessons", icon: BookOpen, href: "/app/lessons" },
  { label: "Homework", icon: ClipboardCheck, href: "/app/homework" },
];

export function AppLayout() {
  const { signOut } = useAuth();
  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex h-screen w-48 flex-col border-r border-gray-200 bg-white py-5 px-3 sticky top-0">
        <Link to="/" className="flex items-center gap-2 px-3 mb-8">
          <div className="h-7 w-7 rounded-md bg-indigo-500 text-white font-bold text-xs flex items-center justify-center">L</div>
          <span className="font-bold">Lekto</span>
        </Link>
        <nav className="flex-1 flex flex-col gap-0.5">
          {nav.map((item) => (
            <NavLink key={item.href} to={item.href} end={item.href === "/app"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${isActive ? "bg-gray-100 font-semibold" : "hover:bg-gray-100"}`
              }>
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-0.5">
          <NavLink to="/app/settings" className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${isActive ? "bg-gray-100 font-semibold" : "hover:bg-gray-100"}`}>
            <Settings className="h-[18px] w-[18px]" /> Settings
          </NavLink>
          <button onClick={signOut} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium w-full hover:bg-gray-100 transition-colors text-gray-400 cursor-pointer">
            <LogOut className="h-[18px] w-[18px]" /> Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 lg:p-8 max-w-5xl">
        <Routes>
          <Route path="/" element={<StudentsPage />} />
          <Route path="/lessons" element={<LessonsPage />} />
          <Route path="/homework" element={<HomeworkPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}
