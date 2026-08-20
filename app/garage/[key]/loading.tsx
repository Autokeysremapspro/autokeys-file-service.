import AppShell from '@/components/AppShell'
import AKCard from '@/components/ak/AKCard'

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-white/[0.06] ${className}`} />
}

export default function GarageVehicleLoading() {
  return (
    <AppShell>
      <section className="flex-1" role="status" aria-live="polite" aria-label="Cargando historial del vehículo">
        <div className="mb-6 flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>

        <header className="mb-7 grid gap-5 xl:grid-cols-[1fr_360px]">
          <AKCard className="p-5 sm:p-7 md:p-8">
            <Skeleton className="h-8 w-40 rounded-full" />
            <Skeleton className="mt-6 h-12 w-4/5 md:h-16 md:w-2/3" />
            <Skeleton className="mt-5 h-4 w-full max-w-2xl" />
            <Skeleton className="mt-3 h-4 w-3/4 max-w-xl" />
            <div className="mt-6 flex flex-wrap gap-2">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>
          </AKCard>

          <AKCard className="p-5 sm:p-6">
            <Skeleton className="h-3 w-20" />
            <div className="mt-5 grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-24" />
              ))}
            </div>
          </AKCard>
        </header>

        <AKCard className="mb-6 p-5 sm:p-6 md:p-7">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0 flex-1">
              <Skeleton className="h-3 w-36" />
              <Skeleton className="mt-3 h-8 w-full max-w-xs" />
              <Skeleton className="mt-3 h-4 w-full max-w-2xl" />
            </div>
            <Skeleton className="h-3 w-48" />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28" />
            ))}
          </div>

          <Skeleton className="mt-4 h-36 w-full" />

          <div className="mt-4 grid gap-3 lg:grid-cols-[180px_180px_1fr]">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </AKCard>

        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <AKCard className="p-5 sm:p-6">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-8 w-56 max-w-full" />
            <div className="mt-6 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-32" />
              ))}
            </div>
          </AKCard>

          <aside className="space-y-6">
            <AKCard className="p-5 sm:p-6">
              <Skeleton className="h-3 w-28" />
              <div className="mt-4 flex flex-wrap gap-2">
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-7 w-16 rounded-full" />
              </div>
            </AKCard>
            <AKCard className="p-5 sm:p-6">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-4 h-20" />
              <Skeleton className="mt-3 h-20" />
            </AKCard>
          </aside>
        </div>
      </section>
    </AppShell>
  )
}
