'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { CreditCard, WalletCards } from 'lucide-react'

type Provider = 'paypal' | 'sumup'

function syncPaymentCopy(provider: Provider) {
  const buttons = Array.from(document.querySelectorAll('button'))
  const payButton = buttons.find((button) => /Pagar\s+.+€\s+con/i.test(button.textContent || ''))
  if (!payButton) return

  const text = payButton.textContent || ''
  const amount = text.match(/Pagar\s+(.+?)\s+con/i)?.[1]
  if (amount) {
    payButton.textContent = `Pagar ${amount} con ${provider === 'sumup' ? 'tarjeta / SumUp' : 'PayPal'}`
  }

  const helper = payButton.nextElementSibling
  if (helper instanceof HTMLElement) {
    helper.textContent = provider === 'sumup'
      ? 'Te llevaremos a SumUp para completar el pago seguro — el pedido se crea en cuanto se confirme.'
      : 'Te llevaremos a PayPal para completar el pago — el pedido se crea en cuanto se confirme.'
  }
}

export default function AKPaymentProviderSelector() {
  const [provider, setProvider] = useState<Provider>('sumup')
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const stored = window.localStorage.getItem('ak-payment-provider')
    const initial: Provider = stored === 'paypal' ? 'paypal' : 'sumup'
    setProvider(initial)
    window.localStorage.setItem('ak-payment-provider', initial)

    const id = window.requestAnimationFrame(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      const conditionsButton = buttons.find((button) => /Condiciones aceptadas|Debes aceptar las condiciones/i.test(button.textContent || ''))
      const payButton = buttons.find((button) => /Pagar\s+.+€\s+con/i.test(button.textContent || ''))
      const parent = conditionsButton?.parentElement

      if (parent && payButton && payButton.parentElement === parent) {
        let holder = document.getElementById('ak-payment-provider-slot')
        if (!holder) {
          holder = document.createElement('div')
          holder.id = 'ak-payment-provider-slot'
          parent.insertBefore(holder, payButton)
        }
        setMountNode(holder)
        syncPaymentCopy(initial)
      }
    })

    return () => window.cancelAnimationFrame(id)
  }, [])

  function choose(next: Provider) {
    setProvider(next)
    window.localStorage.setItem('ak-payment-provider', next)
    syncPaymentCopy(next)
  }

  if (!mountNode) return null

  return createPortal(
    <div className="mt-4 rounded-[1.35rem] border border-white/10 bg-black/25 p-3.5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/40">Método de pago</p>
          <p className="mt-1 text-xs text-white/55">Elige cómo quieres pagar este archivo.</p>
        </div>
        {provider === 'sumup' && <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300">Recomendado</span>}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => choose('sumup')}
          className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition ${provider === 'sumup' ? 'border-emerald-400/45 bg-emerald-400/10' : 'border-white/10 bg-white/[.02] hover:border-white/20'}`}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-400/10 text-emerald-300"><CreditCard size={18} /></span>
          <span><strong className="block text-sm text-white">Tarjeta · SumUp</strong><small className="text-[11px] text-white/40">Visa y Mastercard</small></span>
        </button>
        <button
          type="button"
          onClick={() => choose('paypal')}
          className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition ${provider === 'paypal' ? 'border-sky-400/45 bg-sky-400/10' : 'border-white/10 bg-white/[.02] hover:border-white/20'}`}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sky-400/10 text-sky-300"><WalletCards size={18} /></span>
          <span><strong className="block text-sm text-white">PayPal</strong><small className="text-[11px] text-white/40">Cuenta PayPal</small></span>
        </button>
      </div>
    </div>,
    mountNode,
  )
}
