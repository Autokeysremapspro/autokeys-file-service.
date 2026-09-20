'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Download, FileSearch, Loader2, LockKeyhole, ShieldCheck, UploadCloud, XCircle } from 'lucide-react'
import AKPageShell from '@/components/ak/AKPageShell'
import AKCard from '@/components/ak/AKCard'
import AKButton from '@/components/ak/AKButton'
import AKPaymentProviderSelector, { type PaymentProvider } from '@/components/ak/AKPaymentProviderSelector'
import { supabase } from '@/lib/supabase'

type Match = { id: string; name: string; service_code: string; service_name: string; ecu: string; hw: string | null; sw: string | null; vehicle_notes: string | null; price: number }
type PaidOrder = { id: string; amount: number; status: string; download_count: number; solution_snapshot: { service_name: string; ecu: string; mod_name: string }; created_at: string }

export default function AutomaticSolutionsClient() {
  const [file, setFile] = useState<File | null>(null)
  const [scanId, setScanId] = useState('')
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [provider, setProvider] = useState<PaymentProvider>('sumup')
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)
  const [error, setError] = useState('')
  const [orders, setOrders] = useState<PaidOrder[]>([])

  async function loadOrders() {
    const response = await fetch('/api/automatic-solutions/orders', { cache: 'no-store' })
    if (response.ok) setOrders((await response.json()).orders || [])
  }
  useEffect(() => { void loadOrders() }, [])

  async function analyze() {
    if (!file) return setError('Selecciona primero el archivo ORI.')
    setLoading(true)
    setError('')
    setMatches([])
    setSelectedId('')
    try {
      const prepareResponse = await fetch('/api/automatic-solutions/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileName: file.name, fileSize: file.size }) })
      const prepared = await prepareResponse.json()
      if (!prepareResponse.ok) throw new Error(prepared.error)
      const upload = await supabase.storage.from(prepared.upload.bucket).uploadToSignedUrl(prepared.upload.path, prepared.upload.token, file)
      if (upload.error) throw upload.error
      const matchResponse = await fetch('/api/automatic-solutions/match', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scanId: prepared.scan.id }) })
      const result = await matchResponse.json()
      if (!matchResponse.ok) throw new Error(result.error)
      setScanId(result.scanId)
      setMatches(result.solutions || [])
      setSelectedId(result.solutions?.[0]?.id || '')
      setAnalyzed(true)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo analizar el archivo')
    } finally {
      setLoading(false)
    }
  }

  async function checkout() {
    if (!selectedId) return setError('Selecciona una solución.')
    if (!accepted) return setError('Debes aceptar las condiciones antes de pagar.')
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/automatic-solutions/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scanId, solutionId: selectedId, paymentProvider: provider, legalAccepted: true }) })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error)
      window.location.href = payload.approveUrl
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo iniciar el pago')
      setLoading(false)
    }
  }

  async function download(orderId: string) {
    setError('')
    const response = await fetch(`/api/automatic-solutions/${orderId}/download`, { method: 'POST' })
    const payload = await response.json()
    if (!response.ok) return setError(payload.error)
    window.location.href = payload.url
    void loadOrders()
  }

  return (
    <AKPageShell title="Soluciones automáticas" subtitle="Comprueba tu ORI y compra una solución validada por 44,90 € cuando exista una coincidencia exacta." eyebrow="Acceso anticipado">
      <div className="grid gap-5 xl:grid-cols-[1fr_370px]">
        <div className="space-y-5">
          <AKCard className="p-5 md:p-6">
            <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-500/10 text-red-300"><FileSearch size={23}/></span><div><h2 className="text-xl font-black">Analizar archivo ORI</h2><p className="text-sm text-white/40">El análisis es gratuito. Solo pagas si hay una solución exacta.</p></div></div>
            <label className="mt-5 flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-black/20 p-6 text-center">
              <input type="file" accept=".bin,.ori,.hex,.mod" className="hidden" onChange={(event) => { setFile(event.target.files?.[0] || null); setAnalyzed(false); setMatches([]) }} />
              <UploadCloud size={36} className="text-red-300"/><strong className="mt-3">{file ? file.name : 'Seleccionar ORI'}</strong><span className="mt-1 text-xs text-white/35">BIN, ORI, HEX o MOD · máximo 64 MB</span>
            </label>
            <AKButton className="mt-4 w-full" onClick={analyze} disabled={loading || !file}>{loading ? <Loader2 size={18} className="animate-spin"/> : <FileSearch size={18}/>} {loading ? 'Comprobando coincidencia exacta...' : 'Comprobar solución gratis'}</AKButton>
          </AKCard>

          {analyzed && matches.length === 0 && <AKCard className="p-6"><div className="flex items-start gap-3"><XCircle className="mt-0.5 shrink-0 text-amber-300"/><div><h2 className="font-black">Todavía no existe una solución automática segura</h2><p className="mt-2 text-sm leading-6 text-white/45">No se ha realizado ningún cargo. Puedes enviar el archivo al laboratorio mediante Nuevo pedido para una revisión manual.</p><a href="/nuevo-pedido" className="mt-4 inline-flex rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold">Crear pedido manual</a></div></div></AKCard>}

          {matches.length > 0 && <AKCard className="p-6"><div className="flex items-center gap-3"><CheckCircle2 className="text-emerald-300"/><div><h2 className="font-black">Coincidencia exacta verificada</h2><p className="text-sm text-white/40">Elige la solución disponible para este ORI.</p></div></div><div className="mt-5 space-y-3">{matches.map((match) => <button type="button" key={match.id} onClick={() => setSelectedId(match.id)} className={`w-full rounded-2xl border p-4 text-left transition ${selectedId === match.id ? 'border-emerald-400/40 bg-emerald-400/[.08]' : 'border-white/10 bg-black/20'}`}><div className="flex items-start justify-between gap-3"><div><strong>{match.service_name}</strong><div className="mt-1 text-xs text-white/40">{match.ecu} · HW {match.hw || '—'} · SW {match.sw || '—'}</div></div><strong className="font-mono text-xl">44,90 €</strong></div></button>)}</div></AKCard>}

          {orders.length > 0 && <AKCard className="p-6"><h2 className="font-black">Mis soluciones compradas</h2><div className="mt-4 space-y-3">{orders.map((order) => <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-4"><div><strong>{order.solution_snapshot.service_name}</strong><div className="mt-1 text-xs text-white/40">{order.solution_snapshot.ecu} · {order.solution_snapshot.mod_name} · {order.download_count}/5 descargas</div></div><button onClick={() => download(order.id)} className="ak5-secondary !px-3 !py-2 text-xs"><Download size={15}/> Descargar</button></div>)}</div></AKCard>}
        </div>

        <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <AKCard className="p-5"><div className="flex items-center gap-2 text-emerald-300"><ShieldCheck size={18}/><strong className="text-sm">Entrega protegida</strong></div><ul className="mt-4 space-y-3 text-sm text-white/45"><li>Coincidencia por SHA‑256 y tamaño.</li><li>MOD verificado por el laboratorio.</li><li>Descarga privada tras confirmar el pago.</li><li>Hasta 5 descargas por compra.</li></ul></AKCard>
          {matches.length > 0 && <AKCard className="p-5"><div className="flex items-center justify-between"><span className="text-sm text-white/45">Pago único</span><strong className="font-mono text-3xl">44,90 €</strong></div><AKPaymentProviderSelector value={provider} onChange={setProvider}/><label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3 text-xs leading-5 text-white/55"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-1"/><span>Confirmo que el archivo es una lectura ORI válida y acepto las condiciones de uso profesional y la responsabilidad de comprobar el vehículo antes de escribir.</span></label><AKButton className="mt-4 w-full" onClick={checkout} disabled={loading || !accepted}><LockKeyhole size={17}/> Pagar 44,90 €</AKButton></AKCard>}
          {error && <div className="rounded-2xl border border-red-400/25 bg-red-400/[.07] p-4 text-sm text-red-100">{error}</div>}
        </aside>
      </div>
    </AKPageShell>
  )
}

