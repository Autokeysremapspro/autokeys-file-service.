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
        <h1 className="text-2xl font-black uppercase">Cuenta no disponible</h1>
        <p className="mt-3 text-sm leading-6 text-white/55">
          Esta cuenta está suspendida o bloqueada. Si se pausó porque nunca llegaste a utilizarla, cierra sesión y vuelve a entrar para reactivarla automáticamente. Si el problema continúa, contacta con soporte.
        </p>
        <button
          onClick={logout}
          className="mt-7 inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[.04] px-5 py-3 text-sm font-black uppercase hover:bg-white/[.08]"
        >
          <LogOut size={16} /> Cerrar sesión
        </button>
        <p className="mt-4 text-xs text-white/35">
          ¿Necesitas ayuda? <Link href="/soporte" className="text-red-300 underline">Contacta con soporte</Link>
        </p>
      </div>
    </main>
  )
}
