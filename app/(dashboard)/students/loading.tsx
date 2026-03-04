import { SkeletonCard } from '@/components/shared/SkeletonCard'

export default function StudentsLoading() {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="h-7 w-24 bg-gray-100 rounded animate-pulse" />
        <div className="h-8 w-24 bg-gray-100 rounded-lg animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} lines={3} />
        ))}
      </div>
    </>
  )
}
