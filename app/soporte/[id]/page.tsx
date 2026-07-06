'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, Clock, Headphones, Send, Ticket } from 'lucide-react'
import AppShell from '@/components/AppShell'
import { enviarMensajeTicket, estadoTicketColor, estadoTicketLabel, getMensajesTicket, getTicketSoporte, prioridadTicketColor, type AkCloudTicket, type AkCloudTicketMensaje } from '@/lib/services/soporte'

function formatDate(value?: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(value))
}

export default function TicketDetallePage({ params }: { params: { id: string } }) {
  const [ticket, setTicket] = useState<AkCloudTicket | null>(null)
  const [mensajes, setMensajes] = useState<AkCloudTicketMensaje[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const [ticketData, mensajesData] = await Promise.all([
        getTicketSoporte(params.id),
        getMensajesTicket(params.id),
      ])
      setTicket(ticketData)
      setMensajes(mensajesData)
    } catch (error: any) {
      toast.error(error?.message || 'No se pudo cargar el ticket')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [params.id])

  async function send() {
    if (!message.trim()) return
    setSending(true)
    try {
      const saved = await enviarMensajeTicket(params.id, message.trim())
      setMensajes(prev => [...prev, saved])
      setMessage('')
      toast.success('Mensaje enviado')
    } catch (error: any) {
      toast.error(error?.message || 'No se pudo enviar')
    } finally {
      setSending(false)
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <Link href="/soporte" className="inline-flex items-center gap-2 text-sm font-black text-zinc-400 hover:text-white">
          <ArrowLeft size={16} /> Volver a soporte
        </Link>

        {loading ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-8 text-zinc-500">Cargando ticket...</div>
        ) : !ticket ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-8 text-zinc-500">Ticket no encontrado.</div>
        ) : (
          <>
            <section className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,.25),transparent_35%),rgba(255,255,255,.035)] p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black text-zinc-300"><Ticket size={14} /> {ticket.numero}</span>
                    <span className={`rounded-full border px-3 py-1 text-xs font-black ${estadoTicketColor(ticket.estado)}`}>{estadoTicketLabel(ticket.estado)}</span>
                    <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase ${prioridadTicketColor(ticket.prioridad)}`}>{ticket.prioridad || 'normal'}</span>
                  </div>
                  <h1 className="text-3xl font-black tracking-tight md:text-4xl">{ticket.asunto}</h1>
                  <p className="mt-2 text-zinc-500">{ticket.categoria || 'Soporte técnico'} · Creado {formatDate(ticket.created_at)}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/25 p-4 text-sm text-zinc-400">
                  <div className="mb-2 flex items-center gap-2 font-black text-white"><Clock size={16} /> SLA</div>
                  Respuesta habitual en horario laboral.
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1fr_330px]">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5">
                <div className="mb-5 flex items-center gap-2">
                  <Headphones className="text-red-300" size={20} />
                  <h2 className="text-xl font-black">Conversación</h2>
                </div>

                <div className="space-y-3">
                  {mensajes.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 p-8 text-center text-zinc-500">Todavía no hay mensajes.</div>
                  ) : mensajes.map(msg => {
                    const isClient = msg.remitente !== 'autokeys'
                    return (
                      <div key={msg.id} className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[78%] rounded-3xl border p-4 ${isClient ? 'border-red-500/25 bg-red-600/15' : 'border-white/10 bg-black/30'}`}>
                          <div className="mb-1 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">{isClient ? 'Tú' : 'Autokeys'}</div>
                          <p className="whitespace-pre-wrap text-sm text-zinc-200">{msg.mensaje}</p>
                          <div className="mt-2 text-[11px] font-bold text-zinc-600">{formatDate(msg.created_at)}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {ticket.estado !== 'cerrado' && (
                  <div className="mt-5 flex gap-3 rounded-3xl border border-white/10 bg-black/25 p-3">
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Escribe tu respuesta..." className="h-20 flex-1 resize-none border-0 bg-transparent p-2 text-sm outline-none placeholder:text-zinc-600" />
                    <button onClick={send} disabled={sending || !message.trim()} className="self-end rounded-2xl bg-red-600 px-4 py-3 font-black text-white hover:bg-red-500 disabled:opacity-50">
                      <Send size={18} />
                    </button>
                  </div>
                )}
              </div>

              <aside className="space-y-4">
                <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5">
                  <h3 className="mb-3 font-black">Detalles</h3>
                  <div className="space-y-3 text-sm">
                    <Row label="Estado" value={estadoTicketLabel(ticket.estado)} />
                    <Row label="Prioridad" value={ticket.prioridad || 'normal'} />
                    <Row label="Categoría" value={ticket.categoria || '—'} />
                    <Row label="Pedido" value={ticket.pedido_id || '—'} />
                    <Row label="Actualizado" value={formatDate(ticket.updated_at)} />
                  </div>
                </div>
                <div className="rounded-[2rem] border border-red-500/20 bg-red-500/10 p-5">
                  <h3 className="font-black text-red-200">Consejo</h3>
                  <p className="mt-2 text-sm text-red-100/70">Para acelerar la respuesta, adjunta siempre número de pedido, ECU, HW/SW y qué necesitas revisar.</p>
                </div>
              </aside>
            </section>
          </>
        )}
      </div>
    </AppShell>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2 last:border-0">
      <span className="text-zinc-500">{label}</span>
      <span className="font-bold text-zinc-200">{value}</span>
    </div>
  )
}
