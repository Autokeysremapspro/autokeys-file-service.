import Link from 'next/link'
import AkOrderSimulator from '@/components/marketing/AkOrderSimulator'
import AkProfessionalFit from '@/components/marketing/AkProfessionalFit'
import {
  ArrowRight, BadgeCheck, Check, CheckCircle2, ChevronRight, Clock3, CloudCog, CopyCheck,
  Cpu, FileCheck2, Fingerprint, Gauge, Headphones, LockKeyhole, MessageSquareText,
  ScanLine, ShieldCheck, Sparkles, UploadCloud, Users, Workflow, Zap, Gift, Euro, Layers3
} from 'lucide-react'

const workflow = [
  { n: '01', title: 'Sube el archivo original', text: 'Vehículo, ECU, HW, SW, lectura y observaciones en un único formulario.', icon: UploadCloud },
  { n: '02', title: 'Elige las soluciones', text: 'Selecciona Stage, DPF, EGR, AdBlue u otras opciones y conoce el precio real.', icon: Workflow },
  { n: '03', title: 'Seguimiento en directo', text: 'Consulta el estado, habla con el laboratorio y recibe nuevas versiones sin perder información.', icon: CloudCog },
  { n: '04', title: 'Descarga y prueba', text: 'La versión final queda guardada junto al historial completo del trabajo.', icon: FileCheck2 },
]

const benefits = [
  { icon: Zap, title: 'Sin créditos', text: 'Pagas el precio indicado por cada trabajo. Sin paquetes confusos ni saldo bloqueado.' },
  { icon: MessageSquareText, title: 'Soporte técnico real', text: 'Cada pedido tiene su propia conversación y toda la información queda vinculada.' },
  { icon: Fingerprint, title: 'Identificación rigurosa', text: 'La ECU solo se identifica cuando existen datos suficientes y verificables.' },
  { icon: Clock3, title: 'Menos tiempo perdido', text: 'Archivos, mensajes, estados y versiones se gestionan desde un mismo lugar.' },
  { icon: ShieldCheck, title: 'Historial completo', text: 'Conserva el ORI, las versiones entregadas y las observaciones de cada pedido.' },
  { icon: Users, title: 'Creado para talleres', text: 'Un flujo B2B pensado para profesionales que trabajan con clientes reales.' },
]

const faqs = [
  ['¿AK Cloud funciona con créditos?', 'No. Cada servicio muestra su precio y se paga por archivo.'],
  ['¿Puedo solicitar una revisión?', 'Sí. El pedido conserva mensajes, pruebas y versiones para continuar el trabajo sin empezar de cero.'],
  ['¿Dónde quedan mis archivos?', 'Dentro del workspace del pedido, junto con el historial y las versiones entregadas.'],
  ['¿El acceso es automático?', 'El registro se revisa para mantener AK Cloud como una plataforma exclusiva para profesionales.'],
]

