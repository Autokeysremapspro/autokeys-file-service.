import Link from 'next/link'
import {
  ArrowRight, Bell, CheckCircle2, Cpu, Download, Eye,
  Facebook, Filter, Gauge, Headphones, Instagram, LayoutGrid, PlayCircle,
  Settings, ShieldCheck, UploadCloud, UserPlus, UserRound, Users, Youtube, Zap,
} from 'lucide-react'

const nav = [
  { label: 'Inicio', href: '#', active: true },
  { label: 'Servicios', href: '#servicios' },
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Precios', href: '#precios' },
  { label: 'Contacto', href: '#contacto' },
]

const highlights = [
  { icon: Zap, title: 'Respuesta rápida', text: 'Tiempos de entrega optimizados para que no pierdas tiempo.' },
  { icon: Headphones, title: 'Soporte profesional', text: 'Atención técnica especializada cuando la necesites.' },
  { icon: ShieldCheck, title: 'Archivos seguros', text: 'Tus archivos protegidos con máxima seguridad y privacidad.' },
  { icon: Users, title: 'Usuarios aprobados', text: 'Solo profesionales verificados por Autokeys Remaps Pro.' },
]

const services = [
  { icon: Gauge, title: 'Stage 1 / Stage 2 / Stage 3', text: 'Potencia, par y eficiencia adaptados a cada motor.', image: '/images/marketing/service-stage.webp' },
  { icon: Filter, title: 'DPF / EGR / AdBlue / Lambda', text: 'Soluciones profesionales para sistemas de emisiones.', image: '/images/marketing/service-dpf.webp' },
  { icon: Cpu, title: 'Immo Off y soluciones ECU', text: 'Eliminación de inmovilizador y soluciones electrónicas avanzadas.', image: '/images/marketing/service-ecu.webp' },
  { icon: Download, title: 'Archivos listos para descargar', text: 'Archivos verificados y listos para instalar en tu cliente.', image: '/images/marketing/service-download.webp' },
]

const steps = [
  { n: 1, icon: UserRound, title: 'Solicita acceso', text: 'Completa el formulario y espera la aprobación de Autokeys Remaps Pro.' },
  { n: 2, icon: UploadCloud, title: 'Sube tu ORI', text: 'Sube tu archivo original desde la plataforma de forma segura.' },
  { n: 3, icon: Settings, title: 'Recibe el archivo procesado', text: 'Nuestro equipo procesa tu archivo con la mejor calidad y pruebas profesionales.' },
  { n: 4, icon: Download, title: 'Descarga y trabaja', text: 'Descarga el archivo listo y aplícalo en el vehículo de tu cliente.' },
]

const orders = [
  { vehicle: 'BMW 320d F30', service: 'Stage 1', status: 'Completado', tone: 'green', progress: 100, updated: '10/05/2024 11:32' },
  { vehicle: 'VW Golf 2.0 TDI', service: 'DPF Off + EGR Off', status: 'En proceso', tone: 'amber', progress: 66, updated: '09/05/2024 16:45' },
  { vehicle: 'Audi A4 2.0 TDI', service: 'Stage 2', status: 'En cola', tone: 'slate', progress: 20, updated: '09/05/2024 09:21' },
]

const statusStyles: Record<string, string> = {
  green: 'border-green-400/25 bg-green-400/10 text-green-400',
  amber: 'border-amber-400/25 bg-amber-400/10 text-amber-300',
  slate: 'border-sky-400/25 bg-sky-400/10 text-sky-300',
}

const progressStyles: Record<string, string> = {
  green: 'bg-green-400',
  amber: 'bg-amber-400',
  slate: 'bg-sky-400',
}

const checklist = [
  'Gestión clara de pedidos y proyectos',
  'Seguimiento del estado en tiempo real',
  'Entrega rápida y archivos verificados',
  'Diseñado para profesionales del sector',
]

