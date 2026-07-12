'use client'

import { useEffect } from 'react'
import Image from 'next/image'

// Tu API ID real de ecuperformance.net se configura como variable de entorno
// NEXT_PUBLIC_ECUPERFORMANCE_API_ID en Vercel — así no queda escrito en el
// código ni hay que tocar ningún archivo para cambiarlo.
const ECU_PERFORMANCE_API_ID = process.env.NEXT_PUBLIC_ECUPERFORMANCE_API_ID || ''

export default function CalculadoraEmbedPage() {
  useEffect(() => {
    // Configuración del widget — colores adaptados a la marca AK Cloud
    // (negro + rojo) en vez de los azules por defecto del proveedor.
    ;(window as any).$ecu = {
      lang: 'esp',
      width: '800',
      BackgroundColor: '#0b0d10',
      BoxColor: '#151922',
      FontColor: '#ffffff',
      ButtonColor: '#d90429',
      ButtonFontColor: '#ffffff',
      APIID: ECU_PERFORMANCE_API_ID,
    }

    const script = document.createElement('script')
    script.src = `https://ecuperformance.net/calculator/ecuob.js?_=${new Date().getTime()}`
    script.async = true
    document.body.appendChild(script)

    return () => {
      // Limpieza al salir de la página, evita duplicar el widget si se vuelve a entrar.
      document.body.removeChild(script)
      const container = document.getElementById('ecuCalculateTool')
      if (container) container.innerHTML = ''
    }
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#050505', padding: '28px 20px 40px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Image
            src="/images/login/autokeys-logo-wide.webp"
            alt="Autokeys"
            width={180}
            height={44}
            style={{ margin: '0 auto', height: 'auto', width: 160 }}
          />
          <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: '14px 0 4px' }}>
            Calculadora de potencia
          </h1>
        </div>

        {!ECU_PERFORMANCE_API_ID && (
          <div
            style={{
              border: '1px solid rgba(255,159,28,.3)',
              background: 'rgba(255,159,28,.08)',
              color: '#ffbb66',
              borderRadius: 14,
              padding: 14,
              fontSize: 13,
              marginBottom: 16,
              textAlign: 'center',
            }}
          >
            Falta tu API ID de ecuperformance.net — añádelo como variable de entorno{' '}
            <code>NEXT_PUBLIC_ECUPERFORMANCE_API_ID</code> en Vercel para que la calculadora muestre datos.
          </div>
        )}

        <div id="ecuCalculateTool" />
      </div>
    </div>
  )
}
