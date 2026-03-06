import { Link } from "react-router-dom";
import { BookOpen, Users, ClipboardCheck, Share2 } from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">L</div>
            <span className="font-bold text-lg">Lekto</span>
          </div>
          <Link to="/app" className="text-sm font-medium text-indigo-500 hover:underline">Sign In</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Lessons & homework for tutors</h1>
          <p className="text-lg text-gray-500">Create lessons, assign interactive homework, and share a simple link with your students. No student account needed.</p>
          <Link to="/app" className="inline-flex items-center justify-center mt-8 px-6 py-3 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors">
            Get Started — Free
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            { icon: Users, title: "Students", desc: "Add students, give each a private link to view their lessons and homework." },
            { icon: BookOpen, title: "Lessons", desc: "Create lesson notes with materials for each session. Students see their history." },
            { icon: ClipboardCheck, title: "Interactive Homework", desc: "Quizzes, fill-in-the-blanks, matching, ordering — auto-graded and fun." },
            { icon: Share2, title: "Share Link", desc: "Each student gets a unique link. No signup, no password. Not indexed by search engines." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-gray-200 p-6">
              <Icon className="h-6 w-6 text-indigo-500 mb-3" />
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Lekto · Built by <a href="https://zerox9dev.com" className="underline">zerox9dev</a>
      </footer>
    </div>
  );
}
