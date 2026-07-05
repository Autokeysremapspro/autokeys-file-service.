'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Bell, CheckCheck, ExternalLink, Loader2, Trash2 } from 'lucide-react'
import AKSidebar from '@/components/ak/AKSidebar'
import AKCard from '@/components/ak/AKCard'
import AKButton from '@/components/ak/AKButton'
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

  async function load() {
    setLoading(true)
    try {
      setItems(await getMisNotificaciones())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const unread = useMemo(() => items.filter((item) => !item.leida).length, [items])

  async function markAll() {
    await marcarTodasNotificacionesLeidas()
    await load()
  }

  async function read(id: string) {
    await marcarNotificacionLeida(id)
    await load()
  }

  async function remove(id: string) {
    await eliminarNotificacion(id)
    await load()
  }

  return (
    <main className="ak-noise flex min-h-screen">
      <AKSidebar />
      <section className="flex-1 p-4 lg:p-8">
        <header className="mb-7 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--ak-glow)]">Live Center</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">Notificaciones</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/40">Cambios de estado, mensajes de chat, archivos MOD listos y avisos importantes de AK Cloud.</p>
          </div>
          <AKButton onClick={markAll} variant="ghost"><CheckCheck size={18} /> Marcar todo leído</AKButton>
        </header>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <AKCard className="p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Total</p>
            <div className="mt-2 text-3xl font-black">{items.length}</div>
          </AKCard>
          <AKCard className="p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Sin leer</p>
            <div className="mt-2 text-3xl font-black text-[var(--ak-glow)]">{unread}</div>
          </AKCard>
          <AKCard className="p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Sistema</p>
            <div className="mt-2 text-3xl font-black">Realtime</div>
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
              {items.map((item) => (
                <div key={item.id} className={`rounded-[1.7rem] border p-5 ${item.leida ? 'border-white/10 bg-white/[0.025]' : notificacionTone(item.tipo)}`}>
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-black">{item.titulo}</h3>
                        {!item.leida && <span className="rounded-full bg-[var(--ak-red)] px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">Nuevo</span>}
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
                      {!item.leida && (
                        <button onClick={() => read(item.id)} className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-black text-white/60 transition hover:text-white">
                          <CheckCheck className="mr-2 inline" size={15} /> Leída
                        </button>
                      )}
                      <button onClick={() => remove(item.id)} className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-black text-red-300/75 transition hover:text-red-200">
                        <Trash2 className="mr-2 inline" size={15} /> Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AKCard>
      </section>
    </main>
  )
}
