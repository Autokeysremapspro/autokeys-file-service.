'use client'

import Link from 'next/link'
import { ArrowRight, Cpu, Download, FileArchive, FileCode2, ShieldCheck } from 'lucide-react'
import type { BibliotecaArchivo } from '@/lib/services/biblioteca'
import { formatArchivoSize, formatBibliotecaDate, getSignedDownloadUrl } from '@/lib/services/biblioteca'

type Props = {
  archivo: BibliotecaArchivo
}

export default function AKLibraryFileCard({ archivo }: Props) {
  async function download() {
    try {
      const url = await getSignedDownloadUrl(archivo)
      window.open(url, '_blank')
    } catch (error: any) {
      alert(error?.message || 'No se pudo descargar el archivo')
    }
  }

  return (
    <article className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 transition hover:-translate-y-0.5 hover:border-[var(--ak-red)]/45 hover:bg-white/[0.055]">
      <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[var(--ak-red)]/12 blur-3xl transition group-hover:bg-[var(--ak-red)]/18" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${archivo.tipo === 'MOD' ? 'bg-[var(--ak-green)]/12 text-[var(--ak-green)]' : 'bg-[var(--ak-red)]/12 text-[var(--ak-glow)]'}`}>
            {archivo.tipo === 'MOD' ? <FileCode2 size={25} /> : <FileArchive size={25} />}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] ${archivo.tipo === 'MOD' ? 'border-[var(--ak-green)]/30 bg-[var(--ak-green)]/10 text-[var(--ak-green)]' : 'border-[var(--ak-red)]/30 bg-[var(--ak-red)]/10 text-[var(--ak-glow)]'}`}>
                {archivo.tipo}
              </span>
              <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-white/40">
                {archivo.pedido_numero || 'FS'}
              </span>
            </div>
            <h3 className="mt-3 truncate text-lg font-black text-white">{archivo.nombre}</h3>
            <p className="mt-1 text-sm text-white/35">
              {[archivo.marca, archivo.modelo, archivo.motor].filter(Boolean).join(' · ') || 'Vehículo pendiente'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-white/45">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/25 px-3 py-1"><Cpu size={13} /> {archivo.ecu || 'ECU —'}</span>
              <span className="rounded-full bg-black/25 px-3 py-1">HW {archivo.hw || '—'}</span>
              <span className="rounded-full bg-black/25 px-3 py-1">SW {archivo.sw || '—'}</span>
              <span className="rounded-full bg-black/25 px-3 py-1">{formatArchivoSize(archivo.size)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={download}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-white/55 transition hover:border-[var(--ak-red)]/35 hover:text-white"
          title="Descargar"
        >
          <Download size={18} />
        </button>
      </div>

      <div className="relative mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(archivo.servicios || []).slice(0, 4).map((servicio) => (
            <span key={servicio} className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-white/45">
              {servicio}
            </span>
          ))}
          {archivo.servicios.length === 0 && <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-white/35"><ShieldCheck size={12} /> Sin servicios</span>}
        </div>
        <Link href={`/biblioteca/${archivo.pedido_id}`} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[var(--ak-glow)]">
          Abrir trabajo <ArrowRight size={14} />
        </Link>
      </div>

      <div className="relative mt-3 text-xs text-white/25">Guardado: {formatBibliotecaDate(archivo.created_at)}</div>
    </article>
  )
}
