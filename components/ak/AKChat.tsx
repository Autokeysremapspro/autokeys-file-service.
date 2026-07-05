'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, MessageCircle, Send } from 'lucide-react'
import AKCard from '@/components/ak/AKCard'
import AKButton from '@/components/ak/AKButton'
import { supabase } from '@/lib/supabase'
import {
  enviarMensajePedido,
  formatChatDate,
  getMensajesPedido,
  type AutorTipo,
  type FileServiceMensaje,
} from '@/lib/services/chat'

type Props = {
  pedidoId: string
  autorTipo?: AutorTipo
  title?: string
  compact?: boolean
}

export default function AKChat({ pedidoId, autorTipo = 'cliente', title = 'Chat técnico', compact = false }: Props) {
  const [mensajes, setMensajes] = useState<FileServiceMensaje[]>([])
  const [texto, setTexto] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)

  const isAdmin = autorTipo === 'admin'

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      try {
        const data = await getMensajesPedido(pedidoId)
        if (mounted) setMensajes(data)
      } catch (error) {
        console.error(error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    const channel = supabase
      .channel(`file-service-chat-${pedidoId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'file_service_mensajes',
          filter: `pedido_id=eq.${pedidoId}`,
        },
        (payload) => {
          setMensajes((current) => {
            const next = payload.new as FileServiceMensaje
            if (current.some((item) => item.id === next.id)) return current
            return [...current, next]
          })
        }
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [pedidoId])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes.length])

  const emptyText = useMemo(() => {
    return isAdmin
      ? 'Todavía no hay mensajes. Escribe al distribuidor desde aquí.'
      : 'Todavía no hay mensajes. Puedes consultar cualquier duda sobre este pedido.'
  }, [isAdmin])

  async function send() {
    const clean = texto.trim()
    if (!clean) return

    setSending(true)
    try {
      const nuevo = await enviarMensajePedido(pedidoId, clean, autorTipo)
      setMensajes((current) => (current.some((item) => item.id === nuevo.id) ? current : [...current, nuevo]))
      setTexto('')
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : 'No se pudo enviar el mensaje')
    } finally {
      setSending(false)
    }
  }

  return (
    <AKCard className="overflow-hidden p-0">
      <div className="border-b border-white/10 bg-white/[0.025] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--ak-red)]/25 bg-[var(--ak-red)]/10 text-[var(--ak-glow)]">
            <MessageCircle size={21} />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">{title}</h3>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">
              {isAdmin ? 'Autokeys ↔ distribuidor' : 'Distribuidor ↔ Autokeys'}
            </p>
          </div>
        </div>
      </div>

      <div className={compact ? 'h-[300px] overflow-y-auto p-4' : 'h-[420px] overflow-y-auto p-5'}>
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm font-bold text-white/35">
            <Loader2 className="mr-2 animate-spin" size={18} /> Cargando mensajes...
          </div>
        ) : mensajes.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 p-6 text-center text-sm text-white/35">
            {emptyText}
          </div>
        ) : (
          <div className="space-y-3">
            {mensajes.map((mensaje) => {
              const mine = isAdmin ? mensaje.autor_tipo === 'admin' : mensaje.autor_tipo !== 'admin'
              return (
                <div key={mensaje.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[82%] rounded-[1.4rem] border px-4 py-3 ${
                      mine
                        ? 'border-[var(--ak-red)]/30 bg-[var(--ak-red)]/15 text-white'
                        : 'border-white/10 bg-white/[0.045] text-white/85'
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between gap-4 text-[11px] font-black uppercase tracking-[0.14em] text-white/35">
                      <span>{mensaje.autor_nombre || (mensaje.autor_tipo === 'admin' ? 'Autokeys' : 'Distribuidor')}</span>
                      <span>{formatChatDate(mensaje.created_at)}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{mensaje.mensaje}</p>
                  </div>
                </div>
              )
            })}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <div className="border-t border-white/10 bg-black/25 p-4">
        <div className="flex gap-3">
          <textarea
            value={texto}
            onChange={(event) => setTexto(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                send()
              }
            }}
            placeholder={isAdmin ? 'Responder al distribuidor...' : 'Escribe tu mensaje para Autokeys...'}
            rows={2}
            className="min-h-[54px] flex-1 resize-none rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--ak-red)]/45"
          />
          <AKButton onClick={send} disabled={sending || !texto.trim()} className="self-end">
            {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          </AKButton>
        </div>
      </div>
    </AKCard>
  )
}
