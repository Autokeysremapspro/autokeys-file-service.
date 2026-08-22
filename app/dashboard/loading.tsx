import AppShell from '@/components/AppShell'

function Block({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse motion-reduce:animate-none rounded-2xl border border-white/[.06] bg-white/[.035] ${className}`} />
}

export default function DashboardLoading() {
  return (
    <AppShell>
      <div className="space-y-6" aria-busy="true" aria-label="Cargando Inicio" role="status">
        <span className="sr-only">Cargando Inicio</span>
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-3"><Block className="h-4 w-32" /><Block className="h-9 w-64" /></div>
          <Block className="h-11 w-44" />
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <Block key={index} className="h-24" />)}
        </section>

        <section className="grid gap-5 2xl:grid-cols-[1.5fr_1fr]">
          <Block className="h-64" />
          <Block className="h-64" />
        </section>

        <section className="grid gap-5 2xl:grid-cols-[1.5fr_1fr]">
          <Block className="h-72" />
          <Block className="h-72" />
        </section>
      </div>
    </AppShell>
  )
}
