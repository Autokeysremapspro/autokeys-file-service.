import { Lock } from 'lucide-react'

export default function AuthFooter() {
  return (
    <div className="relative z-10 border-t border-white/[.08] px-5 py-5 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-3 text-xs text-[#92939a] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5">
          <Lock size={15} className="mt-0.5 shrink-0 text-[#92939a]" />
          <p className="leading-relaxed">
            AK Cloud es una plataforma exclusiva para profesionales del sector automotriz.
            <br className="hidden sm:block" /> Nuevos usuarios requieren aprobación por{' '}
            <span className="text-[#ef1018]">Autokeys Remaps Pro.</span>
          </p>
        </div>
        <p className="shrink-0 sm:pl-4">© {new Date().getFullYear()} Autokeys Remaps Pro. Todos los derechos reservados.</p>
      </div>
    </div>
  )
}
