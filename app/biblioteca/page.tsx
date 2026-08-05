'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Archive, Database, DownloadCloud, Filter, Search, ShieldCheck, Sparkles } from 'lucide-react'
import AppShell from '@/components/AppShell'
import AKCard from '@/components/ak/AKCard'
import AKButton from '@/components/ak/AKButton'
import AKLibraryFileCard from '@/components/ak/AKLibraryFileCard'
import { getBibliotecaArchivos, type BibliotecaArchivo, type BibliotecaTipo } from '@/lib/services/biblioteca'

const filters: Array<'TODOS' | BibliotecaTipo> = ['TODOS', 'ORI', 'MOD']

export default function BibliotecaPage() {
  const [archivos, setArchivos] = useState<BibliotecaArchivo[]>([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'TODOS' | BibliotecaTipo>('TODOS')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBibliotecaArchivos()
      .then(setArchivos)
      .catch((error) => {
        console.error(error)
        alert(error?.message || 'No se pudo cargar la biblioteca')
      })
      .finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => {
    const ori = archivos.filter((a) => a.tipo === 'ORI').length
    const mod = archivos.filter((a) => a.tipo === 'MOD').length
    const ecus = new Set(archivos.map((a) => a.ecu).filter(Boolean)).size
    const vehiculos = new Set(archivos.map((a) => [a.marca, a.modelo, a.motor].filter(Boolean).join('|')).filter(Boolean)).size
    return { ori, mod, ecus, vehiculos }
  }, [archivos])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return archivos.filter((archivo) => {
      if (filter !== 'TODOS' && archivo.tipo !== filter) return false
      if (!q) return true
      return [
        archivo.nombre,
        archivo.pedido_numero,
        archivo.tipo,
        archivo.marca,
        archivo.modelo,
        archivo.motor,
        archivo.ecu,
        archivo.hw,
        archivo.sw,
        ...(archivo.servicios || []),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    })
  }, [archivos, filter, query])

  const tags = useMemo(() => {
    const values = new Set<string>()
    archivos.forEach((archivo) => {
      ;[archivo.marca, archivo.ecu, archivo.hw, archivo.sw, ...(archivo.servicios || [])].filter(Boolean).forEach((value) => values.add(String(value)))
    })
    return Array.from(values).slice(0, 14)
  }, [archivos])

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="ak5-card ak5-gridline relative overflow-hidden rounded-[28px] p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full" style={{background:'radial-gradient(circle,rgba(255,66,90,.12),transparent 70%)'}}/>
          <div className="relative flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
            <div>
              <span className="ak5-chip border-red-400/20 bg-red-400/10 text-red-300"><Sparkles size={13}/> Private Technical Library</span>
              <h1 className="ak5-title mt-4 text-4xl sm:text-5xl">Biblioteca</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/45">Toda tu nube privada de ORI, MOD y trabajos anteriores. Busca por ECU, HW, SW, vehículo, servicio o número FS.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <AKButton href="/nuevo-pedido"><Sparkles size={18} /> New Job</AKButton>
              <AKButton href="/garage" variant="ghost"><Archive size={18} /> Mi Garaje</AKButton>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
          <LibStat label="ORI" value={stats.ori} helper="Archivos originales" icon={Database} glow="rgba(255,66,90,.14)" valueClass="" />
          <LibStat label="MOD" value={stats.mod} helper="Archivos modificados" icon={DownloadCloud} glow="rgba(52,211,153,.14)" valueClass="text-emerald-300" />
          <LibStat label="ECU" value={stats.ecus} helper="Familias identificadas" icon={ShieldCheck} glow="rgba(34,211,238,.14)" valueClass="" />
          <LibStat label="Vehículos" value={stats.vehiculos} helper="Historial agrupado" icon={Archive} glow="rgba(168,85,247,.14)" valueClass="" />
        </section>

        <section className="grid gap-6 2xl:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <div className="ak5-card p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                  <Search size={18} className="text-white/35" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Buscar ORI, MOD, ECU, HW, SW, vehículo, servicio..."
                    className="w-full bg-transparent text-sm outline-none placeholder:text-white/25"
                  />
                </div>

                <div className="flex gap-2">
                  {filters.map((item) => (
                    <button
                      key={item}
                      onClick={() => setFilter(item)}
                      className={`rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-[0.16em] transition ${filter === item ? 'border-red-400/50 bg-red-400/15 text-white shadow-lg shadow-red-950/20' : 'border-white/10 bg-white/[0.035] text-white/35 hover:text-white'}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="ak5-card p-10 text-center text-white/35">Cargando biblioteca técnica...</div>
            ) : filtered.length === 0 ? (
              <div className="ak5-card p-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-400/12 text-red-300"><Filter size={28} /></div>
                <h2 className="mt-5 text-2xl font-black">Sin resultados</h2>
                <p className="mt-2 text-sm text-white/35">No encontramos archivos con esos filtros. Prueba con ECU, HW, matrícula o servicio.</p>
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {filtered.map((archivo) => <AKLibraryFileCard key={archivo.id} archivo={archivo} />)}
              </div>
            )}
          </div>

          <aside className="space-y-5">
            <div className="ak5-card relative overflow-hidden p-6">
              <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-red-400/18 blur-3xl" />
              <div className="relative">
                <p className="ak5-kicker text-red-300">Smart filters</p>
                <h2 className="mt-2 text-2xl font-black">Búsqueda rápida</h2>
                <p className="mt-2 text-sm leading-6 text-white/35">Pulsa una etiqueta para filtrar tu biblioteca técnica privada.</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {tags.length === 0 ? (
                    ['EDC17', 'Bosch', 'Stage 1', 'DPF OFF', 'EGR OFF', 'ORI', 'MOD'].map((tag) => (
                      <button key={tag} onClick={() => setQuery(tag)} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black text-white/45 transition hover:border-red-400/35 hover:text-white">{tag}</button>
                    ))
                  ) : (
                    tags.map((tag) => (
                      <button key={tag} onClick={() => setQuery(tag)} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black text-white/45 transition hover:border-red-400/35 hover:text-white">{tag}</button>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="ak5-card relative overflow-hidden p-6">
              <div className="pointer-events-none absolute -left-14 -bottom-16 h-48 w-48 rounded-full" style={{background:'radial-gradient(circle,rgba(34,211,238,.1),transparent 70%)'}}/>
              <p className="relative ak5-kicker text-cyan-300">AK Cloud Vault</p>
              <h2 className="relative mt-2 text-2xl font-black">Tu historial siempre guardado</h2>
              <p className="relative mt-3 text-sm leading-7 text-white/38">
                Cada pedido finalizado queda archivado con ORI, MOD, servicios, ECU, HW y SW. Así puedes recuperar cualquier archivo sin pedirlo de nuevo.
              </p>
              <Link href="/pedidos" className="relative mt-5 inline-flex items-center text-sm font-black text-red-300">Ver pedidos →</Link>
            </div>
          </aside>
        </section>
      </div>
    </AppShell>
  )
}

function LibStat({ label, value, helper, icon: Icon, glow, valueClass }: { label: string; value: number; helper: string; icon: any; glow: string; valueClass: string }) {
  return (
    <div className="ak5-card relative overflow-hidden rounded-[22px] p-5">
      <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full" style={{ background: `radial-gradient(circle,${glow},transparent 70%)` }} />
      <div className="relative flex items-center justify-between text-white/35"><span className="text-xs font-black uppercase tracking-[0.2em]">{label}</span><Icon size={20} /></div>
      <div className={`relative mt-3 text-4xl font-black ${valueClass}`}>{value}</div>
      <p className="relative mt-1 text-sm text-white/35">{helper}</p>
    </div>
  )
}
