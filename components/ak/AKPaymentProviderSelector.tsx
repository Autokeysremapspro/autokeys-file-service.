'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { CreditCard, WalletCards } from 'lucide-react'

type Provider = 'paypal' | 'sumup'

export default function AKPaymentProviderSelector() {
  const [provider, setProvider] = useState<Provider>('sumup')
  const [host, setHost] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const stored = window.localStorage.getItem('ak-payment-provider')
    const initial: Provider = stored === 'paypal' ? 'paypal' : 'sumup'
    setProvider(initial)
    window.localStorage.setItem('ak-payment-provider', initial)
  }, [])

  useEffect(() => {
    const mountIntoSummary = () => {
      if (document.getElementById('ak-payment-provider-host')) {
        setHost(document.getElementById('ak-payment-provider-host'))
        return true
      }

      const summaryLabel = Array.from(document.querySelectorAll('p')).find((el) => el.textContent?.trim() === 'Resumen')
      if (!summaryLabel) return false

      let card: HTMLElement | null = summaryLabel.parentElement
      while (card && !card.querySelector('textarea[placeholder="Observaciones para el técnico..."]')) {
        card = card.parentElement
      }
      if (!card) return false

      const buttons = Array.from(card.querySelectorAll('button'))
      const conditionsButton = buttons.find((button) => /Condiciones/i.test(button.textContent || ''))
      if (!conditionsButton) return false

      const nextHost = document.createElement('div')
      nextHost.id = 'ak-payment-provider-host'
      nextHost.className = 'mt-4'
      conditionsButton.insertAdjacentElement('afterend', nextHost)
      setHost(nextHost)
      return true
    }

    if (mountIntoSummary()) return
    const observer = new MutationObserver(() => mountIntoSummary())
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    window.localStorage.setItem('ak-payment-provider', provider)

    const updatePaymentCopy = () => {
      const buttons = Array.from(document.querySelectorAll('button'))
      for (const button of buttons) {
        const text = button.textContent || ''
        const match = text.match(/Pagar\s+(.+?)\s+con\s+(?:PayPal|tarjeta\s*\/\s*SumUp)/i)
        if (match) {
          button.textContent = `Pagar ${match[1]} con ${provider === 'sumup' ? 'tarjeta / SumUp' : 'PayPal'}`
        }
      }

      const paragraphs = Array.from(document.querySelectorAll('p'))
      const helper = paragraphs.find((p) => /Te llevaremos a (?:PayPal|SumUp)/i.test(p.textContent || ''))
      if (helper) {
        helper.textContent = provider === 'sumup'
          ? 'Te llevaremos a SumUp para completar el pago con tarjeta — el pedido se crea en cuanto se confirme.'
          : 'Te llevaremos a PayPal para completar el pago — el pedido se crea en cuanto se confirme.'
      }
    }

    updatePaymentCopy()
    const observer = new MutationObserver(updatePaymentCopy)
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [provider])

  if (!host) return null

  return createPortal(
    <div className="rounded-[1.35rem] border border-white/10 bg-black/25 p-4 backdrop-blur">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Método de pago</p>
          <p className="mt-1 text-xs text-white/50">Elige cómo quieres pagar este pedido.</p>
        </div>
        {provider === 'sumup' && <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300">Recomendado</span>}
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => setProvider('sumup')}
          className={`flex items-center gap-2.5 rounded-2xl border p-3 text-left transition ${provider === 'sumup' ? 'border-emerald-400/45 bg-emerald-400/10' : 'border-white/10 bg-white/[.02] hover:border-white/20'}`}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300"><CreditCard size={18} /></span>
          <span><strong className="block text-sm text-white">Tarjeta · SumUp</strong><small className="text-[10px] text-white/40">Visa y Mastercard</small></span>
        </button>
        <button
          type="button"
          onClick={() => setProvider('paypal')}
          className={`flex items-center gap-2.5 rounded-2xl border p-3 text-left transition ${provider === 'paypal' ? 'border-sky-400/45 bg-sky-400/10' : 'border-white/10 bg-white/[.02] hover:border-white/20'}`}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sky-400/10 text-sky-300"><WalletCards size={18} /></span>
          <span><strong className="block text-sm text-white">PayPal</strong><small className="text-[10px] text-white/40">Cuenta PayPal</small></span>
        </button>
      </div>
    </div>,
    host,
  )
}