const footerColumns = [
  { title: 'Plataforma', links: [['Inicio', '/'], ['Servicios', '#servicios'], ['Cómo funciona', '#como-funciona'], ['Precios', '#precios']] },
  { title: 'Cuenta', links: [['Acceder', '/login'], ['Solicitar cuenta', '/register'], ['Mi cuenta', '/perfil']] },
  { title: 'Soporte', links: [['Contacto', '#contacto'], ['Soporte técnico', '/soporte'], ['Preguntas frecuentes', '#faq']] },
]

export default function HomePage() {
  return (
    <main className="akhome ak-v5-bg min-h-screen overflow-hidden text-white">
      <header className="ak-v5-topbar sticky top-0 z-50">
        <div className="mx-auto flex max-w-[1480px] items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="flex items-center">
            <img src="/images/brand/ak-cloud-logo.webp" alt="AK Cloud by Autokeys Remaps Pro" className="h-12 w-auto sm:h-14" />
          </Link>
          <nav className="hidden items-center gap-7 text-xs font-bold lg:flex">
            {nav.map(item => (
              <a
                key={item.label}
                href={item.href}
                className={
                  item.active
                    ? 'relative text-[#ff2b2b] after:absolute after:-bottom-3 after:left-0 after:right-0 after:h-[2px] after:rounded-full after:bg-[#ff2b2b]'
                    : 'text-white/45 transition hover:text-white'
                }
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex gap-2">
            <Link href="/login" className="ak-v5-button-secondary !px-4 !py-2.5 text-xs"><UserRound size={15} /> Acceder</Link>
            <Link href="/register" className="ak-v5-button hidden !px-4 !py-2.5 text-xs sm:inline-flex !bg-gradient-to-b !from-[#ff2b2b] !to-[#b30012] !shadow-[0_16px_42px_rgba(230,10,20,.35),inset_0_1px_0_rgba(255,255,255,.25)] hover:!shadow-[0_22px_56px_rgba(230,10,20,.48)]"><UserPlus size={15} /> Solicitar cuenta</Link>
          </div>
        </div>
      </header>

      <section className="relative z-10 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src="/images/marketing/hero-car.webp" alt="" className="h-full w-full object-cover object-[65%_45%] opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#05070b]/85 via-[#05070b]/35 to-[#05070b]/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070b] via-transparent to-[#05070b]/45" />
        </div>
        <div className="relative mx-auto grid min-h-[780px] max-w-[1480px] items-center gap-12 px-5 py-20 lg:grid-cols-[.92fr_1.08fr] lg:px-8">
        <div className="ak-v5-reveal">
          <div className="ak-v5-kicker !text-[#ff2b2b]">Plataforma profesional</div>
          <h1 className="ak-v5-title mt-6 text-5xl sm:text-6xl xl:text-[4.4rem]">El portal profesional<br />de <span className="text-[#ff2b2b]">File Service</span></h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-white/48">Sube tus archivos originales (ORI), solicita el servicio que necesitas y recibe tus archivos procesados de forma rápida, segura y centralizada.</p>
          <p className="mt-4 max-w-xl leading-7 text-white/40">Los nuevos usuarios requieren aprobación por <span className="text-[#ff2b2b] font-semibold">Autokeys Remaps Pro</span> para garantizar un servicio profesional y de calidad.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="ak-v5-button !bg-gradient-to-b !from-[#ff2b2b] !to-[#b30012] !shadow-[0_16px_42px_rgba(230,10,20,.35),inset_0_1px_0_rgba(255,255,255,.25)] hover:!shadow-[0_22px_56px_rgba(230,10,20,.48)]"><UploadCloud size={18} /> Subir archivo</Link>
            <a href="#como-funciona" className="ak-v5-button-secondary"><PlayCircle size={18} /> Ver funcionamiento</a>
          </div>
        </div>

        <div className="relative ak-v5-float">
          <div className="absolute -inset-20 rounded-full bg-[#ff2b2b]/10 blur-[110px]" />
          <div className="ak-v5-glass relative overflow-hidden rounded-[34px] p-3">
            <div className="flex items-center justify-between border-b border-white/[.07] px-4 py-3">
              <img src="/images/brand/ak-cloud-logo.webp" alt="AK Cloud" className="h-6 w-auto" />
              <div className="flex items-center gap-4">
                <Bell size={16} className="text-white/35" />
                <div className="flex items-center gap-2">
                  <div className="text-right leading-tight">
                    <div className="text-[11px] font-bold text-white/80">Taller Pro</div>
                    <div className="text-[9px] text-white/30">Usuario aprobado</div>
                  </div>
                  <div className="grid h-8 w-8 place-items-center rounded-full border border-[#ff2b2b]/30 bg-[#ff2b2b]/10 text-[10px] font-black text-[#ff2b2b]">TP</div>
                </div>
              </div>
            </div>
            <div className="grid gap-3 p-3 sm:grid-cols-[170px_1fr]">
              <aside className="hidden rounded-2xl border border-white/[.07] bg-black/25 p-3 sm:block">
                {['Dashboard', 'Subir archivo', 'Mis pedidos', 'Historial', 'Servicios', 'Mensajes', 'Mi cuenta', 'Soporte'].map((x, i) => (
                  <div key={x} className={`mb-1.5 rounded-xl px-3 py-2.5 text-xs ${i === 0 ? 'bg-[#ff2b2b]/[.12] text-[#ff2b2b] font-bold' : 'text-white/35'}`}>{x}</div>
                ))}
                <div className="mt-4 border-t border-white/[.07] pt-3 text-xs font-bold text-[#ff2b2b]">Cerrar sesión</div>
              </aside>
              <div className="space-y-3">
                <div className="text-sm font-bold text-white/85">Bienvenido de nuevo</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="ak-v5-card p-4">
                    <div className="text-xs font-bold text-white/70">Subir nuevo archivo (ORI)</div>
                    <div className="mt-3 grid place-items-center rounded-2xl border border-dashed border-white/15 bg-black/20 py-6 text-center">
                      <UploadCloud size={22} className="text-[#ff2b2b]" />
                      <div className="mt-2 text-[11px] font-bold text-white/60">Arrastra tu archivo aquí</div>
                      <div className="text-[10px] text-white/30">o haz clic para seleccionar</div>
                      <div className="mt-2 text-[9px] text-white/25">Formatos soportados: .bin .ori .hex .ecu .zip</div>
                    </div>
                  </div>
                  <div className="ak-v5-card p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-white/70">Estado de pedidos</div>
                      <span className="text-[10px] font-bold text-[#ff2b2b]">Ver todos</span>
                    </div>
                    <div className="mt-3 space-y-2.5">
                      {orders.map(o => (
                        <div key={o.vehicle} className="flex items-center justify-between border-b border-white/[.05] pb-2 text-[11px] last:border-0 last:pb-0">
                          <div>
                            <div className="font-bold text-white/75">{o.vehicle}</div>
                            <div className="text-[10px] text-white/30">{o.service}</div>
                          </div>
                          <div className="text-right">
                            <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${statusStyles[o.tone]}`}>{o.status}</span>
                            <div className="mt-1 text-[9px] text-white/25">{o.updated.split(' ')[0]}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="ak-v5-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-white/70">Servicios populares</div>
                    <span className="text-[10px] font-bold text-[#ff2b2b]">Ver todos los servicios</span>
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                    <div className="rounded-xl border border-white/[.07] bg-black/20 p-2.5"><Gauge size={16} className="mx-auto text-[#ff2b2b]" /><div className="mt-1.5 text-[9px] font-bold text-white/55">Stage 1<br />Stage 2<br />Stage 3</div></div>
                    <div className="rounded-xl border border-white/[.07] bg-black/20 p-2.5"><Filter size={16} className="mx-auto text-[#ff2b2b]" /><div className="mt-1.5 text-[9px] font-bold text-white/55">DPF / EGR<br />AdBlue / Lambda</div></div>
                    <div className="rounded-xl border border-white/[.07] bg-black/20 p-2.5"><Cpu size={16} className="mx-auto text-[#ff2b2b]" /><div className="mt-1.5 text-[9px] font-bold text-white/55">Immo Off<br />soluciones ECU</div></div>
                    <div className="rounded-xl border border-white/[.07] bg-black/20 p-2.5"><LayoutGrid size={16} className="mx-auto text-[#ff2b2b]" /><div className="mt-1.5 text-[9px] font-bold text-white/55">Más servicios<br />personalizados</div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      <section className="relative z-10 border-y border-white/[.06] bg-white/[.018]">
        <div className="mx-auto grid max-w-[1480px] grid-cols-2 gap-4 px-5 py-8 md:grid-cols-4 lg:px-8">
          {highlights.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[#ff2b2b]/20 bg-[#ff2b2b]/10 text-[#ff2b2b]"><Icon size={19} /></div>
              <div><div className="text-sm font-bold">{title}</div><div className="mt-1 text-xs leading-5 text-white/38">{text}</div></div>
            </div>
          ))}
        </div>
      </section>

      <section id="servicios" className="relative z-10 mx-auto max-w-[1480px] px-5 py-14 lg:px-8">
        <div className="mb-8 text-center"><div className="ak-v5-kicker !text-[#ff2b2b]">Nuestros servicios</div></div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {services.map(({ icon: Icon, title, text, image }) => (
            <article key={title} className="ak-v5-card relative overflow-hidden p-7">
              {image && (
                <>
                  <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070a10] via-[#070a10]/75 to-[#070a10]/30" />
                </>
              )}
              <div className="relative">
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#ff2b2b]/20 bg-[#ff2b2b]/10 text-[#ff2b2b]"><Icon /></div>
                <h3 className="mt-7 text-xl font-bold tracking-tight">{title}</h3>
                <p className="mt-3 leading-6 text-white/40">{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="como-funciona" className="relative z-10 mx-auto max-w-[1480px] px-5 py-14 lg:px-8">
        <div className="mb-9 text-center"><div className="ak-v5-kicker !text-[#ff2b2b]">Cómo funciona</div></div>
        <div className="relative grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="pointer-events-none absolute inset-x-[12%] top-[70px] hidden border-t border-dashed border-white/15 xl:block" />
          {steps.map(({ n, icon: Icon, title, text }) => (
            <div key={n} className="ak-v5-card relative p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-[#ff2b2b] text-sm font-black shadow-[0_0_24px_rgba(255,43,43,.4)]">{n}</div>
                <Icon size={20} className="text-white/35" />
              </div>
              <h3 className="mt-5 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/40">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-[1480px] px-5 py-14 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
          <div className="ak-v5-card p-7 sm:p-8">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">Mis pedidos recientes</div>
              <span className="text-xs font-bold text-[#ff2b2b]">Ver todo el historial</span>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-xs">
                <thead>
                  <tr className="text-white/30">
                    <th className="pb-3 font-bold uppercase tracking-wider">Vehículo / Proyecto</th>
                    <th className="pb-3 font-bold uppercase tracking-wider">Servicio</th>
                    <th className="pb-3 font-bold uppercase tracking-wider">Estado</th>
                    <th className="pb-3 font-bold uppercase tracking-wider">Progreso</th>
                    <th className="pb-3 font-bold uppercase tracking-wider">Actualizado</th>
                    <th className="pb-3" />
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => {
                    const RowIcon = o.tone === 'green' ? Download : Eye
                    return (
                      <tr key={o.vehicle} className="border-t border-white/[.06]">
                        <td className="py-3 font-bold text-white/80">{o.vehicle}</td>
                        <td className="py-3 text-white/50">{o.service}</td>
                        <td className="py-3"><span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusStyles[o.tone]}`}>{o.status}</span></td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 rounded-full bg-white/[.08]"><div className={`h-full rounded-full ${progressStyles[o.tone]}`} style={{ width: `${o.progress}%` }} /></div>
                            <span className="text-[10px] text-white/35">{o.progress}%</span>
                          </div>
                        </td>
                        <td className="py-3 text-white/35">{o.updated}</td>
                        <td className="py-3 text-white/30"><RowIcon size={15} /></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="ak-v5-title text-4xl sm:text-5xl">Todo lo que necesitas,<br />en un solo lugar</h2>
            <div className="mt-7 space-y-3">
              {checklist.map(x => (
                <div key={x} className="flex items-center gap-3 text-sm font-semibold text-white/70"><CheckCircle2 size={18} className="text-[#ff2b2b]" />{x}</div>
              ))}
            </div>
            <div className="relative mt-8">
              <div className="absolute -inset-10 -z-10 rounded-full bg-[#ff2b2b]/10 blur-[90px]" />
              <img src="/images/marketing/dashboard-devices.webp" alt="AK Cloud en laptop y tablet" className="w-full rounded-[24px]" />
            </div>
          </div>
        </div>
      </section>

      <section id="precios" className="relative z-10 mx-auto max-w-[1480px] px-5 pb-16 pt-2 lg:px-8">
        <div className="ak-v5-card relative overflow-hidden p-8 sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(255,43,43,.18),transparent_55%)]" />
          <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="ak-v5-title text-3xl sm:text-4xl">Empieza a trabajar con <span className="text-[#ff2b2b]">AK Cloud</span></h2>
              <p className="mt-3 max-w-md leading-7 text-white/42">Acceso profesional, rápido y centralizado para tu servicio de archivos.</p>
            </div>
            <Link href="/register" className="ak-v5-button shrink-0 !bg-gradient-to-b !from-[#ff2b2b] !to-[#b30012] !shadow-[0_16px_42px_rgba(230,10,20,.35),inset_0_1px_0_rgba(255,255,255,.25)] hover:!shadow-[0_22px_56px_rgba(230,10,20,.48)]"><UserPlus size={18} /> Solicitar acceso ahora</Link>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-white/10 bg-[#080a0f]/90 p-2 shadow-2xl backdrop-blur-xl sm:hidden">
        <Link href="/register" className="ak-v5-button w-full justify-center !bg-gradient-to-b !from-[#ff2b2b] !to-[#b30012] !shadow-[0_16px_42px_rgba(230,10,20,.35),inset_0_1px_0_rgba(255,255,255,.25)] hover:!shadow-[0_22px_56px_rgba(230,10,20,.48)]">Solicitar cuenta <ArrowRight size={17} /></Link>
      </div>

      <footer id="contacto" className="relative z-10 border-t border-white/[.07]">
        <div className="mx-auto grid max-w-[1480px] gap-10 px-5 py-14 lg:grid-cols-[1.3fr_.8fr_.8fr_.8fr_1fr] lg:px-8">
          <div>
            <img src="/images/brand/ak-cloud-logo.webp" alt="AK Cloud by Autokeys Remaps Pro" className="h-9 w-auto" />
            <p className="mt-4 max-w-xs text-sm leading-6 text-white/35">Plataforma profesional de File Service para talleres y expertos en electrónica.</p>
          </div>
          {footerColumns.map(col => (
            <div key={col.title}>
              <div className="text-xs font-black uppercase tracking-[.16em] text-white/40">{col.title}</div>
              <div className="mt-4 space-y-2.5 text-sm text-white/45">
                {col.links.map(([label, href]) => (
                  <Link key={label} href={href} className="block transition hover:text-white">{label}</Link>
                ))}
              </div>
            </div>
          ))}
          <div>
            <div className="text-sm font-black">Autokeys <span className="text-[#ff2b2b]">Remaps Pro</span></div>
            <p className="mt-3 text-sm leading-6 text-white/35">Expertos en electrónica y software automotriz.</p>
            <div className="mt-5 flex gap-3">
              <a href="#" aria-label="YouTube" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[.03] text-white/50 transition hover:text-white"><Youtube size={16} /></a>
              <a href="#" aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[.03] text-white/50 transition hover:text-white"><Facebook size={16} /></a>
              <a href="#" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[.03] text-white/50 transition hover:text-white"><Instagram size={16} /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/[.06] px-5 py-6 text-center text-xs text-white/30 lg:px-8">© 2026 AK Cloud by Autokeys Remaps Pro. Todos los derechos reservados.</div>
      </footer>
    </main>
  )
}
