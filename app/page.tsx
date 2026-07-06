import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  Cloud,
  CreditCard,
  Database,
  Gauge,
  Lock,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Zap,
} from 'lucide-react'

const stats = [
  { label: 'Archivos procesados', value: '+12.800' },
  { label: 'ECUs soportadas', value: '+1.200' },
  { label: 'Tiempo medio', value: '18 min' },
]

const features = [
  { icon: UploadCloud, title: 'Subida rápida', text: 'Envía ORI, selecciona servicios y crea el pedido en segundos.' },
  { icon: Sparkles, title: 'AK Intelligence', text: 'Detección progresiva de ECU, HW, SW y servicios compatibles.' },
  { icon: CreditCard, title: 'Créditos automáticos', text: 'PayPal añade saldo automáticamente sin gestión manual.' },
  { icon: MessageCircle, title: 'Soporte por pedido', text: 'Chat técnico y notificaciones vinculadas a cada trabajo.' },
]

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#030406] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-18rem] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-red-600/20 blur-[140px]" />
        <div className="absolute bottom-[-18rem] right-[-12rem] h-[36rem] w-[36rem] rounded-full bg-blue-600/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:56px_56px] opacity-20" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-red-500/30 bg-red-600/15 shadow-lg shadow-red-950/40">
            <Cloud size={23} className="text-red-400" />
          </div>
          <div>
            <div className="text-xl font-black tracking-tight">AK <span className="text-red-500">CLOUD</span></div>
            <div className="text-[10px] font-black uppercase tracking-[0.28em] text-zinc-500">by Autokeys Lab</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-bold text-zinc-400 md:flex">
          <a href="#features" className="hover:text-white">Plataforma</a>
          <a href="#workflow" className="hover:text-white">Flujo</a>
          <a href="#security" className="hover:text-white">Seguridad</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-black text-zinc-200 hover:bg-white/[0.08]">
            Acceder
          </Link>
          <Link href="/register" className="hidden rounded-2xl bg-red-600 px-4 py-2 text-sm font-black text-white shadow-lg shadow-red-950/40 hover:bg-red-500 sm:inline-flex">
            Crear cuenta
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-10 lg:grid-cols-[1fr_.92fr] lg:px-8 lg:pb-28 lg:pt-16">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-red-300">
            <Zap size={15} /> Professional File Service Platform
          </div>
          <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
            File Service con imagen de <span className="bg-gradient-to-r from-red-500 via-red-300 to-white bg-clip-text text-transparent">software premium.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-400">
            AK Cloud centraliza pedidos, créditos, pagos, soporte, archivos, garaje e inteligencia ECU en una experiencia creada para distribuidores profesionales.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-4 text-sm font-black uppercase tracking-wide text-white shadow-2xl shadow-red-950/50 hover:bg-red-500">
              Solicitar acceso <ArrowRight size={18} className="transition group-hover:translate-x-1" />
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-black uppercase tracking-wide text-white hover:bg-white/[0.08]">
              Entrar al portal
            </Link>
          </div>

          <div className="mt-11 grid max-w-2xl grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">
                <div className="text-2xl font-black">{stat.value}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-wider text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-[2.2rem] bg-gradient-to-br from-red-600/30 via-white/5 to-blue-600/10 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#080b12]/90 p-5 shadow-2xl shadow-black/60 backdrop-blur-2xl">
            <div className="mb-5 flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.035] px-4 py-3">
              <div className="text-sm font-black">Live Workspace</div>
              <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Online
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-dashed border-red-500/35 bg-[radial-gradient(circle_at_center,rgba(220,38,38,.18),rgba(255,255,255,.035))] p-8 text-center">
              <UploadCloud className="mx-auto text-red-300" size={46} />
              <div className="mt-4 text-2xl font-black">Drop your ORI</div>
              <p className="mt-2 text-sm text-zinc-400">Analiza ECU, HW/SW y servicios compatibles.</p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-red-300"><Gauge size={15} /> ECU reconocida</div>
                <div className="text-2xl font-black">Bosch EDC17C64</div>
                <div className="mt-1 text-sm text-zinc-500">Audi A4 · 2.0 TDI · Checksum OK</div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-black text-zinc-300">
                  {['Flex', 'KESS3', 'Autotuner'].map((tool) => <span key={tool} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">{tool}</span>)}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                <div className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Pedido</div>
                <div className="space-y-2 text-sm font-bold text-zinc-300">
                  <div className="flex justify-between"><span>Stage 1</span><span>35 €</span></div>
                  <div className="flex justify-between"><span>DPF OFF</span><span>30 €</span></div>
                  <div className="h-px bg-white/10" />
                  <div className="flex justify-between text-lg font-black text-white"><span>Total</span><span>65 €</span></div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-3">
              {['Stage 1', 'DPF', 'EGR', 'AdBlue'].map((service) => (
                <div key={service} className="rounded-2xl border border-red-500/25 bg-red-500/10 px-3 py-4 text-center text-xs font-black text-white shadow-lg shadow-red-950/20">
                  {service}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <div className="text-sm font-black uppercase tracking-[0.25em] text-red-400">Ecosistema</div>
            <h2 className="mt-3 text-4xl font-black tracking-tight">Más que un portal de archivos.</h2>
          </div>
          <p className="hidden max-w-xl text-zinc-400 md:block">AK Cloud conecta distribuidores, pagos, créditos, soporte, descargas y Autokeys Core en una sola plataforma.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="rounded-[1.7rem] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:border-red-500/35 hover:bg-white/[0.055]">
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-red-600/15 text-red-300"><Icon size={22} /></div>
                <h3 className="text-xl font-black">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-500">{feature.text}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section id="workflow" className="relative z-10 border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[.85fr_1fr] lg:px-8">
          <div>
            <div className="text-sm font-black uppercase tracking-[0.25em] text-red-400">Workflow</div>
            <h2 className="mt-3 text-4xl font-black tracking-tight">De ORI a MOD sin WhatsApp, sin llamadas y sin caos.</h2>
            <p className="mt-5 text-zinc-400">El cliente envía, Autokeys trabaja desde Core y el distribuidor descarga el resultado desde AK Cloud.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {['Subir ORI', 'Detectar ECU', 'Seleccionar servicios', 'Pagar créditos', 'Producción Core', 'Descargar MOD'].map((step, index) => (
              <div key={step} className="rounded-3xl border border-white/10 bg-black/30 p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-sm font-black">{index + 1}</div>
                <div className="font-black">{step}</div>
                <div className="mt-1 text-sm text-zinc-500">Flujo conectado con Autokeys Core.</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,.18),rgba(255,255,255,.035))] p-8 md:p-10">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.25em] text-red-300"><Lock size={16} /> Seguridad profesional</div>
              <h2 className="mt-3 text-3xl font-black">Pagos, créditos y archivos protegidos.</h2>
              <div className="mt-5 grid gap-3 text-sm text-zinc-300 sm:grid-cols-3">
                {['SSL activo', 'PayPal Checkout', 'Storage privado'].map((item) => <div key={item} className="flex items-center gap-2"><CheckCircle2 size={17} className="text-emerald-400" /> {item}</div>)}
              </div>
            </div>
            <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black uppercase tracking-wide text-black hover:bg-zinc-200">
              Empezar ahora <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
