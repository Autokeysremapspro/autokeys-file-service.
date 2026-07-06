'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowRight, Headphones, LifeBuoy, MessageSquarePlus, Search, ShieldCheck, Sparkles, Ticket, X } from 'lucide-react'
import AppShell from '@/components/AppShell'
import { crearTicketSoporte, estadoTicketColor, estadoTicketLabel, getTicketsSoporte, prioridadTicketColor, type AkCloudTicket, type TicketPrioridad } from '@/lib/services/soporte'

const categorias = [
  'Archivo / MOD',
  'Pago / créditos',
  'Pedido en curso',
  'Cuenta / acceso',
  'Soporte técnico',
  'Otro',
]

export default function SoportePage() {
  const [tickets, setTickets] = useState<AkCloudTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ asunto: '', categoria: 'Soporte técnico', prioridad: 'normal' as TicketPrioridad, descripcion: '', pedido_id: '' })

  async function load() {
    setLoading(true)
    try {
      setTickets(await getTicketsSoporte())
    } catch (error: any) {
      toast.error(error?.message || 'No se pudo cargar soporte')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tickets
    return tickets.filter(ticket => [
      ticket.numero,
      ticket.asunto,
      ticket.categoria,
      ticket.estado,
      ticket.prioridad,
      ticket.descripcion,
    ].some(value => (value || '').toLowerCase().includes(q)))
  }, [tickets, query])

  async function submitTicket() {
    if (!form.asunto.trim()) {
      toast.error('Escribe un asunto')
      return
    }
    if (!form.descripcion.trim()) {
      toast.error('Describe qué necesitas')
      return
    }

    setSaving(true)
    try {
      const ticket = await crearTicketSoporte({
        asunto: form.asunto.trim(),
        categoria: form.categoria,
        prioridad: form.prioridad,
        descripcion: form.descripcion.trim(),
        pedido_id: form.pedido_id.trim() || null,
      })
      toast.success('Ticket creado')
      setModalOpen(false)
      setForm({ asunto: '', categoria: 'Soporte técnico', prioridad: 'normal', descripcion: '', pedido_id: '' })
      await load()
      window.location.href = `/soporte/${ticket.id}`
    } catch (error: any) {
      toast.error(error?.message || 'No se pudo crear el ticket')
    } finally {
      setSaving(false)
    }
  }

  const abiertos = tickets.filter(t => t.estado !== 'cerrado').length
  const respondidos = tickets.filter(t => t.estado === 'respondido').length
  const urgentes = tickets.filter(t => t.prioridad === 'urgente' || t.prioridad === 'alta').length

  return (
    <AppShell>
      <div className="space-y-7">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,.28),transparent_35%),linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,.03))] p-6 shadow-2xl shadow-black/30 lg:p-8">
          <div className="absolute right-8 top-8 hidden h-32 w-32 rounded-full bg-red-600/15 blur-3xl md:block" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.24em] text-red-300">
                <Headphones size={15} /> AK Cloud Support
              </div>
              <h1 className="text-4xl font-black tracking-tight md:text-5xl">Centro de soporte</h1>
              <p className="mt-3 max-w-2xl text-zinc-400">Abre tickets por pedido, pagos, archivos o soporte técnico. Toda la conversación queda ordenada dentro de AK Cloud.</p>
            </div>
            <button onClick={() => setModalOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-4 text-sm font-black text-white shadow-xl shadow-red-950/30 hover:bg-red-500">
              <MessageSquarePlus size={18} /> Nuevo ticket
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard icon={<Ticket size={20} />} label="Tickets abiertos" value={abiertos} />
          <StatCard icon={<Sparkles size={20} />} label="Respondidos" value={respondidos} />
          <StatCard icon={<ShieldCheck size={20} />} label="Prioridad alta" value={urgentes} />
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-black">Mis tickets</h2>
              <p className="text-sm text-zinc-500">Historial de conversaciones con soporte Autokeys.</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 lg:w-[380px]">
              <Search size={18} className="text-zinc-500" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar ticket, estado, categoría..." className="w-full border-0 bg-transparent p-0 text-sm outline-none placeholder:text-zinc-600" />
            </div>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-black/20 p-8 text-zinc-500">Cargando soporte...</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 p-10 text-center">
              <LifeBuoy className="mx-auto mb-3 text-zinc-500" size={34} />
              <div className="font-black">No hay tickets todavía</div>
              <p className="mt-1 text-sm text-zinc-500">Crea el primer ticket para hablar con Autokeys.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filtered.map(ticket => (
                <Link key={ticket.id} href={`/soporte/${ticket.id}`} className="group rounded-3xl border border-white/10 bg-black/20 p-5 transition hover:-translate-y-0.5 hover:border-red-500/30 hover:bg-white/[0.05]">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black text-zinc-300">{ticket.numero}</span>
                        <span className={`rounded-full border px-3 py-1 text-xs font-black ${estadoTicketColor(ticket.estado)}`}>{estadoTicketLabel(ticket.estado)}</span>
                        <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase ${prioridadTicketColor(ticket.prioridad)}`}>{ticket.prioridad || 'normal'}</span>
                      </div>
                      <h3 className="text-lg font-black text-white">{ticket.asunto}</h3>
                      <p className="mt-1 line-clamp-1 text-sm text-zinc-500">{ticket.descripcion || ticket.categoria}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-black text-red-300">
                      Abrir <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xl">
          <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[#080b12] p-6 shadow-2xl shadow-black">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">Nuevo ticket</h2>
                <p className="text-sm text-zinc-500">Cuéntanos qué necesitas y quedará registrado.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 hover:bg-white/[0.08]"><X size={18} /></button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-zinc-300">Asunto</span>
                <input value={form.asunto} onChange={(e) => setForm(prev => ({ ...prev, asunto: e.target.value }))} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-red-500/50" placeholder="Ej. Problema con archivo MOD" />
              </label>
              <label>
                <span className="mb-2 block text-sm font-bold text-zinc-300">Categoría</span>
                <select value={form.categoria} onChange={(e) => setForm(prev => ({ ...prev, categoria: e.target.value }))} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-red-500/50">
                  {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label>
                <span className="mb-2 block text-sm font-bold text-zinc-300">Prioridad</span>
                <select value={form.prioridad} onChange={(e) => setForm(prev => ({ ...prev, prioridad: e.target.value as TicketPrioridad }))} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-red-500/50">
                  <option value="baja">Baja</option>
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </label>
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-zinc-300">ID pedido opcional</span>
                <input value={form.pedido_id} onChange={(e) => setForm(prev => ({ ...prev, pedido_id: e.target.value }))} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-red-500/50" placeholder="Pega aquí el ID si el ticket pertenece a un pedido" />
              </label>
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-zinc-300">Descripción</span>
                <textarea value={form.descripcion} onChange={(e) => setForm(prev => ({ ...prev, descripcion: e.target.value }))} className="h-32 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-red-500/50" placeholder="Explica el problema o consulta..." />
              </label>
            </div>

            <button onClick={submitTicket} disabled={saving} className="mt-5 w-full rounded-2xl bg-red-600 px-5 py-4 text-sm font-black text-white shadow-xl shadow-red-950/30 hover:bg-red-500 disabled:opacity-50">
              {saving ? 'Creando ticket...' : 'Crear ticket'}
            </button>
          </div>
        </div>
      )}
    </AppShell>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5">
      <div className="mb-4 flex items-center justify-between text-zinc-500">
        <span className="text-xs font-black uppercase tracking-[0.18em]">{label}</span>
        <span className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-red-300">{icon}</span>
      </div>
      <div className="text-3xl font-black">{value}</div>
    </div>
  )
}