export default function HomePage() {
  return (
    <main className="ak-v5-bg min-h-screen overflow-hidden text-white">
      <header className="ak-v5-topbar sticky top-0 z-50">
        <div className="mx-auto flex max-w-[1480px] items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <img src="/images/brand/autokeys-logo-small-transparent.webp" alt="Autokeys" className="h-10 w-auto" />
            <div className="hidden sm:block">
              <div className="text-sm font-black tracking-[.18em]">AK <span className="text-[#ff425a]">CLOUD</span></div>
              <div className="text-[9px] uppercase tracking-[.25em] text-white/30">Professional file service</div>
            </div>
          </Link>
          <nav className="hidden items-center gap-7 text-xs font-bold text-white/45 lg:flex">
            <a href="#ventajas" className="transition hover:text-white">Ventajas</a>
            <a href="#flujo" className="transition hover:text-white">Cómo funciona</a>
            <a href="#simulador" className="transition hover:text-white">Simulador</a>
            <a href="#precision" className="transition hover:text-white">Tecnología</a>
            <a href="#acceso" className="transition hover:text-white">Acceso</a>
            <a href="#faq" className="transition hover:text-white">Preguntas</a>
          </nav>
          <div className="flex gap-2">
            <Link href="/login" className="ak-v5-button-secondary !px-4 !py-2.5 text-xs">Acceder</Link>
            <Link href="/register" className="ak-v5-button hidden !px-4 !py-2.5 text-xs sm:inline-flex">Solicitar acceso <ArrowRight size={15} /></Link>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid min-h-[820px] max-w-[1480px] items-center gap-12 px-5 py-20 lg:grid-cols-[.92fr_1.08fr] lg:px-8">
        <div className="ak-v5-reveal">
          <div className="ak-v5-pill"><span className="ak-v5-dot" /> Plataforma B2B · Pago por archivo</div>
          <h1 className="ak-v5-title mt-8 text-6xl sm:text-7xl xl:text-[6.2rem]">Más rápido que WhatsApp.<br /><span className="text-[#ff425a]">Más profesional que los créditos.</span></h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-white/48">AK Cloud centraliza archivos, versiones, mensajes y pagos en un workspace diseñado para talleres. Cada trabajo tiene un precio claro, un estado visible y un historial completo.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="ak-v5-button">Solicitar acceso profesional <ArrowRight size={18} /></Link>
            <a href="#flujo" className="ak-v5-button-secondary">Ver cómo funciona <ChevronRight size={18} /></a>
          </div>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs font-bold text-white/48">
            {['Precio por archivo', 'Historial de versiones', 'Soporte vinculado al pedido'].map(item => <span key={item} className="flex items-center gap-2"><CheckCircle2 size={15} className="text-[#67e8d1]" />{item}</span>)}
          </div>
        </div>

        <div className="relative ak-v5-float">
          <div className="absolute -inset-20 rounded-full bg-[#ff425a]/10 blur-[110px]" />
          <div className="ak-v5-glass relative overflow-hidden rounded-[34px] p-3">
            <div className="flex items-center justify-between border-b border-white/[.07] px-4 py-3">
              <div className="flex gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#ff4964]" /><i className="h-2.5 w-2.5 rounded-full bg-[#ff425a]" /><i className="h-2.5 w-2.5 rounded-full bg-[#53e6a8]" /></div>
              <div className="text-[10px] font-bold uppercase tracking-[.2em] text-white/30">AK Cloud · Workspace</div>
              <div className="ak-v5-pill !px-2.5 !py-1"><span className="ak-v5-dot" /> Online</div>
            </div>
            <div className="grid gap-3 p-3 sm:grid-cols-[180px_1fr]">
              <aside className="hidden rounded-2xl border border-white/[.07] bg-black/25 p-3 sm:block">
                <div className="mb-5 rounded-xl border border-[#ff425a]/20 bg-[#ff425a]/[.08] p-3 text-xs font-bold text-[#ff8095]">+ Nuevo pedido</div>
                {['Dashboard', 'Pedidos', 'Versiones', 'Garage', 'Biblioteca', 'Soporte'].map((x, i) => <div key={x} className={`mb-1.5 rounded-xl px-3 py-2.5 text-xs ${i === 1 ? 'bg-white/[.07] text-white' : 'text-white/35'}`}>{x}</div>)}
              </aside>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="ak-v5-stat"><div className="text-[10px] uppercase text-white/30">Activos</div><div className="mt-2 text-3xl font-black">12</div></div>
                  <div className="ak-v5-stat"><div className="text-[10px] uppercase text-white/30">Entregados</div><div className="mt-2 text-3xl font-black text-[#67e8d1]">48</div></div>
                  <div className="ak-v5-stat"><div className="text-[10px] uppercase text-white/30">Saldo</div><div className="mt-2 text-3xl font-black text-[#ff425a]">0 cr.</div></div>
                </div>
                <div className="ak-v5-card p-4">
                  <div className="flex items-center justify-between gap-3"><div><div className="text-[10px] uppercase tracking-widest text-white/30">Pedido AK-2841</div><div className="mt-1 font-bold">BMW 320d · Bosch MD1CS001</div></div><span className="rounded-full border border-[#67e8d1]/20 bg-[#67e8d1]/10 px-3 py-1 text-[10px] font-bold text-[#67e8d1]">V2 LISTA</span></div>
                  <div className="mt-5 h-1.5 rounded-full bg-white/[.06]"><div className="h-full w-[86%] rounded-full bg-gradient-to-r from-[#ff425a] to-[#67e8d1]" /></div>
                  <div className="mt-3 flex justify-between text-[10px] text-white/30"><span>ORI recibido</span><span>Esperando prueba</span></div>
                </div>
                <div className="ak-v5-terminal ak-v5-scan p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#67e8d1]"><ScanLine size={16} /> ECU ANALYSIS</div>
                  {[['Identificación', 'verificada'], ['ECU', 'Bosch MD1CS001'], ['Soluciones', 'Stage 1 + EGR'], ['Estado', 'ready for download']].map(([a, b]) => <div key={a} className="mt-3 flex justify-between border-b border-white/[.055] pb-2 text-[11px]"><span className="text-white/28">{a}</span><span className="text-white/70">{b}</span></div>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-y border-white/[.06] bg-white/[.018]">
        <div className="mx-auto grid max-w-[1480px] grid-cols-2 gap-4 px-5 py-8 md:grid-cols-4 lg:px-8">
          {[['SIN CRÉDITOS', 'Precio claro por archivo'], ['WORKSPACE', 'Todo en un solo lugar'], ['TRAZABILIDAD', 'ORI, MOD y versiones'], ['ACCESO B2B', 'Solo profesionales']].map(([title, text]) => <div key={title} className="text-center"><div className="text-xs font-black tracking-[.18em] text-[#ff425a]">{title}</div><div className="mt-1 text-sm text-white/35">{text}</div></div>)}
        </div>
      </section>

      <section id="ventajas" className="relative z-10 mx-auto max-w-[1480px] px-5 py-24 lg:px-8">
        <div className="mb-10 max-w-3xl"><div className="ak-v5-kicker">Diseñado para trabajar</div><h2 className="ak-v5-title mt-4 text-5xl sm:text-6xl">Menos WhatsApp.<br />Más control.</h2><p className="mt-5 text-lg leading-8 text-white/42">AK Cloud organiza el trabajo técnico para que el taller sepa qué ha enviado, qué se está haciendo y qué versión debe instalar.</p></div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{benefits.map(({ icon: Icon, title, text }) => <article key={title} className="ak-v5-card p-7"><div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#ff425a]/20 bg-[#ff425a]/10 text-[#ff8095]"><Icon /></div><h3 className="mt-7 text-2xl font-bold tracking-tight">{title}</h3><p className="mt-3 leading-7 text-white/40">{text}</p></article>)}</div>
      </section>

      <section id="simulador" className="relative z-10 mx-auto max-w-[1480px] px-5 py-20 lg:px-8">
        <AkOrderSimulator />
      </section>

      <section className="relative z-10 mx-auto max-w-[1480px] px-5 py-20 lg:px-8">
        <div className="mb-10 max-w-3xl"><div className="ak-v5-kicker">La diferencia AK Cloud</div><h2 className="ak-v5-title mt-4 text-5xl sm:text-6xl">No compras saldo.<br />Compras una solución.</h2></div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[30px] border border-white/[.07] bg-black/25 p-7 sm:p-9">
            <div className="flex items-center gap-3 text-white/35"><Layers3 /><span className="text-xs font-black uppercase tracking-[.18em]">Sistema por créditos</span></div>
            <div className="mt-7 space-y-4">{['Recargar antes de trabajar', 'Saldo inmovilizado', 'Coste difícil de interpretar', 'Conversaciones fuera del pedido'].map(x => <div key={x} className="flex items-center gap-3 text-white/38"><span className="grid h-6 w-6 place-items-center rounded-full border border-white/10 text-xs">×</span>{x}</div>)}</div>
          </div>
          <div className="ak-v5-card p-7 sm:p-9">
            <div className="flex items-center gap-3 text-[#67e8d1]"><Euro /><span className="text-xs font-black uppercase tracking-[.18em]">AK Cloud · precio por archivo</span></div>
            <div className="mt-7 space-y-4">{['Precio visible antes de enviar', 'Pagas solo el trabajo solicitado', 'Historial, mensajes y versiones unidos', 'Acceso profesional revisado'].map(x => <div key={x} className="flex items-center gap-3 text-white/72"><CheckCircle2 size={18} className="text-[#67e8d1]" />{x}</div>)}</div>
          </div>
        </div>
      </section>

      <section id="flujo" className="relative z-10 mx-auto max-w-[1480px] px-5 py-20 lg:px-8">
        <div className="mb-10"><div className="ak-v5-kicker">Flujo profesional</div><h2 className="ak-v5-title mt-4 text-5xl sm:text-6xl">De ORI a FINAL.</h2></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{workflow.map(({ n, title, text, icon: Icon }) => <div key={n} className="ak-v5-card p-6"><div className="flex items-center justify-between"><span className="text-xs font-black text-[#ff425a]">{n}</span><Icon size={21} className="text-white/35" /></div><h3 className="mt-12 text-xl font-bold">{title}</h3><p className="mt-3 text-sm leading-6 text-white/38">{text}</p></div>)}</div>
      </section>

      <section id="precision" className="relative z-10 mx-auto max-w-[1480px] px-5 py-20 lg:px-8">
        <div className="ak-v5-glass grid overflow-hidden rounded-[34px] lg:grid-cols-2">
          <div className="p-8 sm:p-12"><div className="ak-v5-kicker">AK Intelligence</div><h2 className="ak-v5-title mt-5 text-5xl sm:text-6xl">La plataforma no debe adivinar.</h2><p className="mt-6 max-w-xl leading-8 text-white/44">Cuando existen datos suficientes, AK Cloud ayuda a identificar y organizar el trabajo. Cuando faltan evidencias, solicita más información antes de mostrar una ECU incorrecta.</p><div className="mt-8 space-y-3">{['Datos técnicos vinculados al archivo', 'HW y SW documentados', 'Aprendizaje supervisado por el laboratorio'].map(x => <div key={x} className="flex items-center gap-3 text-sm text-white/70"><CheckCircle2 size={18} className="text-[#53e6a8]" />{x}</div>)}</div></div>
          <div className="relative min-h-[420px] border-t border-white/[.07] bg-black/25 p-8 lg:border-l lg:border-t-0"><div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(103,232,209,.11),transparent_55%)]" /><div className="relative mx-auto grid aspect-square max-w-[390px] place-items-center"><div className="absolute inset-[12%] rounded-full border border-[#67e8d1]/15 animate-[spin_18s_linear_infinite]" /><div className="absolute inset-[23%] rounded-full border border-dashed border-[#ff425a]/20 animate-[spin_12s_linear_infinite_reverse]" /><div className="grid h-44 w-44 place-items-center rounded-full border border-white/10 bg-[#0a1018] shadow-[0_0_80px_rgba(103,232,209,.14)]"><div className="text-center"><Cpu size={32} className="mx-auto text-[#67e8d1]" /><div className="mt-3 text-4xl font-black">AK</div><div className="text-[10px] uppercase tracking-[.22em] text-white/30">Verified workflow</div></div></div></div></div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-[1480px] px-5 py-24 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_.85fr]">
          <div className="ak-v5-card p-8 sm:p-10"><div className="flex items-center gap-3 text-[#67e8d1]"><BadgeCheck /><span className="text-xs font-black uppercase tracking-[.2em]">Para distribuidores</span></div><h2 className="ak-v5-title mt-6 text-4xl sm:text-5xl">Una herramienta que también mejora tu imagen ante el cliente.</h2><p className="mt-5 max-w-2xl leading-8 text-white/42">Pedidos ordenados, información técnica completa y versiones identificadas. Menos errores internos y una forma de trabajar más profesional.</p><div className="mt-8 grid gap-3 sm:grid-cols-2">{['Seguimiento del pedido', 'Descarga de versiones', 'Historial técnico', 'Soporte centralizado'].map(x => <div key={x} className="flex items-center gap-3 rounded-2xl border border-white/[.07] bg-black/20 p-4 text-sm font-bold text-white/65"><Check size={17} className="text-[#ff425a]" />{x}</div>)}</div></div>
          <div className="ak-v5-glass flex flex-col justify-between rounded-[30px] p-8 sm:p-10"><div><Headphones className="text-[#ff425a]" size={34} /><h3 className="mt-6 text-3xl font-bold">Acceso profesional</h3><p className="mt-4 leading-7 text-white/42">Solicita tu cuenta. Revisamos el alta para mantener una comunidad formada por talleres y profesionales del sector.</p></div><Link href="/register" className="ak-v5-button mt-10 w-full justify-center">Solicitar acceso ahora <ArrowRight size={18} /></Link></div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-[1480px] px-5 py-20 lg:px-8">
        <div className="ak-v5-glass grid overflow-hidden rounded-[34px] lg:grid-cols-[1fr_.82fr]">
          <div className="p-8 sm:p-12"><div className="flex items-center gap-3 text-[#ff425a]"><Gift /><span className="text-xs font-black uppercase tracking-[.2em]">Programa para talleres</span></div><h2 className="ak-v5-title mt-5 text-5xl sm:text-6xl">Crece con AK Cloud.</h2><p className="mt-6 max-w-2xl leading-8 text-white/44">La V2 deja preparada la comunicación comercial para futuros niveles de distribuidor, promociones y recompensas por recomendación, sin obligarte a activarlos todavía.</p><div className="mt-8 grid gap-3 sm:grid-cols-3">{['Nivel profesional', 'Ventajas por volumen', 'Referidos verificados'].map(x => <div key={x} className="rounded-2xl border border-white/[.07] bg-black/20 p-4 text-sm font-bold text-white/65"><CopyCheck size={18} className="mb-3 text-[#67e8d1]" />{x}</div>)}</div></div>
          <div className="border-t border-white/[.07] bg-[radial-gradient(circle_at_center,rgba(255,66,90,.13),transparent_60%)] p-8 lg:border-l lg:border-t-0"><div className="flex h-full min-h-[300px] flex-col justify-center rounded-[28px] border border-[#ff425a]/20 bg-[#ff425a]/[.07] p-7 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-[#ff425a]/25 bg-[#ff425a]/10 text-[#ff8095]"><Users size={28} /></div><div className="mt-6 text-3xl font-black">Partners AK Cloud</div><p className="mt-3 text-sm leading-6 text-white/40">Acceso exclusivo para talleres, distribuidores y profesionales del sector.</p><Link href="/register" className="ak-v5-button mt-7 justify-center">Solicitar acceso <ArrowRight size={18} /></Link></div></div>
        </div>
      </section>

      <section id="acceso" className="relative z-10 mx-auto max-w-[1480px] px-5 py-20 lg:px-8">
        <AkProfessionalFit />
      </section>

      <section id="faq" className="relative z-10 mx-auto max-w-[1100px] px-5 py-20 lg:px-8"><div className="text-center"><div className="ak-v5-kicker">Preguntas frecuentes</div><h2 className="ak-v5-title mt-4 text-5xl">Todo claro antes de entrar.</h2></div><div className="mt-10 grid gap-4">{faqs.map(([q, a]) => <details key={q} className="ak-v5-card group p-6"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-lg font-bold"><span>{q}</span><span className="text-[#ff425a] transition group-open:rotate-45">+</span></summary><p className="mt-4 max-w-3xl leading-7 text-white/42">{a}</p></details>)}</div></section>

      <section className="relative z-10 mx-auto max-w-[1480px] px-5 pb-24 pt-12 lg:px-8"><div className="ak-v5-glass relative overflow-hidden rounded-[36px] p-8 text-center sm:p-14"><div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,66,90,.20),transparent_48%)]" /><div className="relative"><Sparkles className="mx-auto text-[#ff425a]" /><h2 className="ak-v5-title mx-auto mt-5 max-w-4xl text-5xl sm:text-6xl">Tu próximo archivo puede estar mejor organizado.</h2><p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/42">Entra en AK Cloud y trabaja con un file service creado alrededor del pedido, no alrededor de los créditos.</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/register" className="ak-v5-button">Solicitar acceso <ArrowRight size={18} /></Link><Link href="/login" className="ak-v5-button-secondary">Ya tengo cuenta</Link></div></div></div></section>

      <div className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-white/10 bg-[#080a0f]/90 p-2 shadow-2xl backdrop-blur-xl sm:hidden">
        <Link href="/register" className="ak-v5-button w-full justify-center">Solicitar acceso profesional <ArrowRight size={17} /></Link>
      </div>

      <footer className="relative z-10 border-t border-white/[.07]"><div className="mx-auto flex max-w-[1480px] flex-col gap-5 px-5 py-10 text-sm text-white/30 sm:flex-row sm:items-center sm:justify-between lg:px-8"><div>© 2026 AK Cloud · Powered by Autokeys Lab</div><div className="flex gap-5"><Link href="/legal/terminos">Términos</Link><Link href="/legal/privacidad">Privacidad</Link><Link href="/login" className="text-[#ff425a]">Acceder</Link></div></div></footer>
    </main>
  )
}
