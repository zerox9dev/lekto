import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { LandingPage } from "@/pages/landing";
import { LoginPage } from "@/pages/login";
import { AppLayout } from "@/pages/app/layout";
import { SectionEditorPage } from "@/pages/app/section-editor";
import { StudentView } from "@/pages/student-view";

function ProtectedApp() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <AppLayout />;
}

function ProtectedEditor() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <SectionEditorPage />;
}

function LoginRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/app" replace />;
  return <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/app/students/:id/homework/:hwId/edit" element={<ProtectedEditor />} />
          <Route path="/app/students/:id/lesson/:lessonId/edit" element={<ProtectedEditor />} />
          <Route path="/app/*" element={<ProtectedApp />} />
          <Route path="/s/:shareId" element={<StudentView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
