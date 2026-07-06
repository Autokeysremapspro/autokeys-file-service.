'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Archive, Database, DownloadCloud, Filter, Search, ShieldCheck, Sparkles } from 'lucide-react'
import AKSidebar from '@/components/ak/AKSidebar'
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
    <main className="ak-noise ak-grid flex min-h-screen overflow-hidden">
      <AKSidebar />

      <section className="relative z-10 flex-1 p-4 lg:p-8">
        <header className="mb-7 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.34em] text-[var(--ak-glow)]">Private Technical Library</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight md:text-6xl">Biblioteca</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/42">
              Toda tu nube privada de ORI, MOD y trabajos anteriores. Busca por ECU, HW, SW, vehículo, servicio o número FS.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <AKButton href="/nuevo-pedido"><Sparkles size={18} /> New Job</AKButton>
            <AKButton href="/garage" variant="ghost"><Archive size={18} /> Mi Garaje</AKButton>
          </div>
        </header>

        <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
          <AKCard className="p-5">
            <div className="flex items-center justify-between text-white/35"><span className="text-xs font-black uppercase tracking-[0.2em]">ORI</span><Database size={20} /></div>
            <div className="mt-3 text-4xl font-black">{stats.ori}</div>
            <p className="mt-1 text-sm text-white/35">Archivos originales</p>
          </AKCard>
          <AKCard className="p-5">
            <div className="flex items-center justify-between text-white/35"><span className="text-xs font-black uppercase tracking-[0.2em]">MOD</span><DownloadCloud size={20} /></div>
            <div className="mt-3 text-4xl font-black text-[var(--ak-green)]">{stats.mod}</div>
            <p className="mt-1 text-sm text-white/35">Archivos modificados</p>
          </AKCard>
          <AKCard className="p-5">
            <div className="flex items-center justify-between text-white/35"><span className="text-xs font-black uppercase tracking-[0.2em]">ECU</span><ShieldCheck size={20} /></div>
            <div className="mt-3 text-4xl font-black">{stats.ecus}</div>
            <p className="mt-1 text-sm text-white/35">Familias identificadas</p>
          </AKCard>
          <AKCard className="p-5">
            <div className="flex items-center justify-between text-white/35"><span className="text-xs font-black uppercase tracking-[0.2em]">Vehículos</span><Archive size={20} /></div>
            <div className="mt-3 text-4xl font-black">{stats.vehiculos}</div>
            <p className="mt-1 text-sm text-white/35">Historial agrupado</p>
          </AKCard>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <AKCard className="p-4">
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
                      className={`rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-[0.16em] transition ${filter === item ? 'border-[var(--ak-red)]/50 bg-[var(--ak-red)]/15 text-white shadow-lg shadow-red-950/20' : 'border-white/10 bg-white/[0.035] text-white/35 hover:text-white'}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </AKCard>

            {loading ? (
              <AKCard className="p-10 text-center text-white/35">Cargando biblioteca técnica...</AKCard>
            ) : filtered.length === 0 ? (
              <AKCard className="p-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--ak-red)]/12 text-[var(--ak-glow)]"><Filter size={28} /></div>
                <h2 className="mt-5 text-2xl font-black">Sin resultados</h2>
                <p className="mt-2 text-sm text-white/35">No encontramos archivos con esos filtros. Prueba con ECU, HW, matrícula o servicio.</p>
              </AKCard>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {filtered.map((archivo) => <AKLibraryFileCard key={archivo.id} archivo={archivo} />)}
              </div>
            )}
          </div>

          <aside className="space-y-5">
            <AKCard className="relative overflow-hidden p-6">
              <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-[var(--ak-red)]/18 blur-3xl" />
              <div className="relative">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Smart filters</p>
                <h2 className="mt-2 text-2xl font-black">Búsqueda rápida</h2>
                <p className="mt-2 text-sm leading-6 text-white/35">Pulsa una etiqueta para filtrar tu biblioteca técnica privada.</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {tags.length === 0 ? (
                    ['EDC17', 'Bosch', 'Stage 1', 'DPF OFF', 'EGR OFF', 'ORI', 'MOD'].map((tag) => (
                      <button key={tag} onClick={() => setQuery(tag)} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black text-white/45 transition hover:border-[var(--ak-red)]/35 hover:text-white">{tag}</button>
                    ))
                  ) : (
                    tags.map((tag) => (
                      <button key={tag} onClick={() => setQuery(tag)} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black text-white/45 transition hover:border-[var(--ak-red)]/35 hover:text-white">{tag}</button>
                    ))
                  )}
                </div>
              </div>
            </AKCard>

            <AKCard className="p-6">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--ak-glow)]">AK Cloud Vault</p>
              <h2 className="mt-2 text-2xl font-black">Tu historial siempre guardado</h2>
              <p className="mt-3 text-sm leading-7 text-white/38">
                Cada pedido finalizado queda archivado con ORI, MOD, servicios, ECU, HW y SW. Así puedes recuperar cualquier archivo sin pedirlo de nuevo.
              </p>
              <Link href="/pedidos" className="mt-5 inline-flex items-center text-sm font-black text-[var(--ak-glow)]">Ver pedidos →</Link>
            </AKCard>
          </aside>
        </section>
      </section>
    </main>
  )
}
