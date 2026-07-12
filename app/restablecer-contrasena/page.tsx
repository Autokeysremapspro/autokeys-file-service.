'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ArrowRight, Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function RestablecerContrasenaPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [loading, setLoading] = useState(false)

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (password !== confirmar) {
      toast.error('Las dos contraseñas no coinciden')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Contraseña actualizada. Ya puedes iniciar sesión.')
    router.push('/login')
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030303] px-5 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_35%_45%,rgba(220,0,32,.18),transparent_34%)]" />
      <form
        onSubmit={guardar}
        className="relative w-full max-w-[460px] rounded-[34px] border border-white/15 bg-[#090b0f]/88 p-9 shadow-[0_40px_130px_rgba(0,0,0,.78)] backdrop-blur-2xl"
      >
        <img src="/images/brand/autokeys-logo-small-transparent.webp" alt="Autokeys" className="mx-auto mb-8 h-auto w-[180px]" />
        <h1 className="text-center text-3xl font-black tracking-[-0.03em]">Nueva contraseña</h1>
        <p className="mt-3 text-center text-sm text-zinc-400">Escribe tu nueva contraseña dos veces para confirmarla.</p>

        <div className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.28em] text-zinc-500">Nueva contraseña</span>
            <div className="flex h-14 items-center overflow-hidden rounded-xl border border-white/15 bg-black/25">
              <div className="grid h-full w-14 place-items-center border-r border-white/10 text-zinc-500"><Lock size={20} /></div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="h-full w-full border-0 bg-transparent px-4 text-white outline-none" />
            </div>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.28em] text-zinc-500">Confirmar contraseña</span>
            <div className="flex h-14 items-center overflow-hidden rounded-xl border border-white/15 bg-black/25">
              <div className="grid h-full w-14 place-items-center border-r border-white/10 text-zinc-500"><Lock size={20} /></div>
              <input type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} required minLength={8} className="h-full w-full border-0 bg-transparent px-4 text-white outline-none" />
            </div>
          </label>
        </div>

        <button
          disabled={loading}
          type="submit"
          className="mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#d90429] to-[#ff303d] text-sm font-black uppercase tracking-wide text-white shadow-[0_20px_60px_rgba(217,4,41,.30)] transition disabled:opacity-70"
        >
          {loading ? 'Guardando...' : 'Guardar contraseña'} <ArrowRight size={20} />
        </button>
      </form>
    </main>
  )
}
