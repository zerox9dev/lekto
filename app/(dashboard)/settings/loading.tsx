export default function SettingsLoading() {
  return (
    <div className="max-w-2xl">
      <div className="h-7 w-24 bg-gray-100 rounded animate-pulse mb-6" />

      {/* Main card skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4 space-y-5 animate-pulse">
        {/* Section header */}
        <div className="h-3 w-16 bg-gray-100 rounded" />
        <div className="space-y-3">
          <div className="h-3 w-24 bg-gray-100 rounded" />
          <div className="h-9 bg-gray-100 rounded-lg" />
        </div>
        <div className="space-y-3">
          <div className="h-3 w-32 bg-gray-100 rounded" />
          <div className="h-9 bg-gray-100 rounded-lg" />
        </div>
        <div className="h-px bg-gray-100" />
        <div className="h-3 w-20 bg-gray-100 rounded" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-9 bg-gray-100 rounded-lg" />
          <div className="h-9 bg-gray-100 rounded-lg" />
        </div>
      </div>

      {/* Subjects card skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4 animate-pulse">
        <div className="h-3 w-16 bg-gray-100 rounded mb-4" />
        <div className="space-y-2 mb-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg" />
          ))}
        </div>
        <div className="h-9 bg-gray-100 rounded-lg" />
      </div>

      {/* Account card skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-3 w-16 bg-gray-100 rounded mb-4" />
        <div className="h-8 w-32 bg-gray-100 rounded-lg mb-3" />
        <div className="h-px bg-gray-100 my-3" />
        <div className="h-8 w-24 bg-gray-100 rounded-lg" />
      </div>
    </div>
  )
}
