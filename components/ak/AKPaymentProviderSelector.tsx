'use client'

import { useEffect, useState } from 'react'
import { CreditCard, WalletCards } from 'lucide-react'

type Provider = 'paypal' | 'sumup'

export default function AKPaymentProviderSelector() {
  const [provider, setProvider] = useState<Provider>('sumup')

  useEffect(() => {
    const stored = window.localStorage.getItem('ak-payment-provider')
    const initial: Provider = stored === 'paypal' ? 'paypal' : 'sumup'
    setProvider(initial)
    window.localStorage.setItem('ak-payment-provider', initial)
  }, [])

  useEffect(() => {
    window.localStorage.setItem('ak-payment-provider', provider)

    const updatePayButtonLabel = () => {
      const buttons = Array.from(document.querySelectorAll('button'))
      for (const button of buttons) {
        const text = button.textContent || ''
        if (/Pagar .* con PayPal/i.test(text)) {
          const amount = text.match(/Pagar\s+(.+?)\s+con PayPal/i)?.[1]
          if (amount) button.textContent = `Pagar ${amount} con ${provider === 'sumup' ? 'tarjeta / SumUp' : 'PayPal'}`
        }
      }
    }

    updatePayButtonLabel()
    const observer = new MutationObserver(updatePayButtonLabel)
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [provider])

  return (
    <div className="mx-auto mb-5 w-full max-w-[1480px] px-4 sm:px-6 lg:px-8">
      <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-4 backdrop-blur">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Método de pago</p>
            <p className="mt-1 text-sm text-white/65">Elige cómo quieres pagar este archivo.</p>
          </div>
          {provider === 'sumup' && <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-300">Recomendado</span>}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setProvider('sumup')}
            className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${provider === 'sumup' ? 'border-emerald-400/45 bg-emerald-400/10' : 'border-white/10 bg-white/[.02] hover:border-white/20'}`}
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300"><CreditCard size={21} /></span>
            <span><strong className="block text-white">Tarjeta · SumUp</strong><small className="text-white/45">Visa, Mastercard y wallets disponibles</small></span>
          </button>
          <button
            type="button"
            onClick={() => setProvider('paypal')}
            className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${provider === 'paypal' ? 'border-sky-400/45 bg-sky-400/10' : 'border-white/10 bg-white/[.02] hover:border-white/20'}`}
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-sky-400/10 text-sky-300"><WalletCards size={21} /></span>
            <span><strong className="block text-white">PayPal</strong><small className="text-white/45">Paga con tu cuenta PayPal</small></span>
          </button>
        </div>
      </div>
    </div>
  )
}
