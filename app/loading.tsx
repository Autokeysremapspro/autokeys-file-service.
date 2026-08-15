export default function Loading() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-[#05060a] px-4 text-white"
      role="status"
      aria-live="polite"
      aria-label="Cargando AK Cloud"
    >
      <section className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/[.035] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="flex items-center gap-4">
          <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-300/[.06]">
            <span className="absolute inset-2 animate-ping rounded-xl border border-cyan-300/25 motion-reduce:animate-none" />
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_24px_rgba(103,232,249,.65)]" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[.22em] text-cyan-300/75">AK Cloud</p>
            <h1 className="mt-1 text-lg font-black tracking-tight sm:text-xl">Preparando tu espacio de trabajo</h1>
            <p className="mt-1 text-xs leading-5 text-white/40">Cargando datos y módulos de forma segura…</p>
          </div>
        </div>

        <div className="mt-7 space-y-3" aria-hidden="true">
          <div className="h-2 w-2/3 animate-pulse rounded-full bg-white/10 motion-reduce:animate-none" />
          <div className="h-2 w-full animate-pulse rounded-full bg-white/[.07] motion-reduce:animate-none" />
          <div className="h-2 w-4/5 animate-pulse rounded-full bg-white/[.07] motion-reduce:animate-none" />
        </div>

        <span className="sr-only">Cargando AK Cloud…</span>
      </section>
    </main>
  )
}
