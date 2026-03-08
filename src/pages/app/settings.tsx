import { useAuth } from "@/lib/auth-context";

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-lg md:text-xl font-bold tracking-tight">Настройки</h1>
        <p className="text-[13px] text-zinc-400 mt-0.5">Управление аккаунтом</p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 md:p-6 max-w-md">
        <div className="space-y-4">
          <div>
            <label className="text-[12px] font-medium text-zinc-400 uppercase tracking-wider">Email</label>
            <p className="text-[14px] text-zinc-900 mt-1 break-all">{user?.email ?? "—"}</p>
          </div>
          <div>
            <label className="text-[12px] font-medium text-zinc-400 uppercase tracking-wider">ID</label>
            <p className="text-[14px] text-zinc-500 mt-1 font-mono text-[12px] break-all">{user?.id ?? "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
