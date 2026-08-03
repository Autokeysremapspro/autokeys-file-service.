import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  Clock3,
  CloudUpload,
  CreditCard,
  FileCheck2,
  Gauge,
  KeyRound,
  LockKeyhole,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Wrench,
  Zap,
} from 'lucide-react'

const services = [
  { icon: Gauge, name: 'Stage 1', detail: 'Respuesta, par y rendimiento' },
  { icon: Zap, name: 'Stage 2', detail: 'Configuraciones avanzadas' },
  { icon: ShieldCheck, name: 'DPF / EGR', detail: 'Soluciones técnicas profesionales' },
  { icon: Wrench, name: 'AdBlue', detail: 'Diagnóstico y solución especializada' },
  { icon: KeyRound, name: 'IMMO', detail: 'Servicios de inmovilizador' },
  { icon: FileCheck2, name: 'ORI / MOD', detail: 'Historial y archivos centralizados' },
]

const steps = [
  ['Solicita acceso', 'Completa el alta profesional de distribuidor.'],
  ['Cuenta aprobada', 'Autokeys valida tu perfil y activa el workspace.'],
  ['Envía el trabajo', 'Sube el ORI y añade manualmente los datos del vehículo.'],
  ['Recibe la solución', 'Sigue el estado y descarga el archivo terminado.'],
]

const highlights = [
  { icon: ShieldCheck, title: 'Seguridad total', text: 'Archivos y datos protegidos' },
  { icon: Zap, title: 'Entrega rápida', text: 'Flujo directo con Autokeys' },
  { icon: BadgeCheck, title: 'Experiencia real', text: 'Especialistas en electrónica' },
]

const benefits = [
  { icon: Clock3, title: 'Entrega ágil', text: 'Flujo directo con el laboratorio, sin conversaciones dispersas.' },
  { icon: LockKeyhole, title: 'Entorno seguro', text: 'Pagos, pedidos y archivos centralizados.' },
  { icon: MessageSquareText, title: 'Soporte por pedido', text: 'Toda la conversación técnica queda vinculada al trabajo.' },
  { icon: CreditCard, title: 'Pago por archivo', text: 'Pagas solo lo que pides, integrado con PayPal Checkout.' },
]

function PinRow({ pos = '42%' }: { pos?: string }) {
  return <div className="ak-pinrow mx-auto max-w-[1180px]" style={{ ['--ak-pin-pos' as any]: pos }} />
}

