import Link from 'next/link'
import { ArrowRight, CheckCircle2, ChevronRight, Cpu, FileCheck2, Fingerprint, Gauge, LockKeyhole, MessageSquareText, ScanLine, ShieldCheck, Sparkles, UploadCloud, Workflow, Zap } from 'lucide-react'

const workflow = [
  { n:'01', title:'Carga el ORI', text:'Subida segura, datos técnicos y vehículo en un único flujo.', icon:UploadCloud },
  { n:'02', title:'Selecciona soluciones', text:'Servicios organizados, precio real por archivo y resumen inmediato.', icon:Workflow },
  { n:'03', title:'Trabajo en laboratorio', text:'Seguimiento, conversación técnica y versiones V1, V2, V3.', icon:Cpu },
  { n:'04', title:'Descarga la final', text:'Historial completo y versión definitiva siempre disponible.', icon:FileCheck2 },
]
const features=[
  {icon:Fingerprint,title:'Identificación estricta',text:'Si no hay evidencia suficiente, AK Cloud no inventa la ECU.'},
  {icon:MessageSquareText,title:'Workspace por pedido',text:'Archivos, versiones, mensajes y trazabilidad en una sola vista.'},
  {icon:LockKeyhole,title:'Entorno profesional',text:'Acceso aprobado, almacenamiento seguro y flujo B2B.'},
]
export default function HomePage(){return <main className="ak-v5-bg min-h-screen overflow-hidden text-white">
  <header className="ak-v5-topbar sticky top-0 z-50"><div className="mx-auto flex max-w-[1480px] items-center justify-between px-5 py-4 lg:px-8">
    <Link href="/" className="flex items-center gap-3"><img src="/images/brand/autokeys-logo-small-transparent.webp" alt="Autokeys" className="h-10 w-auto"/><div className="hidden sm:block"><div className="text-sm font-black tracking-[.18em]">AK <span className="text-[#e5a05d]">CLOUD</span></div><div className="text-[9px] uppercase tracking-[.25em] text-white/30">File intelligence platform</div></div></Link>
    <nav className="hidden items-center gap-7 text-xs font-bold text-white/45 lg:flex"><a href="#experience" className="hover:text-white">Experiencia</a><a href="#intelligence" className="hover:text-white">Intelligence</a><a href="#workflow" className="hover:text-white">Flujo</a></nav>
    <div className="flex gap-2"><Link href="/login" className="ak-v5-button-secondary !px-4 !py-2.5 text-xs">Acceder</Link><Link href="/register" className="ak-v5-button hidden !px-4 !py-2.5 text-xs sm:inline-flex">Solicitar acceso <ArrowRight size={15}/></Link></div>
  </div></header>

  <section className="relative z-10 mx-auto grid min-h-[820px] max-w-[1480px] items-center gap-12 px-5 py-20 lg:grid-cols-[.92fr_1.08fr] lg:px-8">
    <div className="ak-v5-reveal">
      <div className="ak-v5-pill"><span className="ak-v5-dot"/> Plataforma operativa · Precio por archivo</div>
      <h1 className="ak-v5-title mt-8 text-6xl sm:text-7xl xl:text-[6.4rem]">El file service<br/><span className="text-[#e5a05d]">de otra liga.</span></h1>
      <p className="mt-7 max-w-xl text-lg leading-8 text-white/48">Una experiencia diseñada para talleres que necesitan velocidad, precisión y control. Sin créditos. Sin ruido. Cada trabajo, perfectamente organizado.</p>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/register" className="ak-v5-button">Entrar como distribuidor <ArrowRight size={18}/></Link><a href="#experience" className="ak-v5-button-secondary">Descubrir la plataforma <ChevronRight size={18}/></a></div>
      <div className="mt-10 grid max-w-xl grid-cols-3 gap-3"><div className="ak-v5-stat"><div className="ak-v5-stat-value">1</div><div className="text-xs text-white/35">Workspace central</div></div><div className="ak-v5-stat"><div className="ak-v5-stat-value">100%</div><div className="text-xs text-white/35">Trazabilidad</div></div><div className="ak-v5-stat"><div className="ak-v5-stat-value">V∞</div><div className="text-xs text-white/35">Versiones</div></div></div>
    </div>

    <div className="relative ak-v5-float">
      <div className="absolute -inset-20 rounded-full bg-[#e5a05d]/10 blur-[110px]"/>
      <div className="ak-v5-glass relative overflow-hidden rounded-[34px] p-3">
        <div className="flex items-center justify-between border-b border-white/[.07] px-4 py-3"><div className="flex gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#ff4964]"/><i className="h-2.5 w-2.5 rounded-full bg-[#e5a05d]"/><i className="h-2.5 w-2.5 rounded-full bg-[#53e6a8]"/></div><div className="text-[10px] font-bold uppercase tracking-[.2em] text-white/30">AK Cloud · Live Workspace</div><div className="ak-v5-pill !px-2.5 !py-1"><span className="ak-v5-dot"/> Online</div></div>
        <div className="grid gap-3 p-3 sm:grid-cols-[180px_1fr]">
          <aside className="hidden rounded-2xl border border-white/[.07] bg-black/25 p-3 sm:block"><div className="mb-5 rounded-xl border border-[#e5a05d]/20 bg-[#e5a05d]/[.08] p-3 text-xs font-bold text-[#ffd09a]">+ Nuevo pedido</div>{['Dashboard','Pedidos','Versiones','Garage','Biblioteca','Soporte'].map((x,i)=><div key={x} className={`mb-1.5 rounded-xl px-3 py-2.5 text-xs ${i===0?'bg-white/[.07] text-white':'text-white/35'}`}>{x}</div>)}</aside>
          <div className="space-y-3"><div className="grid grid-cols-3 gap-2"><div className="ak-v5-stat"><div className="text-[10px] uppercase text-white/30">Activos</div><div className="mt-2 text-3xl font-black">12</div></div><div className="ak-v5-stat"><div className="text-[10px] uppercase text-white/30">Versiones</div><div className="mt-2 text-3xl font-black text-[#67e8d1]">04</div></div><div className="ak-v5-stat"><div className="text-[10px] uppercase text-white/30">Pendiente</div><div className="mt-2 text-3xl font-black text-[#e5a05d]">95€</div></div></div>
            <div className="ak-v5-card p-4"><div className="flex items-center justify-between"><div><div className="text-[10px] uppercase tracking-widest text-white/30">Último trabajo</div><div className="mt-1 font-bold">BMW 320d · Bosch MD1CS001</div></div><span className="rounded-full border border-[#67e8d1]/20 bg-[#67e8d1]/10 px-3 py-1 text-[10px] font-bold text-[#67e8d1]">V2 DISPONIBLE</span></div><div className="mt-5 h-1.5 rounded-full bg-white/[.06]"><div className="h-full w-[78%] rounded-full bg-gradient-to-r from-[#e5a05d] to-[#67e8d1]"/></div><div className="mt-3 flex justify-between text-[10px] text-white/30"><span>Pedido creado</span><span>Esperando prueba</span></div></div>
            <div className="ak-v5-terminal ak-v5-scan p-4"><div className="flex items-center gap-2 text-xs font-bold text-[#67e8d1]"><ScanLine size={16}/> ECU ANALYSIS</div>{[['SHA-256','match verified'],['ECU','Bosch MD1CS001'],['HW','0281037xxx'],['Status','ready for review']].map(([a,b])=><div key={a} className="mt-3 flex justify-between border-b border-white/[.055] pb-2 text-[11px]"><span className="text-white/28">{a}</span><span className="text-white/70">{b}</span></div>)}</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="experience" className="relative z-10 mx-auto max-w-[1480px] px-5 py-24 lg:px-8"><div className="grid gap-5 lg:grid-cols-3">{features.map(({icon:Icon,title,text})=><div key={title} className="ak-v5-card p-7"><div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#e5a05d]/20 bg-[#e5a05d]/10 text-[#ffd09a]"><Icon/></div><h2 className="mt-8 text-2xl font-bold tracking-tight">{title}</h2><p className="mt-3 leading-7 text-white/40">{text}</p></div>)}</div></section>

  <section id="intelligence" className="relative z-10 mx-auto max-w-[1480px] px-5 py-20 lg:px-8"><div className="ak-v5-glass grid overflow-hidden rounded-[34px] lg:grid-cols-2"><div className="p-8 sm:p-12"><div className="ak-v5-kicker">AK Intelligence</div><h2 className="ak-v5-title mt-5 text-5xl sm:text-6xl">Precisión antes que apariencia.</h2><p className="mt-6 max-w-xl leading-8 text-white/44">El sistema solo identifica cuando existen evidencias verificadas. Cuando no está seguro, solicita información adicional en lugar de mostrar una ECU incorrecta.</p><div className="mt-8 space-y-3">{['Huella exacta confirmada','HW + SW validados','Aprendizaje supervisado por el laboratorio'].map(x=><div key={x} className="flex items-center gap-3 text-sm text-white/70"><CheckCircle2 size={18} className="text-[#53e6a8]"/>{x}</div>)}</div></div><div className="relative min-h-[420px] border-t border-white/[.07] bg-black/25 p-8 lg:border-l lg:border-t-0"><div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(103,232,209,.11),transparent_55%)]"/><div className="relative mx-auto grid aspect-square max-w-[390px] place-items-center"><div className="absolute inset-[12%] rounded-full border border-[#67e8d1]/15 animate-[spin_18s_linear_infinite]"/><div className="absolute inset-[23%] rounded-full border border-dashed border-[#e5a05d]/20 animate-[spin_12s_linear_infinite_reverse]"/><div className="grid h-44 w-44 place-items-center rounded-full border border-white/10 bg-[#0a1018] shadow-[0_0_80px_rgba(103,232,209,.14)]"><div className="text-center"><Cpu size={32} className="mx-auto text-[#67e8d1]"/><div className="mt-3 text-4xl font-black">2.845</div><div className="text-[10px] uppercase tracking-[.22em] text-white/30">ECUs verificadas</div></div></div></div></div></div></section>

  <section id="workflow" className="relative z-10 mx-auto max-w-[1480px] px-5 py-24 lg:px-8"><div className="mb-10"><div className="ak-v5-kicker">Flujo profesional</div><h2 className="ak-v5-title mt-4 text-5xl">De ORI a FINAL.</h2></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{workflow.map(({n,title,text,icon:Icon})=><div key={n} className="ak-v5-card p-6"><div className="flex items-center justify-between"><span className="text-xs font-black text-[#e5a05d]">{n}</span><Icon size={21} className="text-white/35"/></div><h3 className="mt-12 text-xl font-bold">{title}</h3><p className="mt-3 text-sm leading-6 text-white/38">{text}</p></div>)}</div></section>

  <footer className="relative z-10 border-t border-white/[.07]"><div className="mx-auto flex max-w-[1480px] flex-col gap-5 px-5 py-10 text-sm text-white/30 sm:flex-row sm:items-center sm:justify-between lg:px-8"><div>© 2026 AK Cloud · Powered by Autokeys Lab</div><div className="flex gap-5"><Link href="/legal/terminos">Términos</Link><Link href="/legal/privacidad">Privacidad</Link><Link href="/login" className="text-[#e5a05d]">Acceder</Link></div></div></footer>
</main>}
