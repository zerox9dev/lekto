import { SkeletonCard } from '@/components/shared/SkeletonCard'

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="space-y-1.5">
        <div className="h-7 w-48 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 px-5 py-4 animate-pulse">
            <div className="h-3 w-20 bg-gray-100 rounded mb-2" />
            <div className="h-8 w-12 bg-gray-100 rounded mb-1" />
            <div className="h-3 w-16 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* Today */}
      <SkeletonCard lines={3} />

      {/* Bottom 2-col */}
      <div className="grid grid-cols-2 gap-4">
        <SkeletonCard lines={3} />
        <SkeletonCard lines={3} />
      </div>
    </div>
  )
}
