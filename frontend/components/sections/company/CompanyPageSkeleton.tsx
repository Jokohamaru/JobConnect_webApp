export function CompanyBannerSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      {/* Cover */}
      <div className="h-32 w-full bg-gray-200" />
      <div className="px-6 pb-6">
        {/* Logo */}
        <div className="-mt-12 mb-4 size-24 rounded-2xl bg-gray-200 border-4 border-white" />
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="h-7 w-52 rounded-lg bg-gray-200" />
            <div className="h-4 w-72 rounded bg-gray-100" />
            <div className="h-4 w-32 rounded bg-gray-100" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-24 rounded-lg bg-gray-200" />
            <div className="h-8 w-32 rounded-lg bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CompanyInfoSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
      <div className="h-5 w-44 rounded bg-gray-200 mb-5" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="size-8 rounded-lg bg-gray-200" />
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="h-3 w-20 rounded bg-gray-100" />
              <div className="h-4 w-32 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CompanyOverviewSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
      <div className="h-5 w-44 rounded bg-gray-200 mb-5" />
      <div className="flex flex-col gap-2">
        {[80, 100, 90, 70].map((w, i) => (
          <div key={i} className={`h-3 rounded bg-gray-100`} style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

export function JobListSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
      <div className="h-5 w-40 rounded bg-gray-200 mb-4" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 p-4">
            <div className="h-4 w-3/4 rounded bg-gray-200 mb-2" />
            <div className="h-3 w-1/2 rounded bg-gray-100 mb-1" />
            <div className="h-3 w-1/3 rounded bg-gray-100 mb-3" />
            <div className="flex gap-2 mb-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-5 w-16 rounded-md bg-gray-100" />
              ))}
            </div>
            <div className="h-7 w-full rounded-lg bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CompanyPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Left */}
        <div className="flex flex-1 flex-col gap-6">
          <CompanyBannerSkeleton />
          <CompanyInfoSkeleton />
          <CompanyOverviewSkeleton />
          <CompanyOverviewSkeleton />
        </div>
        {/* Right */}
        <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0">
          <JobListSkeleton />
        </div>
      </div>
    </div>
  );
}
