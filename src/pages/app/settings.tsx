import { useAuth } from "@/lib/auth-context";

export function SettingsPage() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="rounded-xl border p-6 space-y-4 max-w-lg">
        <div>
          <p className="text-sm font-medium">Email</p>
          <p className="text-sm text-[var(--muted-foreground)]">{user?.email}</p>
        </div>
      </div>
    </div>
  );
}
