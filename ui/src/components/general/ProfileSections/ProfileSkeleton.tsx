export function ProfileSkeleton() {
  return (
    <div className="mx-auto w-full space-y-6 px-4 py-8">
      <div className="h-44 animate-pulse rounded-2xl bg-gray-200" />
      <div className="grid grid-cols-3 gap-6">
        <div className="h-64 animate-pulse rounded-2xl bg-gray-200" />
        <div className="col-span-2 space-y-4">
          <div className="h-40 animate-pulse rounded-2xl bg-gray-200" />
          <div className="h-40 animate-pulse rounded-2xl bg-gray-200" />
        </div>
      </div>
    </div>
  )
}
