'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import AKPageShell from '@/components/ak/AKPageShell'
import AKCard from '@/components/ak/AKCard'
import AKButton from '@/components/ak/AKButton'

export default function GarageError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Garage route error', error)
  }, [error])

  return (
    <AKPageShell
      title="Mis vehículos"
      subtitle="Tu historial técnico sigue protegido."
      eyebrow="Vehicle Workspace"
    >
      <AKCard className="mx-auto mt-8 max-w-2xl p-8 text-center md:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-400/12 text-amber-300">
          <AlertTriangle size={30} />
        </div>
        <h2 className="mt-5 text-2xl font-black">No se pudo abrir Mis vehículos</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/40">
          Ha ocurrido un error inesperado al mostrar el historial. Esto no elimina ni modifica tus pedidos, vehículos o archivos.
        </p>
        <div className="mt-6 flex justify-center">
          <AKButton onClick={reset}>
            <RefreshCw size={17} /> Reintentar
          </AKButton>
        </div>
      </AKCard>
    </AKPageShell>
  )
}
