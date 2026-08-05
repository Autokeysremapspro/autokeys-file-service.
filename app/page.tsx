'use client'

import { useEffect, useMemo, useState } from 'react'
import { Download, FileArchive, Search } from 'lucide-react'
import AKPageShell from '@/components/ak/AKPageShell'
import AKCard from '@/components/ak/AKCard'
import AKButton from '@/components/ak/AKButton'
import { descargarArchivo, formatBytes, getMisPedidos, type FileServicePedido } from '@/lib/services/pedidos'

export default function DescargasPage() {
  const [pedidos, setPedidos] = useState<FileServicePedido[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMisPedidos().then(setPedidos).finally(() => setLoading(false))
  }, [])

  const files = useMemo(() => pedidos.filter((p) => p.mod_path && p.mod_bucket), [pedidos])
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return files
    return files.filter((p) => [p.numero, p.mod_nombre, p.ori_nombre, p.marca, p.modelo, p.ecu, p.hw, p.sw].some((v) => (v || '').toLowerCase().includes(q)))
  }, [files, query])

  async function download(pedido: FileServicePedido) {
    if (!pedido.mod_bucket || !pedido.mod_path) return
    const blob = await descargarArchivo(pedido.mod_bucket, pedido.mod_path)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = pedido.mod_nombre || `MOD-${pedido.numero || pedido.id}.bin`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AKPageShell title="Descargas" subtitle="Todos los archivos MOD terminados y listos para descargar." eyebrow="Library">
      <AKCard className="mb-6 p-4">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/45">
          <Search size={18} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por pedido, ECU, vehículo, HW, SW..." className="w-full bg-transparent outline-none placeholder:text-white/25" />
        </div>
      </AKCard>
      <AKCard className="overflow-hidden">
        {loading ? <div className="p-8 text-white/45">Cargando descargas...</div> : filtered.length === 0 ? <div className="p-8 text-white/45">Aún no tienes archivos MOD disponibles.</div> : (
          <div className="divide-y divide-white/10">
            {filtered.map((pedido) => (
              <div key={pedido.id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/10 text-red-300"><FileArchive size={24} /></div>
                  <div>
                    <div className="font-black text-white">{pedido.mod_nombre || 'Archivo MOD'}</div>
                    <div className="mt-1 text-sm text-white/40">{pedido.numero} · {[pedido.marca, pedido.modelo, pedido.motor].filter(Boolean).join(' ') || 'Vehículo sin datos'} · {pedido.ecu || 'ECU sin datos'} · {formatBytes(pedido.ori_size)}</div>
                  </div>
                </div>
                <AKButton onClick={() => download(pedido)}><Download size={18} /> Descargar</AKButton>
              </div>
            ))}
          </div>
        )}
      </AKCard>
    </AKPageShell>
  )
}
