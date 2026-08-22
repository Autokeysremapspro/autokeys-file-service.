import { Gauge, ShieldCheck, Users } from 'lucide-react'
import AuthFooter from './AuthFooter'

const benefits = [
  { icon: ShieldCheck, title: 'Seguro y confiable', text: 'Tus archivos siempre protegidos' },
  { icon: Gauge, title: 'Respuesta rápida', text: 'Procesamos tu solicitud lo antes posible' },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#020203] text-[#f4f4f5]">
      <div className="absolute inset-0">
        <img
          src="/images/marketing/auth-car-black.webp"
          alt=""
          className="h-full w-full object-cover object-[12%_50%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/25 to-black/85" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="flex flex-1 flex-col lg:flex-row">
          <div className="flex flex-col justify-center px-5 py-12 sm:px-8 lg:w-[58%] lg:px-14 xl:px-20">
            <a href="/" className="inline-block drop-shadow-[0_2px_10px_rgba(0,0,0,.85)]">
              <img
                src="/images/brand/ak-cloud-logo.webp"
                alt="AK Cloud by Autokeys Remaps Pro"
                className="h-auto w-[240px] max-w-full sm:w-[320px] lg:w-[390px]"
              />
            </a>

            <div className="mt-9 text-[16px] font-semibold uppercase tracking-[.08em] text-[#ef1018] [text-shadow:0_2px_10px_rgba(0,0,0,.9)]">
              Plataforma profesional
            </div>
            <h1 className="mt-3 font-bold leading-[1.12] text-white text-[clamp(34px,4vw,58px)] [text-shadow:0_2px_16px_rgba(0,0,0,.9)]">
              El portal profesional
              <br />
              de <span className="text-[#ef1018]">File Service</span>
            </h1>
            <p className="mt-5 max-w-[510px] text-[17px] leading-[1.65] text-[#a1a1a6] [text-shadow:0_2px_10px_rgba(0,0,0,.9)]">
              Sube tus archivos originales (ORI), solicita el servicio que necesitas y recibe tus archivos
              procesados de forma rápida, segura y centralizada.
            </p>

            <div className="mt-9 space-y-5 [text-shadow:0_2px_8px_rgba(0,0,0,.9)]">
              {benefits.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex items-start gap-3">
                  <Icon size={22} className="mt-0.5 shrink-0 text-[#ef1018]" />
                  <div>
                    <div className="font-semibold text-white">{title}</div>
                    <div className="text-sm text-[#92939a]">{text}</div>
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-3">
                <Users size={22} className="mt-0.5 shrink-0 text-[#ef1018]" />
                <div>
                  <div className="font-semibold text-white">Usuarios aprobados</div>
                  <div className="text-sm text-[#92939a]">
                    Calidad garantizada por <span className="text-[#ef1018]">Autokeys Remaps Pro</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center px-5 py-10 sm:px-8 lg:w-[42%] lg:px-10">
            {children}
          </div>
        </div>

        <AuthFooter />
      </div>
    </main>
  )
}
