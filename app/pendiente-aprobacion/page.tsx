'use client'

import Link from 'next/link'
import { Clock3, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function PendienteAprobacionPage() {
  const router = useRouter()

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-6 text-white">
      <div className="ak-glass w-full max-w-md rounded-[1.8rem] border border-white/10 p-8 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-300">
          <Clock3 size={26} />
        </div>
        <h1 className="text-2xl font-black uppercase">Solicitud en revisión</h1>
        <p className="mt-3 text-sm leading-6 text-white/55">
          Tu cuenta todavía no está activada como distribuidor AK Cloud. El equipo de Autokeys revisa cada
          solicitud manualmente — te avisaremos por email en cuanto esté aprobada.
        </p>
        <button
          onClick={logout}
          className="mt-7 inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[.04] px-5 py-3 text-sm font-black uppercase hover:bg-white/[.08]"
        >
          <LogOut size={16} /> Cerrar sesión
        </button>
        <p className="mt-4 text-xs text-white/35">
          ¿Ya tienes una cuenta aprobada con otro email? <Link href="/login" className="text-red-300 underline">Inicia sesión</Link>
        </p>
      </div>
    </main>
  )
}
