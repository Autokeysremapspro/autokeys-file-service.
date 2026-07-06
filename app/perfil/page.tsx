'use client'

import { useEffect, useState } from 'react'
import { Mail, ShieldCheck, UserCircle } from 'lucide-react'
import AKPageShell from '@/components/ak/AKPageShell'
import AKCard from '@/components/ak/AKCard'
import { supabase } from '@/lib/supabase'

export default function PerfilPage() {
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email || '')
      setUserId(data.user?.id || '')
    })
  }, [])

  return (
    <AKPageShell title="Mi cuenta" subtitle="Datos de acceso, seguridad y configuración del distribuidor." eyebrow="Account">
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <AKCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-red-500/25 bg-red-500/10 text-red-300"><UserCircle size={32} /></div>
            <div>
              <h2 className="text-2xl font-black">Distribuidor AK Cloud</h2>
              <p className="text-sm text-white/40">Cuenta conectada con Autokeys File Service.</p>
            </div>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            <Info icon={<Mail size={20} />} label="Email" value={email || '—'} />
            <Info icon={<ShieldCheck size={20} />} label="User ID" value={userId || '—'} />
          </div>
        </AKCard>
        <AKCard className="p-6">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">Seguridad</p>
          <h3 className="mt-2 text-2xl font-black">Acceso protegido</h3>
          <p className="mt-3 text-sm leading-6 text-white/45">Tus pedidos, archivos y créditos están protegidos mediante autenticación Supabase y almacenamiento seguro.</p>
        </AKCard>
      </div>
    </AKPageShell>
  )
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-3xl border border-white/10 bg-black/25 p-5"><div className="mb-3 text-red-300">{icon}</div><div className="text-xs font-black uppercase tracking-[0.2em] text-white/35">{label}</div><div className="mt-2 break-all text-lg font-black text-white">{value}</div></div>
}
