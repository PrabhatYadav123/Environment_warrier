export default function BlogCardSkeleton() {
  return (
    <div className="rounded-md border border-ink/10 bg-white p-5 shadow-soft animate-pulse">
      <div className="h-48 bg-gray-200 rounded-md mb-4" />
      <div className="h-3 bg-gray-200 rounded w-1/4 mb-3" />
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-full mb-1" />
      <div className="h-3 bg-gray-200 rounded w-2/3 mb-4" />
      <div className="h-8 bg-gray-200 rounded-full w-1/3" />
    </div>
  )
}