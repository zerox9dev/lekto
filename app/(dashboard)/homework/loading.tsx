import { SkeletonCard } from '@/components/shared/SkeletonCard'

export default function HomeworkLoading() {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="h-7 w-40 bg-gray-100 rounded animate-pulse" />
        <div className="h-8 w-28 bg-gray-100 rounded-lg animate-pulse" />
      </div>
      <div className="h-9 w-80 bg-gray-100 rounded-lg animate-pulse mb-6" />
      <div className="space-y-8">
        {['Активные', 'Сдано'].map((label) => (
          <section key={label}>
            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse mb-3" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} lines={2} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  )
}
