'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Bell, CheckCheck, ExternalLink, Loader2, ShieldCheck, Trash2 } from 'lucide-react'
import AppShell from '@/components/AppShell'
import AKCard from '@/components/ak/AKCard'
import AKButton from '@/components/ak/AKButton'
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

export default function NotificacionesPage() {
  const [items, setItems] = useState<FileServiceNotificacion[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      setItems(await getMisNotificaciones())
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    let active = true
    let channel: ReturnType<typeof supabase.channel> | null = null

    void supabase.auth.getUser().then(({ data }) => {
      if (!active || !data.user?.id) return
      const userId = data.user.id

      channel = supabase
        .channel(`akcloud-notifications-${userId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'file_service_notificaciones' },
          (payload) => {
            const row = (payload.new && Object.keys(payload.new).length ? payload.new : payload.old) as Partial<FileServiceNotificacion>
            if (row.user_id !== userId && row.user_id !== null) return
            void load(false)
          },
        )
        .subscribe()
    })

    return () => {
      active = false
      if (channel) void supabase.removeChannel(channel)
    }
  }, [load])

  const personalItems = useMemo(() => items.filter((item) => Boolean(item.user_id)), [items])
  const systemItems = useMemo(() => items.filter((item) => !item.user_id), [items])
  const unread = useMemo(() => personalItems.filter((item) => !item.leida).length, [personalItems])

  async function markAll() {
    await marcarTodasNotificacionesLeidas()
    await load(false)
  }

  async function read(id: string) {
    await marcarNotificacionLeida(id)
    await load(false)
  }

  async function remove(id: string) {
    await eliminarNotificacion(id)
    await load(false)
  }

  return (
    <AppShell>
      <section className="flex-1">
        <header className="mb-7 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--ak-glow)]">Live Center</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">Notificaciones</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/40">Cambios de estado, mensajes de chat, archivos MOD listos y avisos importantes de AK Cloud.</p>
          </div>
          <AKButton onClick={markAll} variant="ghost" disabled={unread === 0}><CheckCheck size={18} /> Marcar personales leídas</AKButton>
        </header>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <AKCard className="p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Total</p>
            <div className="mt-2 text-3xl font-black">{items.length}</div>
          </AKCard>
          <AKCard className="p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Personales sin leer</p>
            <div className="mt-2 text-3xl font-black text-[var(--ak-glow)]">{unread}</div>
          </AKCard>
          <AKCard className="p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Avisos de sistema</p>
            <div className="mt-2 text-3xl font-black">{systemItems.length}</div>
          </AKCard>
        </div>

        <AKCard className="p-5">
          {loading ? (
            <div className="flex items-center gap-2 p-8 text-white/45"><Loader2 className="animate-spin" size={18} /> Cargando notificaciones...</div>
          ) : items.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-white/10 p-10 text-center">
              <Bell className="mx-auto text-white/25" size={34} />
              <h2 className="mt-4 text-xl font-black">No hay notificaciones</h2>
              <p className="mt-2 text-sm text-white/35">Cuando cambie el estado de un pedido o llegue un mensaje aparecerá aquí.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const isSystem = !item.user_id
                return (
                  <div key={item.id} className={`rounded-[1.7rem] border p-5 ${isSystem ? 'border-blue-400/20 bg-blue-400/[0.07]' : item.leida ? 'border-white/10 bg-white/[0.025]' : notificacionTone(item.tipo)}`}>
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-black">{item.titulo}</h3>
                          {isSystem ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-blue-300/20 bg-blue-300/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-200"><ShieldCheck size={12} /> Sistema</span>
                          ) : !item.leida ? (
                            <span className="rounded-full bg-[var(--ak-red)] px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">Nuevo</span>
                          ) : null}
                        </div>
                        <p className="mt-2 text-sm text-white/45">{item.mensaje || 'Sin detalles'}</p>
                        <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-white/25">{formatNotificationDate(item.created_at)}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {item.pedido_id && (
                          <Link href={`/pedidos/${item.pedido_id}`} className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-black text-white/60 transition hover:border-[var(--ak-red)]/35 hover:text-white">
                            <ExternalLink className="mr-2 inline" size={15} /> Abrir pedido
                          </Link>
                        )}
                        {!isSystem && !item.leida && (
                          <button onClick={() => read(item.id)} className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-black text-white/60 transition hover:text-white">
                            <CheckCheck className="mr-2 inline" size={15} /> Leída
                          </button>
                        )}
                        {!isSystem && (
                          <button onClick={() => remove(item.id)} className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-black text-red-300/75 transition hover:text-red-200">
                            <Trash2 className="mr-2 inline" size={15} /> Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </AKCard>
      </section>
    </AppShell>
  )
}
