'use client'

import { Check } from 'lucide-react'

type Props = {
  icon: string
  title: string
  price: number
  selected: boolean
  compatible?: boolean
  onClick: () => void
}

export default function ServiceCard({ icon, title, price, selected, compatible = true, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!compatible}
      className={`group relative rounded-3xl border p-4 text-left transition-all duration-200 ${
        selected
          ? 'border-red-500 bg-red-500/15 shadow-lg shadow-red-950/40 scale-[1.02]'
          : compatible
            ? 'border-white/10 bg-white/[0.04] hover:border-red-500/40 hover:bg-white/[0.07]'
            : 'border-white/5 bg-white/[0.02] opacity-45 cursor-not-allowed'
      }`}
    >
      {selected && (
        <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white">
          <Check size={14} />
        </span>
      )}
      <div className="text-3xl">{icon}</div>
      <div className="mt-3 font-black text-white">{title}</div>
      <div className="mt-1 text-sm text-zinc-400">{compatible ? 'Compatible' : 'No disponible'}</div>
      <div className="mt-3 text-lg font-black text-red-300">{price} €</div>
    </button>
  )
}
