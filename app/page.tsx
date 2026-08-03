import Link from 'next/link'
import {
  ArrowRight, BadgeCheck, Binary, ChevronRight, CircuitBoard, CloudUpload,
  Cpu, FileCheck2, Gauge, KeyRound, LockKeyhole, MessageSquareText,
  Radar, ShieldCheck, Sparkles, TimerReset, UploadCloud, Wrench, Zap
} from 'lucide-react'

const services = [
  { icon: Gauge, name: 'Stage 1 / Stage 2', detail: 'Calibración de rendimiento y respuesta.' },
  { icon: ShieldCheck, name: 'Soluciones ECU', detail: 'DPF, EGR, AdBlue, Lambda y diagnosis.' },
  { icon: KeyRound, name: 'IMMO & módulos', detail: 'Soluciones de inmovilizador y electrónica.' },
  { icon: CircuitBoard, name: 'DSG / TCU', detail: 'Servicios especializados para transmisiones.' },
  { icon: Wrench, name: 'Agrícola y camión', detail: 'Flujos específicos para maquinaria y pesado.' },
  { icon: FileCheck2, name: 'Versionado', detail: 'V1, V2, V3 y seguimiento hasta cierre manual.' },
]

const steps = [
  ['01', 'Sube el archivo', 'Añade ORI, identificación y datos del vehículo.'],
  ['02', 'Selecciona la solución', 'Servicios claros, precio por archivo y resumen completo.'],
  ['03', 'Laboratorio en acción', 'Seguimiento, mensajes, versiones y notificaciones.'],
  ['04', 'Descarga y valida', 'Recibe la versión final desde un workspace seguro.'],
]

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#03050a] text-white">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_-8%,rgba(240,164,90,.20),transparent_30%),radial-gradient(circle_at_92%_10%,rgba(101,244,223,.11),transparent_25%),linear-gradient(180deg,#03050a,#060a12_52%,#03050a)]" />
        <div className="absolute inset-0 opacity-[.11] [background-image:linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(circle_at_50%_18%,black,transparent_76%)]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[.07] bg-[#03050a]/72 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1580px] items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <img src="/images/brand/autokeys-logo-small-transparent.webp" alt="Autokeys" className="h-10 w-auto" />
            <div className="hidden border-l border-white/10 pl-3 sm:block">
              <div className="font-display text-sm font-bold tracking-[.16em]">AK <span className="text-[#f0a45a]">CLOUD</span></div>
              <div className="ak-mono mt-1 text-[9px] uppercase tracking-[.25em] text-white/30">ECU Workspace</div>
            </div>
          </Link>
          <nav className="hidden items-center gap-1 rounded-full border border-white/[.06] bg-white/[.02] p-1 lg:flex">
            {['Plataforma','Servicios','Flujo','Seguridad'].map((n) => <a key={n} href={`#${n.toLowerCase()}`} className="rounded-full px-4 py-2.5 text-[10px] font-bold uppercase tracking-[.14em] text-white/42 transition hover:bg-white/[.05] hover:text-white">{n}</a>)}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-[13px] border border-white/[.08] bg-white/[.025] px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white/75 transition hover:bg-white/[.06]">Acceder</Link>
            <Link href="/register" className="hidden items-center gap-2 rounded-[13px] border border-[#ffd09b]/25 bg-gradient-to-r from-[#784018] to-[#f0a45a] px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-[#090b0f] shadow-[0_14px_42px_rgba(240,164,90,.24)] sm:inline-flex">Solicitar acceso <ArrowRight size={15}/></Link>
          </div>
        </div>
      </header>

      <section id="plataforma" className="relative z-10 mx-auto grid min-h-[calc(100vh-72px)] max-w-[1580px] items-center gap-14 px-5 py-16 lg:grid-cols-[.88fr_1.12fr] lg:px-8">
        <div className="max-w-3xl">
          <div className="ak-eyebrow ak-mono text-[10px] font-bold uppercase tracking-[.22em] text-[#ffd09b]"><Sparkles size={14}/> Nueva generación de File Service</div>
          <h1 className="ak-premium-heading mt-7 text-5xl font-bold leading-[.93] sm:text-6xl lg:text-[5.6rem]">
            El laboratorio digital
            <span className="mt-3 block bg-gradient-to-r from-[#ffd09b] via-white to-[#65f4df] bg-clip-text text-transparent">que el sector esperaba.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-white/46 sm:text-lg">Un workspace profesional para enviar archivos, seguir versiones, comunicarte con el laboratorio y pagar por cada servicio desde un único entorno.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#784018] via-[#d9893f] to-[#f6bc78] px-6 py-4 text-sm font-bold uppercase tracking-wide text-[#080a0d] shadow-[0_20px_60px_rgba(240,164,90,.30)] transition hover:-translate-y-0.5">Solicitar acceso profesional <ArrowRight size={18} className="transition group-hover:translate-x-1"/></Link>
            <Link href="/login" className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[.025] px-6 py-4 text-sm font-bold uppercase tracking-wide text-white/80 transition hover:bg-white/[.06]">Entrar al portal <ChevronRight size={18}/></Link>
          </div>
          <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
            {[['100%','Precio por archivo'],['V1→Final','Versionado'],['24/7','Workspace']].map(([v,l]) => <div key={l} className="rounded-2xl border border-white/[.07] bg-white/[.022] p-4 backdrop-blur-xl"><div className="ak-v4-number text-2xl font-bold text-white">{v}</div><div className="ak-mono mt-1 text-[9px] uppercase tracking-[.18em] text-white/32">{l}</div></div>)}
          </div>
        </div>

        <div className="relative min-h-[650px]">
          <div className="ak-v4-orbit left-[7%] top-[4%] h-[520px] w-[520px] opacity-50" />
          <div className="ak-v4-orbit right-[0%] top-[16%] h-[390px] w-[390px] opacity-30 [animation-direction:reverse]" />
          <div className="ak-v4-float absolute inset-x-0 top-12 mx-auto max-w-[760px] overflow-hidden rounded-[30px] border border-white/[.09] bg-[#07101a]/82 shadow-[0_55px_160px_rgba(0,0,0,.68),0_0_100px_rgba(240,164,90,.10)] backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/[.07] px-5 py-4">
              <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl border border-[#f0a45a]/20 bg-[#f0a45a]/10 text-[#ffd09b]"><Cpu size={20}/></div><div><div className="text-sm font-bold">AK Intelligence</div><div className="ak-mono text-[9px] uppercase tracking-[.18em] text-white/28">ECU analysis engine</div></div></div>
              <div className="flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300"><span className="ak-v4-status-dot"/> Operativo</div>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-[1.1fr_.9fr]">
              <div className="ak-v4-scan rounded-[22px] border border-white/[.07] bg-black/25 p-5">
                <div className="flex items-center justify-between"><span className="ak-mono text-[10px] uppercase tracking-[.2em] text-white/30">Archivo recibido</span><Binary size={18} className="text-[#65f4df]"/></div>
                <div className="mt-6 rounded-2xl border border-dashed border-[#65f4df]/20 bg-[#65f4df]/[.025] p-6 text-center"><CloudUpload className="mx-auto text-[#65f4df]" size={34}/><div className="mt-3 font-bold">VW_GOLF_EDC17_ORI.bin</div><div className="mt-1 text-xs text-white/32">4.00 MB · SHA-256 verificado</div></div>
                <div className="mt-5 space-y-3">{[['Firma binaria','100%'],['HW / SW','Validado'],['Integridad','Correcta']].map(([a,b]) => <div key={a} className="flex items-center justify-between rounded-xl border border-white/[.055] bg-white/[.022] px-4 py-3"><span className="text-sm text-white/45">{a}</span><span className="ak-mono text-[11px] font-bold text-[#ffd09b]">{b}</span></div>)}</div>
              </div>
              <div className="space-y-4">
                <div className="rounded-[22px] border border-[#f0a45a]/18 bg-gradient-to-br from-[#f0a45a]/[.10] to-white/[.02] p-5"><div className="flex items-center justify-between"><Radar className="text-[#ffd09b]"/><span className="ak-mono text-[9px] uppercase tracking-[.18em] text-white/25">Confidence</span></div><div className="ak-v4-number mt-6 text-6xl font-bold">100<span className="text-2xl text-[#f0a45a]">%</span></div><div className="mt-2 text-sm text-white/44">Identificación validada</div></div>
                <div className="rounded-[22px] border border-white/[.07] bg-white/[.025] p-5"><div className="ak-mono text-[9px] uppercase tracking-[.18em] text-white/28">Resultado</div><div className="mt-4 text-2xl font-bold">Bosch EDC17C46</div><div className="mt-1 text-sm text-white/35">VAG · Tricore · OBD</div><div className="mt-5 flex items-center gap-2 text-xs font-bold text-emerald-300"><BadgeCheck size={16}/> ECU identificada</div></div>
              </div>
            </div>
            <div className="grid grid-cols-3 border-t border-white/[.07] bg-black/20">{[['12','Pedidos activos'],['03','Versiones nuevas'],['€','Pago por archivo']].map(([v,l]) => <div key={l} className="border-r border-white/[.06] p-4 text-center last:border-0"><div className="ak-v4-number text-xl font-bold">{v}</div><div className="mt-1 text-[10px] text-white/30">{l}</div></div>)}</div>
          </div>
        </div>
      </section>

      <section id="servicios" className="relative z-10 border-y border-white/[.06] bg-white/[.012] py-24">
        <div className="mx-auto max-w-[1500px] px-5 lg:px-8">
          <div className="max-w-3xl"><div className="ak-eyebrow ak-mono text-[10px] font-bold uppercase tracking-[.22em] text-[#65f4df]"><CircuitBoard size={14}/> Servicios profesionales</div><h2 className="ak-premium-heading mt-6 text-4xl font-bold sm:text-6xl">Todo el flujo técnico,<br/><span className="text-white/35">en una sola plataforma.</span></h2></div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{services.map(({icon:Icon,name,detail},i)=><div key={name} className="card group p-6"><div className="flex items-start justify-between"><div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/[.08] bg-white/[.025] text-[#ffd09b] transition group-hover:border-[#f0a45a]/30 group-hover:bg-[#f0a45a]/10"><Icon size={22}/></div><span className="ak-mono text-[10px] text-white/16">0{i+1}</span></div><h3 className="mt-7 text-xl font-bold">{name}</h3><p className="mt-2 text-sm leading-6 text-white/36">{detail}</p></div>)}</div>
        </div>
      </section>

      <section id="flujo" className="relative z-10 py-24"><div className="mx-auto max-w-[1500px] px-5 lg:px-8"><div className="grid gap-4 lg:grid-cols-4">{steps.map(([n,t,d])=><div key={n} className="relative rounded-[24px] border border-white/[.07] bg-white/[.02] p-6"><div className="ak-v4-number text-5xl font-bold text-[#f0a45a]/30">{n}</div><h3 className="mt-8 text-xl font-bold">{t}</h3><p className="mt-2 text-sm leading-6 text-white/35">{d}</p></div>)}</div></div></section>

      <section id="seguridad" className="relative z-10 pb-24"><div className="mx-auto max-w-[1500px] px-5 lg:px-8"><div className="overflow-hidden rounded-[32px] border border-white/[.08] bg-gradient-to-br from-[#f0a45a]/[.10] via-white/[.025] to-[#65f4df]/[.055] p-8 sm:p-12"><div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center"><div><div className="ak-eyebrow ak-mono text-[10px] font-bold uppercase tracking-[.22em] text-[#ffd09b]"><LockKeyhole size={14}/> Entorno profesional</div><h2 className="ak-premium-heading mt-6 text-4xl font-bold sm:text-6xl">Tu trabajo merece<br/>un software a la altura.</h2><p className="mt-5 max-w-2xl text-white/42">Archivos, conversación, precios, versiones y soporte técnico con trazabilidad completa.</p></div><Link href="/register" className="inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-7 py-4 text-sm font-bold uppercase tracking-wide text-black">Solicitar acceso <ArrowRight size={18}/></Link></div></div></div></section>

      <footer className="relative z-10 border-t border-white/[.06] py-8"><div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-5 text-sm text-white/28 sm:flex-row sm:items-center sm:justify-between lg:px-8"><span>© 2026 AK Cloud · Powered by Autokeys Remaps Pro</span><div className="flex gap-5"><Link href="/legal/privacidad">Privacidad</Link><Link href="/legal/terminos">Términos</Link></div></div></footer>
    </main>
  )
}
