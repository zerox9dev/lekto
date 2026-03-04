import { SkeletonRow } from '@/components/shared/SkeletonCard'

export default function LessonsLoading() {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="h-7 w-16 bg-gray-100 rounded animate-pulse" />
        <div className="h-8 w-24 bg-gray-100 rounded-lg animate-pulse" />
      </div>
      <div className="h-9 w-80 bg-gray-100 rounded-lg animate-pulse mb-5" />
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    </>
  )
}
