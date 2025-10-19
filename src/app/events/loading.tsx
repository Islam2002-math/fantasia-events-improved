export default function LoadingEvents() {
  return (
    <section className="space-y-6">
      <div className="h-7 w-48 bg-gray-200 animate-pulse rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-3">
            <div className="h-40 w-full bg-gray-200 animate-pulse rounded" />
            <div className="h-4 w-3/5 bg-gray-200 animate-pulse rounded" />
            <div className="h-3 w-2/5 bg-gray-200 animate-pulse rounded" />
          </div>
        ))}
      </div>
    </section>
  )
}