export default function HomePage() {
  return (
    <main className="ak-signature-landing min-h-screen overflow-hidden bg-[#05060a] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AutoRepair',
            name: 'Autokeys Remaps Pro — AK Cloud',
            url: 'https://akcloud.es',
            logo: 'https://akcloud.es/images/brand/autokeys-logo-wide-transparent.webp',
            image: 'https://akcloud.es/og-image.png',
            description:
              'Portal profesional de reprogramación y electrónica ECU para talleres y distribuidores: Stage 1, Stage 2, EGR/DPF/AdBlue OFF y más.',
            areaServed: 'ES',
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'ES',
            },
          }),
        }}
      />
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_4%,rgba(226,149,77,.16),transparent_27%),radial-gradient(circle_at_88%_12%,rgba(94,234,212,.09),transparent_23%),linear-gradient(180deg,#05060a,#070a10_55%,#05060a)]" />
        <div className="absolute inset-0 opacity-[.10] [background-image:linear-gradient(rgba(255,255,255,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.045)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(circle_at_50%_20%,black,transparent_75%)]" />
        <div className="absolute left-[-18rem] top-[20rem] h-[34rem] w-[34rem] rounded-full bg-[#8a4a1f]/20 blur-[150px]" />
      </div>

      <header className="ak-signature-landing-header sticky top-0 z-50 border-b border-white/[0.065] bg-[#05060a]/78 shadow-[0_12px_45px_rgba(0,0,0,.24)] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1540px] items-center justify-between px-5 py-3.5 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <img src="/images/brand/autokeys-logo-small-transparent.webp" alt="Autokeys" className="h-10 w-auto object-contain transition duration-300 group-hover:scale-[1.035]" />
            <div className="hidden border-l border-white/10 pl-3 sm:block">
              <div className="font-display text-sm font-bold tracking-[.14em]">AK <span className="text-[#ffb870]">CLOUD</span></div>
              <div className="ak-mono mt-0.5 text-[9px] font-medium uppercase tracking-[.24em] text-zinc-600">Professional workspace</div>
            </div>
          </Link>

          <nav className="ak-mono hidden items-center gap-1 rounded-full border border-white/[.055] bg-white/[.018] p-1 text-[10px] font-bold uppercase tracking-[.1em] text-zinc-500 lg:flex">
            <a href="#plataforma" className="rounded-full px-4 py-2.5 transition hover:bg-white/[.045] hover:text-white">Plataforma</a>
            <a href="#deteccion" className="rounded-full px-4 py-2.5 transition hover:bg-white/[.045] hover:text-white">Detección ECU</a>
            <a href="#servicios" className="rounded-full px-4 py-2.5 transition hover:bg-white/[.045] hover:text-white">Servicios</a>
            <a href="#flujo" className="rounded-full px-4 py-2.5 transition hover:bg-white/[.045] hover:text-white">Cómo funciona</a>
            <a href="#ventajas" className="rounded-full px-4 py-2.5 transition hover:bg-white/[.045] hover:text-white">Ventajas</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-[13px] border border-white/[.08] bg-white/[.025] px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-zinc-200 shadow-[inset_0_1px_0_rgba(255,255,255,.035)] transition hover:-translate-y-0.5 hover:border-white/[.16] hover:bg-white/[.06]">
              Acceder
            </Link>
            <Link href="/register" className="group relative hidden items-center gap-2 overflow-hidden rounded-[13px] border border-[#ffb870]/30 bg-gradient-to-r from-[#8a4a1f] to-[#e2954d] px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-[#0a0d12] shadow-[0_14px_40px_rgba(226,149,77,.24),inset_0_1px_0_rgba(255,255,255,.24)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_52px_rgba(226,149,77,.32)] sm:inline-flex">
              Solicitar acceso <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      <section id="plataforma" className="relative z-10 min-h-[calc(100vh-70px)] overflow-hidden border-b border-white/[0.065]">
        <div className="absolute inset-0 scale-[1.025] bg-[url('/images/ak-login-racing.png')] bg-cover bg-center opacity-90 lg:bg-[center_top]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,6,10,.985)_0%,rgba(5,6,10,.92)_36%,rgba(5,6,10,.48)_66%,rgba(5,6,10,.86)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#05060a] to-transparent" />

        <div className="relative mx-auto grid min-h-[calc(100vh-78px)] max-w-[1500px] items-center gap-10 px-5 py-16 lg:grid-cols-[.9fr_1.1fr] lg:px-8">
          <div className="max-w-3xl">
            <div className="ak-mono mb-6 inline-flex items-center gap-2 rounded-full border border-[#e2954d]/30 bg-[#3a2412]/55 px-4 py-2 text-[11px] font-bold uppercase tracking-[.18em] text-[#ffb870] shadow-[0_0_35px_rgba(226,149,77,.14)] backdrop-blur-xl">
              <Sparkles size={15} /> Ecosistema profesional para distribuidores
            </div>

            <h1 className="ak-premium-heading text-5xl font-bold leading-[.96] tracking-[-.035em] sm:text-6xl lg:text-[5.25rem]">
              No vendemos archivos.
              <span className="mt-2 block bg-gradient-to-r from-[#ffb870] via-[#f2d4a6] to-white bg-clip-text text-transparent drop-shadow-[0_0_36px_rgba(226,149,77,.18)]">Entregamos soluciones.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
              Pedidos, soporte, descargas y comunicación directa con el laboratorio en una plataforma creada por profesionales de la electrónica de vehículos.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#8a4a1f] via-[#c17a3b] to-[#e2954d] px-6 py-4 text-sm font-bold uppercase tracking-wide text-[#0a0d12] shadow-[0_18px_55px_rgba(226,149,77,.32)] transition hover:-translate-y-0.5 hover:brightness-105">
                Solicitar acceso profesional <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </Link>
              <Link href="/login" className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/12 bg-black/45 px-6 py-4 text-sm font-bold uppercase tracking-wide backdrop-blur-xl transition hover:border-[#e2954d]/40 hover:bg-white/[0.06]">
                Entrar al portal <ChevronRight size={18} />
              </Link>
            </div>

            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
              {highlights.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="ak-card-hover rounded-[18px] border border-white/[.075] bg-black/40 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.035)] backdrop-blur-xl">
                    <Icon size={20} className="mb-3 text-[#5eead4]" />
                    <div className="text-xs font-bold uppercase tracking-wide">{item.title}</div>
                    <div className="mt-1 text-xs leading-5 text-zinc-600">{item.text}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="hidden justify-end lg:flex">
            <div className="relative w-full max-w-[610px]">
              <div className="absolute -inset-10 rounded-full bg-[#8a4a1f]/15 blur-[90px]" />
              <div className="ak-float relative overflow-hidden rounded-[28px] border border-white/[.1] bg-[#0a0d12]/88 p-4 shadow-[0_55px_150px_rgba(0,0,0,.72),0_0_0_1px_rgba(255,255,255,.025)] backdrop-blur-2xl">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#e2954d]/15 text-[#ffb870]"><CloudUpload size={19} /></div>
                    <div>
                      <div className="text-sm font-bold">AK Cloud Workspace</div>
                      <div className="ak-mono text-[10px] uppercase tracking-[.16em] text-zinc-600">Distribuidor Professional</div>
                    </div>
                  </div>
                  <div className="ak-mono flex items-center gap-2 rounded-full bg-[#5eead4]/10 px-3 py-1 text-[10px] font-bold uppercase text-[#5eead4]">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#5eead4]" /> Online
                  </div>
                </div>

                <div className="mt-4 rounded-[1.6rem] border border-dashed border-[#e2954d]/35 bg-[radial-gradient(circle_at_center,rgba(226,149,77,.16),rgba(255,255,255,.025))] p-8 text-center">
                  <UploadCloud className="mx-auto text-[#ffb870]" size={45} />
                  <div className="mt-4 text-xl font-bold uppercase">Nuevo trabajo</div>
                  <div className="mt-2 text-sm text-zinc-500">Sube el ORI y completa los datos manualmente.</div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    ['En proceso', '3'],
                    ['Listos', '2'],
                    ['Total mes', '14'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-black/35 p-4">
                      <div className="ak-mono text-2xl font-bold">{value}</div>
                      <div className="mt-1 text-[10px] font-bold uppercase tracking-[.12em] text-zinc-600">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/35">
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                    <div className="text-xs font-bold uppercase tracking-[.15em]">Últimos pedidos</div>
                    <div className="ak-mono text-[10px] font-bold text-[#ffb870]">Ver todos</div>
                  </div>
                  {[
                    ['BMW 320d', 'Stage 1', 'En proceso', 'text-amber-400'],
                    ['Audi A4', 'DPF + EGR', 'Completado', 'text-[#5eead4]'],
                    ['Golf GTI', 'Stage 2', 'Pendiente', 'text-sky-400'],
                  ].map(([vehicle, service, status, color]) => (
                    <div key={vehicle} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-white/[0.06] px-4 py-3 last:border-0">
                      <div>
                        <div className="text-sm font-bold">{vehicle}</div>
                        <div className="mt-0.5 text-xs text-zinc-600">{service}</div>
                      </div>
                      <div className={`ak-mono text-[10px] font-bold uppercase ${color}`}>{status}</div>
                      <ChevronRight size={15} className="text-zinc-700" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 py-10"><PinRow pos="30%" /></div>

      <section id="deteccion" className="ak-landing-section relative z-10 mx-auto max-w-[1500px] px-5 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_.85fr] lg:items-center">
          <div>
            <div className="ak-mono text-xs font-bold uppercase tracking-[.24em] text-[#5eead4]">AK Detection Engine</div>
            <h2 className="mt-4 text-4xl font-bold uppercase leading-[.98] tracking-[-.03em] sm:text-5xl">
              La ECU se identifica sola. <span className="text-[#ffb870]">De verdad.</span>
            </h2>
            <p className="mt-5 max-w-xl text-zinc-500">
              Subes el archivo original y el motor de detección busca primero una huella exacta contra
              archivos ya procesados; si no la encuentra, analiza patrones técnicos reales. Nunca inventa
              una marca — si no hay certeza suficiente, te lo dice y pasa a revisión manual.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="ak-mono text-2xl font-bold text-[#5eead4]">99%</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-wide text-zinc-600">Huella exacta</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="ak-mono text-2xl font-bold text-[#ffb870]">0</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-wide text-zinc-600">Marcas inventadas</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 rounded-full bg-[#5eead4]/[.06] blur-[80px]" />
            <div className="ak-scan-card relative overflow-hidden rounded-[1.8rem] border border-white/12 bg-[#0a0d12]/90 p-5 shadow-[0_40px_110px_rgba(0,0,0,.6)] backdrop-blur-2xl">
              <div className="ak-mono mb-4 flex items-center justify-between text-[11px] uppercase tracking-widest text-zinc-600">
                <span>ak_ecu_scan.log</span>
                <span className="flex gap-1.5"><i className="h-2 w-2 rounded-full bg-white/15" /><i className="h-2 w-2 rounded-full bg-white/15" /><i className="h-2 w-2 rounded-full bg-white/15" /></span>
              </div>
              <div className="ak-scan-screen relative rounded-xl border border-white/10 bg-black p-5 font-mono text-[13px]">
                <div className="ak-scan-line flex justify-between border-b border-dashed border-white/[0.06] py-1.5"><span className="text-zinc-600">Archivo recibido</span><span className="text-[#5eead4]">ORI_0421.bin</span></div>
                <div className="ak-scan-line flex justify-between border-b border-dashed border-white/[0.06] py-1.5"><span className="text-zinc-600">Huella SHA-256</span><span className="text-sky-400">coincidencia exacta</span></div>
                <div className="ak-scan-line flex justify-between border-b border-dashed border-white/[0.06] py-1.5"><span className="text-zinc-600">Marca / Modelo</span><span className="text-[#5eead4]">Volkswagen Golf 8</span></div>
                <div className="ak-scan-line flex justify-between border-b border-dashed border-white/[0.06] py-1.5"><span className="text-zinc-600">ECU</span><span className="text-sky-400">Bosch MG1CS181</span></div>
                <div className="ak-scan-line flex justify-between border-b border-dashed border-white/[0.06] py-1.5"><span className="text-zinc-600">Sugerido</span><span className="text-[#ffb870]">Stage 1 · EGR OFF</span></div>
                <div className="ak-scan-line flex justify-between py-1.5"><span className="text-zinc-600">Precio</span><span className="text-white">65 €</span></div>
                <div className="ak-scan-status mt-3 flex items-center gap-2 border-t border-white/10 pt-3 text-[12px] text-[#5eead4]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#5eead4] shadow-[0_0_8px_rgba(94,234,212,.9)]" /> Detección completada — listo para enviar
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .ak-scan-screen::after {
          content: ''; position: absolute; left: 0; right: 0; height: 40%;
          background: linear-gradient(180deg, rgba(94,234,212,0) 0%, rgba(94,234,212,.09) 50%, rgba(94,234,212,0) 100%);
          animation: akScanSweep 3.2s linear infinite;
        }
        @keyframes akScanSweep { 0% { top: -40%; } 100% { top: 100%; } }
        .ak-scan-line { opacity: 0; animation: akScanReveal .4s ease forwards; }
        .ak-scan-line:nth-child(1) { animation-delay: .3s; }
        .ak-scan-line:nth-child(2) { animation-delay: .7s; }
        .ak-scan-line:nth-child(3) { animation-delay: 1.1s; }
        .ak-scan-line:nth-child(4) { animation-delay: 1.5s; }
        .ak-scan-line:nth-child(5) { animation-delay: 1.9s; }
        .ak-scan-line:nth-child(6) { animation-delay: 2.3s; }
        .ak-scan-status { opacity: 0; animation: akScanReveal .4s ease forwards; animation-delay: 2.7s; }
        @keyframes akScanReveal { to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .ak-scan-screen::after, .ak-scan-line, .ak-scan-status { animation: none; opacity: 1; } }
      `}</style>

      <div className="relative z-10 py-10"><PinRow pos="66%" /></div>

      <section id="servicios" className="ak-landing-section relative z-10 mx-auto max-w-[1500px] px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="ak-mono text-xs font-bold uppercase tracking-[.24em] text-[#ffb870]">Servicios técnicos</div>
          <h2 className="mt-4 text-4xl font-bold uppercase tracking-[-.03em] sm:text-5xl">Todo tu trabajo, dentro de un único ecosistema.</h2>
          <p className="mt-5 text-zinc-500">Selecciona los servicios disponibles en el portal, sigue el proceso y recibe los resultados sin perder trazabilidad.</p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon
            return (
              <div key={service.name} className="group relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-gradient-to-b from-white/[0.055] to-white/[0.018] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#e2954d]/40 hover:shadow-[0_28px_70px_rgba(226,149,77,.12)]">
                <div className="absolute right-[-2rem] top-[-2rem] h-28 w-28 rounded-full bg-[#e2954d]/10 blur-3xl transition group-hover:bg-[#e2954d]/20" />
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#e2954d]/25 bg-[#e2954d]/10 text-[#ffb870]"><Icon size={23} /></div>
                <div className="mt-5 text-xl font-bold uppercase">{service.name}</div>
                <div className="mt-2 text-sm leading-6 text-zinc-600">{service.detail}</div>
                <div className="ak-mono mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#5eead4]">Disponible en AK Cloud <ChevronRight size={15} /></div>
              </div>
            )
          })}
        </div>
      </section>

      <section id="flujo" className="relative z-10 border-y border-white/[0.07] bg-white/[0.018]">
        <div className="mx-auto max-w-[1500px] px-5 py-20 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[.72fr_1.28fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <div className="ak-mono text-xs font-bold uppercase tracking-[.24em] text-[#ffb870]">Flujo profesional</div>
              <h2 className="mt-4 text-4xl font-bold uppercase leading-[.98] tracking-[-.03em] sm:text-5xl">Del ORI a la solución, sin caos.</h2>
              <p className="mt-5 max-w-xl text-zinc-500">AK Cloud conecta al distribuidor directamente con Autokeys Core para que cada pedido tenga estado, historial, archivos y soporte.</p>
              <Link href="/register" className="mt-8 inline-flex items-center gap-2 rounded-xl border border-[#e2954d]/30 bg-[#e2954d]/10 px-5 py-3 text-xs font-bold uppercase tracking-wide text-[#ffb870] transition hover:bg-[#e2954d] hover:text-[#0a0d12]">
                Empezar ahora <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {steps.map(([title, text], index) => (
                <div key={title} className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/35 p-6">
                  <div className="ak-mono absolute right-4 top-2 text-7xl font-bold text-white/[0.025]">0{index + 1}</div>
                  <div className="ak-mono grid h-10 w-10 place-items-center rounded-full bg-[#e2954d] text-sm font-bold text-[#0a0d12] shadow-[0_0_32px_rgba(226,149,77,.32)]">{index + 1}</div>
                  <div className="mt-5 text-xl font-bold uppercase">{title}</div>
                  <div className="mt-2 text-sm leading-6 text-zinc-600">{text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="ventajas" className="ak-landing-section relative z-10 mx-auto max-w-[1500px] px-5 py-20 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon
            return (
              <div key={benefit.title} className="rounded-[1.6rem] border border-white/10 bg-white/[0.025] p-6">
                <Icon size={23} className="text-[#ffb870]" />
                <div className="mt-5 text-lg font-bold uppercase">{benefit.title}</div>
                <div className="mt-2 text-sm leading-6 text-zinc-600">{benefit.text}</div>
              </div>
            )
          })}
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['+12.800', 'Archivos procesados'],
            ['+1.200', 'Referencias trabajadas'],
            ['18 min', 'Tiempo medio'],
            ['100%', 'Trazabilidad del pedido'],
          ].map(([value, label]) => (
            <div key={label} className="rounded-[1.5rem] border border-white/10 bg-gradient-to-b from-[#8a4a1f]/20 to-black/30 p-6 text-center">
              <div className="ak-mono text-4xl font-bold text-white">{value}</div>
              <div className="mt-2 text-[11px] font-bold uppercase tracking-[.16em] text-zinc-600">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 px-5 pb-24 lg:px-8">
        <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[2rem] border border-[#e2954d]/20 shadow-[0_35px_100px_rgba(0,0,0,.55)]">
          <div className="relative p-8 sm:p-12">
            <div className="absolute inset-0 bg-[url('/akcloud/login-racing-reference.png')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(5,6,10,.95)_0%,rgba(5,6,10,.85)_45%,rgba(138,74,31,.32)_100%)]" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="ak-mono text-xs font-bold uppercase tracking-[.24em] text-[#ffb870]">Acceso profesional</div>
                <h2 className="mt-4 max-w-4xl text-4xl font-bold uppercase leading-[.98] tracking-[-.03em] sm:text-5xl">Tu próximo trabajo empieza dentro de AK Cloud.</h2>
                <p className="mt-4 max-w-2xl text-zinc-300">Solicita tu cuenta de distribuidor y trabaja conectado directamente con Autokeys Lab.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link href="/register" className="inline-flex min-w-56 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#8a4a1f] to-[#e2954d] px-6 py-4 text-sm font-bold uppercase text-[#0a0d12] shadow-[0_20px_55px_rgba(226,149,77,.3)] transition hover:brightness-105">
                  Crear cuenta <ArrowRight size={18} />
                </Link>
                <Link href="/login" className="inline-flex min-w-56 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-black/40 px-6 py-4 text-sm font-bold uppercase backdrop-blur-xl transition hover:bg-white/[0.1]">
                  Ya tengo acceso
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="ak-landing-section relative z-10 border-t border-white/[0.07] bg-black/45">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-6 px-5 py-8 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <img src="/images/brand/autokeys-logo-small-transparent.webp" alt="Autokeys" className="h-8 w-auto object-contain opacity-80" />
            <span>AK Cloud · Autokeys Remaps Pro</span>
          </div>
          <div className="ak-mono flex flex-wrap gap-5 text-xs font-bold uppercase tracking-wide">
            <Link href="/login" className="hover:text-white">Acceder</Link>
            <Link href="/register" className="hover:text-white">Solicitar cuenta</Link>
            <Link href="/legal/terminos" className="hover:text-white">Términos</Link>
            <Link href="/legal/privacidad" className="hover:text-white">Privacidad</Link>
            <Link href="/legal/aviso-legal" className="hover:text-white">Aviso legal</Link>
            <Link href="/legal/cookies" className="hover:text-white">Cookies</Link>
            <span>© 2026 Autokeys Lab</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
