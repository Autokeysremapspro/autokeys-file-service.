'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Monitor, Moon, Sun } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import './AKThemeSwitcher.css'

type ThemePreference = 'dark' | 'light' | 'system'
type ResolvedTheme = 'dark' | 'light'

const OPTIONS: Array<{ value: ThemePreference; label: string; icon: typeof Moon }> = [
  { value: 'dark', label: 'Oscuro', icon: Moon },
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'system', label: 'Sistema', icon: Monitor },
]

function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && ['dark', 'light', 'system'].includes(value)
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference !== 'system') return preference
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export default function AKThemeSwitcher() {
  const [preference, setPreference] = useState<ThemePreference>('dark')
  const [userKey, setUserKey] = useState('akcloud:theme:guest')
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return

      const user = data.user
      const key = `akcloud:theme:${user?.id || 'guest'}`
      setUserKey(key)

      const accountPreference = user?.user_metadata?.akcloud_theme
      const localPreference = window.localStorage.getItem(key)
      const next: ThemePreference = isThemePreference(accountPreference)
        ? accountPreference
        : isThemePreference(localPreference)
          ? localPreference
          : 'system'

      setPreference(next)
      window.localStorage.setItem(key, next)
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

  useEffect(() => {
    if (!open) return

    const closeOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', closeOutside)
    document.addEventListener('keydown', closeEscape)
    return () => {
      document.removeEventListener('mousedown', closeOutside)
      document.removeEventListener('keydown', closeEscape)
    }
  }, [open])

  const activeOption = useMemo(() => OPTIONS.find(option => option.value === preference) || OPTIONS[0], [preference])
  const ActiveIcon = activeOption.icon

  const selectTheme = async (next: ThemePreference) => {
    setPreference(next)
    setOpen(false)
    window.localStorage.setItem(userKey, next)

    const resolved = resolveTheme(next)
    document.documentElement.dataset.akTheme = resolved
    document.documentElement.style.colorScheme = resolved

    try {
      const { data } = await supabase.auth.getUser()
      if (!data.user) return

      const currentMetadata = data.user.user_metadata || {}
      const { error } = await supabase.auth.updateUser({
        data: { ...currentMetadata, akcloud_theme: next },
      })
      if (error) throw error
    } catch (error) {
      // El cambio local sigue funcionando aunque la sincronización de cuenta falle.
      console.error('No se pudo sincronizar la preferencia de tema', error)
    }
  }

  if (!mounted) {
    return <div className="h-11 w-11 rounded-xl border border-white/10 bg-white/[.035]" aria-hidden="true" />
  }

  return (
    <div ref={rootRef} className="ak5-theme-switcher-scope relative">
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className="ak5-theme-toggle group flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[.035] px-3 text-white/65 transition hover:border-white/20 hover:text-white"
        aria-label={`Tema: ${activeOption.label}. Abrir selector de tema.`}
        aria-haspopup="menu"
        aria-expanded={open}
        title={`Tema: ${activeOption.label}`}
      >
        <ActiveIcon size={18} />
        <span className="hidden text-xs font-bold sm:inline">{activeOption.label}</span>
        <ChevronDown size={14} className={`hidden transition-transform sm:block ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Seleccionar tema"
          className="absolute right-0 top-full z-[80] mt-2 w-44 overflow-hidden rounded-xl border border-white/10 bg-[#080c13]/95 p-1.5 shadow-2xl backdrop-blur-xl"
        >
          {OPTIONS.map(option => {
            const Icon = option.icon
            const selected = option.value === preference
            return (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => selectTheme(option.value)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-bold transition ${selected ? 'bg-white/[.08] text-white' : 'text-white/60 hover:bg-white/[.05] hover:text-white'}`}
              >
                <Icon size={16} />
                <span>{option.label}</span>
                {selected && <Check size={14} className="ml-auto text-cyan-300" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
