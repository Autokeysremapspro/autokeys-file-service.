import AppShell from '@/components/AppShell'

function Block({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse motion-reduce:animate-none rounded-2xl border border-white/[.06] bg-white/[.035] ${className}`} />
}

export default function DashboardLoading() {
  return (
    <AppShell>
      <div className="space-y-6" aria-busy="true" aria-label="Cargando Mission Control" role="status">
        <span className="sr-only">Cargando Mission Control</span>
        <section className="ak5-card min-h-[300px] rounded-[28px] p-6 sm:p-8 lg:p-10">
          <div className="max-w-2xl space-y-4">
            <Block className="h-7 w-44" />
            <Block className="h-14 w-full max-w-xl" />
            <Block className="h-5 w-full max-w-lg" />
            <div className="flex gap-3 pt-3"><Block className="h-11 w-44" /><Block className="h-11 w-36" /></div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => <Block key={index} className="h-32" />)}
        </section>

        <section className="grid gap-5 2xl:grid-cols-[1.3fr_.85fr_.85fr]">
          <Block className="h-80" />
          <Block className="h-80" />
          <Block className="h-80" />
        </section>
      </div>
    </AppShell>
  )
}
