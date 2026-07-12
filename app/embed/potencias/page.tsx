'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Gauge, Search, Zap } from 'lucide-react'

type VehiculoPotencia = {
  id: string
  fabricante?: string | null
  ecu: string
  familia: string
  marcas?: string[] | null
  vehiculo?: string | null
  modelo?: string | null
  motor?: string | null
  potencia?: string | null
  par_nm?: string | null
  potencia_stage1?: string | null
  anios?: string | null
  pedidos_reales?: number
}

export default function PotenciasEmbedPage() {
  const [vehiculos, setVehiculos] = useState<VehiculoPotencia[]>([])
  const [loading, setLoading] = useState(true)
  const [marca, setMarca] = useState('')
  const [seleccionId, setSeleccionId] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/public/potencias')
        const payload = await res.json()
        setVehiculos(payload.vehiculos || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const marcas = useMemo(() => {
    const set = new Set<string>()
    vehiculos.forEach((v) => (v.marcas || []).forEach((m) => set.add(m)))
    return Array.from(set).sort()
  }, [vehiculos])

  const opciones = useMemo(() => {
    return vehiculos.filter((v) => {
      const matchesMarca = !marca || (v.marcas || []).includes(marca)
      const q = query.trim().toLowerCase()
      const text = [v.motor, v.vehiculo, v.modelo, v.ecu].filter(Boolean).join(' ').toLowerCase()
      return matchesMarca && (!q || text.includes(q))
    })
  }, [vehiculos, marca, query])

  const seleccion = useMemo(() => vehiculos.find((v) => v.id === seleccionId) || null, [vehiculos, seleccionId])

  return (
    <div className="ak-embed-root">
      <style>{`
        .ak-embed-root {
          --ak-black: #050505; --ak-red: #d90429; --ak-glow: #ff2448;
          --ak-green: #13d26a; --ak-orange: #ff9f1c; --ak-border: rgba(255,255,255,.1);
          min-height: 100vh; background: var(--ak-black); color: #fff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 28px 20px 40px;
        }
        .ak-embed-wrap { max-width: 640px; margin: 0 auto; }
        .ak-embed-head { text-align: center; margin-bottom: 24px; }
        .ak-embed-head h1 { font-size: 22px; font-weight: 800; margin: 14px 0 6px; }
        .ak-embed-head p { font-size: 13.5px; color: rgba(255,255,255,.5); }
        .ak-embed-card {
          border: 1px solid var(--ak-border); background: rgba(255,255,255,.03);
          border-radius: 18px; padding: 20px; margin-bottom: 16px;
        }
        .ak-embed-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
        .ak-embed-select, .ak-embed-input {
          width: 100%; padding: 11px 14px; border-radius: 11px; border: 1px solid var(--ak-border);
          background: rgba(0,0,0,.35); color: #fff; font-size: 13.5px; outline: none;
        }
        .ak-embed-select:focus, .ak-embed-input:focus { border-color: rgba(217,4,41,.5); }
        .ak-embed-list { max-height: 260px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; }
        .ak-embed-item {
          text-align: left; padding: 12px 14px; border-radius: 12px; border: 1px solid var(--ak-border);
          background: rgba(255,255,255,.02); cursor: pointer; font-size: 13px; color: rgba(255,255,255,.8);
        }
        .ak-embed-item:hover { border-color: rgba(255,36,72,.35); }
        .ak-embed-item.active { border-color: rgba(255,36,72,.55); background: rgba(217,4,41,.08); }
        .ak-embed-item .sub { color: rgba(255,255,255,.4); font-size: 11.5px; margin-top: 2px; }
        .ak-embed-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .ak-embed-stat { border: 1px solid var(--ak-border); border-radius: 14px; padding: 16px; text-align: center; }
        .ak-embed-stat.after { border-color: rgba(19,210,106,.3); background: rgba(19,210,106,.06); }
        .ak-embed-stat .l { font-size: 10.5px; text-transform: uppercase; letter-spacing: .06em; color: rgba(255,255,255,.4); }
        .ak-embed-stat .v { font-size: 24px; font-weight: 800; margin-top: 6px; }
        .ak-embed-stat.after .v { color: var(--ak-green); }
        .ak-embed-cta {
          display: block; text-align: center; margin-top: 16px; padding: 13px; border-radius: 12px;
          background: linear-gradient(135deg, var(--ak-red), var(--ak-glow)); color: #fff;
          font-weight: 800; font-size: 13.5px; text-transform: uppercase; text-decoration: none;
        }
        .ak-embed-footer { text-align: center; font-size: 11px; color: rgba(255,255,255,.3); margin-top: 18px; }
      `}</style>

      <div className="ak-embed-wrap">
        <div className="ak-embed-head">
          <Image src="/images/login/autokeys-logo-wide.webp" alt="Autokeys" width={180} height={44} style={{ margin: '0 auto', height: 'auto', width: 160 }} />
          <h1>Consulta potencia y par de tu vehículo</h1>
          <p>Elige tu marca y motor para ver la diferencia con Stage 1</p>
        </div>

        <div className="ak-embed-card">
          <div className="ak-embed-row">
            <select className="ak-embed-select" value={marca} onChange={(e) => { setMarca(e.target.value); setSeleccionId('') }}>
              <option value="">Todas las marcas</option>
              {marcas.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <div style={{ position: 'relative' }}>
              <input className="ak-embed-input" placeholder="Buscar motor..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>

          {loading ? (
            <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 13 }}>Cargando catálogo...</p>
          ) : (
            <div className="ak-embed-list">
              {opciones.length === 0 && <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 13 }}>Sin resultados.</p>}
              {opciones.map((v) => (
                <button
                  key={v.id}
                  className={`ak-embed-item ${seleccionId === v.id ? 'active' : ''}`}
                  onClick={() => setSeleccionId(v.id)}
                >
                  <div>{v.motor || v.vehiculo || v.ecu} {v.anios ? `· ${v.anios}` : ''}</div>
                  <div className="sub">
                    {(v.marcas || []).join(', ') || 'Varias marcas'} · {v.ecu}
                    {v.pedidos_reales ? ` · ${v.pedidos_reales} pedidos reales` : ''}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {seleccion && (
          <div className="ak-embed-card">
            {seleccion.pedidos_reales ? (
              <div style={{ textAlign: 'center', marginBottom: 12, fontSize: 12, color: 'var(--ak-green)' }}>
                ✓ Basado en {seleccion.pedidos_reales} pedido{seleccion.pedidos_reales === 1 ? '' : 's'} real{seleccion.pedidos_reales === 1 ? '' : 'es'} ya finalizado{seleccion.pedidos_reales === 1 ? '' : 's'}
              </div>
            ) : (
              <div style={{ textAlign: 'center', marginBottom: 12, fontSize: 11.5, color: 'rgba(255,255,255,.35)' }}>
                Datos de referencia — aún sin pedidos finalizados de esta familia
              </div>
            )}
            <div className="ak-embed-compare">
              <div className="ak-embed-stat">
                <div className="l"><Gauge size={13} style={{ display: 'inline', marginRight: 4 }} />Potencia origen</div>
                <div className="v">{seleccion.potencia || '—'}</div>
              </div>
              <div className="ak-embed-stat after">
                <div className="l"><Zap size={13} style={{ display: 'inline', marginRight: 4 }} />Potencia Stage 1</div>
                <div className="v">{seleccion.potencia_stage1 || 'Consultar'}</div>
              </div>
              <div className="ak-embed-stat">
                <div className="l">Par motor origen</div>
                <div className="v">{seleccion.par_nm || '—'}</div>
              </div>
              <div className="ak-embed-stat after">
                <div className="l">ECU</div>
                <div className="v" style={{ fontSize: 15 }}>{seleccion.ecu}</div>
              </div>
            </div>
            <a href="/register" target="_blank" className="ak-embed-cta">Solicitar Stage 1 para este vehículo</a>
          </div>
        )}

        <p className="ak-embed-footer">Datos orientativos AK Cloud · Autokeys — pueden variar según año y versión exacta</p>
      </div>
    </div>
  )
}
