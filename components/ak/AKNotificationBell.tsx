'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Bell, CheckCheck, ExternalLink, Loader2, Trash2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import {
  eliminarNotificacion,
  formatNotificationDate,
  getMisNotificaciones,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
  notificacionTone,
  type FileServiceNotificacion,
} from '@/lib/services/notificaciones'

export default function AKNotificationBell() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<FileServiceNotificacion[]>([])

  async function load() {
    setLoading(true)
    try {
      setItems(await getMisNotificaciones())
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()

    const channel = supabase
      .channel('akcloud-notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'file_service_notificaciones' },
        () => load()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const unread = useMemo(() => items.filter((item) => !item.leida).length, [items])

  async function markAll() {
    await marcarTodasNotificacionesLeidas()
    await load()
  }

  async function remove(id: string) {
    await eliminarNotificacion(id)
    await load()
  }

  async function read(id: string) {
    await marcarNotificacionLeida(id)
    await load()
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] text-white/65 transition hover:border-[var(--ak-red)]/35 hover:text-white"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--ak-red)] px-1 text-[10px] font-black text-white shadow-[0_0_25px_rgba(217,4,41,.65)]">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#080808]/95 shadow-2xl shadow-black/60 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--ak-glow)]">AK Cloud</p>
              <h3 className="mt-1 text-lg font-black">Notificaciones</h3>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={markAll} className="rounded-xl border border-white/10 p-2 text-white/45 transition hover:text-white" title="Marcar todo leído">
                <CheckCheck size={18} />
              </button>
              <button onClick={() => setOpen(false)} className="rounded-xl border border-white/10 p-2 text-white/45 transition hover:text-white">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="max-h-[520px] overflow-auto p-3">
            {loading ? (
              <div className="flex items-center gap-2 p-6 text-sm text-white/45"><Loader2 className="animate-spin" size={17} /> Cargando...</div>
            ) : items.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-sm text-white/35">No tienes notificaciones todavía.</div>
            ) : (
              <div className="space-y-2">
                {items.slice(0, 8).map((item) => (
                  <div key={item.id} className={`rounded-3xl border p-4 ${item.leida ? 'border-white/10 bg-white/[0.025]' : notificacionTone(item.tipo)}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-black">{item.titulo}</div>
                        <div className="mt-1 text-xs leading-5 text-white/45">{item.mensaje || 'Sin detalles'}</div>
                        <div className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/25">{formatNotificationDate(item.created_at)}</div>
                      </div>
                      <div className="flex gap-1">
                        {!item.leida && (
                          <button onClick={() => read(item.id)} className="rounded-lg p-2 text-white/35 hover:bg-white/10 hover:text-white" title="Marcar leído">
                            <CheckCheck size={15} />
                          </button>
                        )}
                        <button onClick={() => remove(item.id)} className="rounded-lg p-2 text-white/35 hover:bg-white/10 hover:text-red-300" title="Eliminar">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {item.pedido_id && (
                      <Link href={`/pedidos/${item.pedido_id}`} className="mt-3 inline-flex items-center gap-2 text-xs font-black text-[var(--ak-glow)]">
                        Abrir pedido <ExternalLink size={13} />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-white/10 p-3">
            <Link href="/notificaciones" className="block rounded-2xl bg-white/[0.04] px-4 py-3 text-center text-sm font-black text-white/60 transition hover:bg-white/[0.07] hover:text-white">
              Ver centro de notificaciones
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
