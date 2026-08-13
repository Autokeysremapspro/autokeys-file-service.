'use client'

import { useEffect, useMemo, useState } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type ThemePreference = 'dark' | 'light' | 'system'
type ResolvedTheme = 'dark' | 'light'

const OPTIONS: Array<{ value: ThemePreference; label: string; icon: typeof Moon }> = [
  { value: 'dark', label: 'Oscuro', icon: Moon },
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'system', label: 'Sistema', icon: Monitor },
]

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference !== 'system') return preference
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export default function AKThemeSwitcher() {
  const [preference, setPreference] = useState<ThemePreference>('dark')
  const [userKey, setUserKey] = useState('akcloud:theme:guest')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    let active = true
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return
      const key = `akcloud:theme:${data.user?.id || 'guest'}`
      setUserKey(key)
      const saved = window.localStorage.getItem(key) as ThemePreference | null
      const next: ThemePreference = saved && ['dark', 'light', 'system'].includes(saved) ? saved : 'system'
      setPreference(next)
      document.documentElement.dataset.akTheme = resolveTheme(next)
      setMounted(true)
    })

    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!mounted) return
    const media = window.matchMedia('(prefers-color-scheme: light)')
    const apply = () => {
      const resolved = resolveTheme(preference)
      document.documentElement.dataset.akTheme = resolved
      document.documentElement.style.colorScheme = resolved
    }
    apply()
    if (preference === 'system') media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [preference, mounted])

  const activeOption = useMemo(() => OPTIONS.find(option => option.value === preference) || OPTIONS[0], [preference])
  const ActiveIcon = activeOption.icon

  const cycle = () => {
    const current = OPTIONS.findIndex(option => option.value === preference)
    const next = OPTIONS[(current + 1) % OPTIONS.length].value
    setPreference(next)
    window.localStorage.setItem(userKey, next)
  }

  if (!mounted) {
    return <div className="h-11 w-11 rounded-xl border border-white/10 bg-white/[.035]" aria-hidden="true" />
  }

  return (
    <button
      type="button"
      onClick={cycle}
      className="ak5-theme-toggle group relative grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[.035] text-white/65 transition hover:border-white/20 hover:text-white"
      aria-label={`Tema: ${activeOption.label}. Pulsa para cambiar.`}
      title={`Tema: ${activeOption.label}`}
    >
      <ActiveIcon size={18} />
      <span className="pointer-events-none absolute right-0 top-full z-50 mt-2 hidden whitespace-nowrap rounded-lg border border-white/10 bg-[#080c13]/95 px-2.5 py-1.5 text-[10px] font-bold text-white/70 shadow-xl group-hover:block">
        {activeOption.label}
      </span>
    </button>
  )
}
