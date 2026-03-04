interface SkeletonCardProps {
  lines?: number
  className?: string
}

export function SkeletonCard({ lines = 3, className = '' }: SkeletonCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 animate-pulse ${className}`}>
      <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-gray-100 rounded mb-2.5"
          style={{ width: `${85 - i * 10}%` }}
        />
      ))}
    </div>
  )
}

export function SkeletonRow({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 py-3 animate-pulse ${className}`}>
      <div className="h-8 w-8 rounded-full bg-gray-100 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
      <div className="h-5 bg-gray-100 rounded-full w-16" />
    </div>
  )
}
