'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowRight, Headphones, LifeBuoy, MessageSquarePlus, Search, ShieldCheck, Sparkles, Ticket, X } from 'lucide-react'
import AppShell from '@/components/AppShell'
import CustomSelect from '@/components/ak/CustomSelect'
import { crearTicketSoporte, estadoTicketColor, estadoTicketLabel, getTicketsSoporte, prioridadTicketColor, type AkCloudTicket, type TicketPrioridad } from '@/lib/services/soporte'

const categorias = [
  'Archivo / MOD',
  'Pago / facturación',
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
        <section className="ak5-card ak5-gridline relative overflow-hidden rounded-[28px] p-6 lg:p-8">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full" style={{background:'radial-gradient(circle,rgba(255,66,90,.14),transparent 70%)'}}/>
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="ak5-chip border-red-400/20 bg-red-400/10 text-red-300"><Headphones size={15} /> AK Cloud Support</span>
              <h1 className="ak5-title mt-4 text-4xl sm:text-5xl">Centro de soporte</h1>
              <p className="mt-3 max-w-2xl text-white/45">Abre tickets por pedido, pagos, archivos o soporte técnico. Toda la conversación queda ordenada dentro de AK Cloud.</p>
            </div>
            <button onClick={() => setModalOpen(true)} className="ak5-primary shrink-0">
              <MessageSquarePlus size={18} /> Nuevo ticket
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard icon={<Ticket size={20} />} label="Tickets abiertos" value={abiertos} glow="rgba(255,66,90,.14)" />
          <StatCard icon={<Sparkles size={20} />} label="Respondidos" value={respondidos} glow="rgba(52,211,153,.14)" />
          <StatCard icon={<ShieldCheck size={20} />} label="Prioridad alta" value={urgentes} glow="rgba(245,158,11,.14)" />
        </section>

        <section className="ak5-card rounded-[28px] p-5">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-black">Mis tickets</h2>
              <p className="text-sm text-white/35">Historial de conversaciones con soporte Autokeys.</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 lg:w-[380px]">
              <Search size={18} className="text-white/35" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar ticket, estado, categoría..." className="w-full border-0 bg-transparent p-0 text-sm outline-none placeholder:text-white/25" />
            </div>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-black/20 p-8 text-white/35">Cargando soporte...</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 p-10 text-center">
              <LifeBuoy className="mx-auto mb-3 text-white/35" size={34} />
              <div className="font-black">No hay tickets todavía</div>
              <p className="mt-1 text-sm text-white/35">Crea el primer ticket para hablar con Autokeys.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filtered.map(ticket => (
                <Link key={ticket.id} href={`/soporte/${ticket.id}`} className="group rounded-3xl border border-white/10 bg-black/20 p-5 transition hover:-translate-y-0.5 hover:border-red-400/30 hover:bg-white/[0.05]">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black text-white/70">{ticket.numero}</span>
                        <span className={`rounded-full border px-3 py-1 text-xs font-black ${estadoTicketColor(ticket.estado)}`}>{estadoTicketLabel(ticket.estado)}</span>
                        <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase ${prioridadTicketColor(ticket.prioridad)}`}>{ticket.prioridad || 'normal'}</span>
                      </div>
                      <h3 className="text-lg font-black text-white">{ticket.asunto}</h3>
                      <p className="mt-1 line-clamp-1 text-sm text-white/35">{ticket.descripcion || ticket.categoria}</p>
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
                <p className="text-sm text-white/35">Cuéntanos qué necesitas y quedará registrado.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 hover:bg-white/[0.08]"><X size={18} /></button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-white/70">Asunto</span>
                <input value={form.asunto} onChange={(e) => setForm(prev => ({ ...prev, asunto: e.target.value }))} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-red-400/50" placeholder="Ej. Problema con archivo MOD" />
              </label>
              <label>
                <span className="mb-2 block text-sm font-bold text-white/70">Categoría</span>
                <CustomSelect
                  value={form.categoria}
                  onChange={(v) => setForm(prev => ({ ...prev, categoria: v }))}
                  options={categorias.map(c => ({ value: c, label: c }))}
                />
              </label>
              <label>
                <span className="mb-2 block text-sm font-bold text-white/70">Prioridad</span>
                <CustomSelect
                  value={form.prioridad}
                  onChange={(v) => setForm(prev => ({ ...prev, prioridad: v as TicketPrioridad }))}
                  options={[
                    { value: 'baja', label: 'Baja' },
                    { value: 'normal', label: 'Normal' },
                    { value: 'alta', label: 'Alta' },
                    { value: 'urgente', label: 'Urgente' },
                  ]}
                />
              </label>
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-white/70">ID pedido opcional</span>
                <input value={form.pedido_id} onChange={(e) => setForm(prev => ({ ...prev, pedido_id: e.target.value }))} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-red-400/50" placeholder="Pega aquí el ID si el ticket pertenece a un pedido" />
              </label>
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-white/70">Descripción</span>
                <textarea value={form.descripcion} onChange={(e) => setForm(prev => ({ ...prev, descripcion: e.target.value }))} className="h-32 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-red-400/50" placeholder="Explica el problema o consulta..." />
              </label>
            </div>

            <button onClick={submitTicket} disabled={saving} className="ak5-primary mt-5 w-full">
              {saving ? 'Creando ticket...' : 'Crear ticket'}
            </button>
          </div>
        </div>
      )}
    </AppShell>
  )
}

function StatCard({ icon, label, value, glow }: { icon: React.ReactNode; label: string; value: number; glow: string }) {
  return (
    <div className="ak5-card relative overflow-hidden rounded-[22px] p-5">
      <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full" style={{ background: `radial-gradient(circle,${glow},transparent 70%)` }} />
      <div className="relative mb-4 flex items-center justify-between text-white/35">
        <span className="text-xs font-black uppercase tracking-[0.18em]">{label}</span>
        <span className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-red-300">{icon}</span>
      </div>
      <div className="relative text-3xl font-black">{value}</div>
    </div>
  )
}
