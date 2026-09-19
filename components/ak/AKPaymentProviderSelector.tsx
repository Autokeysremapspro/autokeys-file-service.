'use client'

import { CreditCard, WalletCards } from 'lucide-react'

export type PaymentProvider = 'paypal' | 'sumup'

export default function AKPaymentProviderSelector({ value, onChange }: { value: PaymentProvider; onChange: (provider: PaymentProvider) => void }) {
  return (
    <div className="mt-4 rounded-[1.35rem] border border-white/10 bg-black/25 p-3.5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/40">Método de pago</p>
          <p className="mt-1 text-xs text-white/55">Elige cómo quieres pagar este archivo.</p>
        </div>
        {value === 'sumup' && <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300">Recomendado</span>}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onChange('sumup')}
          className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition ${value === 'sumup' ? 'border-emerald-400/45 bg-emerald-400/10' : 'border-white/10 bg-white/[.02] hover:border-white/20'}`}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-400/10 text-emerald-300"><CreditCard size={18} /></span>
          <span><strong className="block text-sm text-white">Tarjeta · SumUp</strong><small className="text-[11px] text-white/40">Visa y Mastercard</small></span>
        </button>
        <button
          type="button"
          onClick={() => onChange('paypal')}
          className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition ${value === 'paypal' ? 'border-sky-400/45 bg-sky-400/10' : 'border-white/10 bg-white/[.02] hover:border-white/20'}`}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sky-400/10 text-sky-300"><WalletCards size={18} /></span>
          <span><strong className="block text-sm text-white">PayPal</strong><small className="text-[11px] text-white/40">Cuenta PayPal</small></span>
        </button>
      </div>
    </div>
  )
}
