import { FileArchive, UploadCloud } from 'lucide-react'

export default function AKUploader({ fileName, onFile, compact = false }: { fileName?: string | null; onFile: (file: File) => void; compact?: boolean }) {
  return (
    <label className={`group ak-card-hover relative flex cursor-pointer flex-col items-center justify-center rounded-[2.4rem] border border-dashed border-white/15 bg-[radial-gradient(circle_at_center,rgba(217,4,41,.22),transparent_45%),linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.025))] p-8 text-center ${compact ? 'min-h-[230px]' : 'min-h-[370px]'}`}>
      <input type="file" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) onFile(file) }} />
      <div className="absolute inset-4 rounded-[2rem] border border-white/5" />
      <div className="relative flex h-24 w-24 items-center justify-center rounded-[2rem] border border-[var(--ak-red)]/25 bg-[var(--ak-red)]/15 text-[var(--ak-glow)] shadow-[0_0_60px_rgba(217,4,41,.28)] transition group-hover:scale-105">
        {fileName ? <FileArchive size={40} /> : <UploadCloud size={42} />}
      </div>
      <h2 className="relative mt-7 text-3xl font-black tracking-tight md:text-4xl">{fileName ? 'File loaded' : 'Drop your ORI file'}</h2>
      <p className="relative mt-3 max-w-lg text-sm leading-6 text-white/40">{fileName ? 'AK Cloud is ready to analyse this file and prepare your order workspace.' : 'Drag your original ECU file here or tap to select. Fast mode takes less than 60 seconds.'}</p>
      {fileName && <div className="relative mt-6 rounded-full border border-[var(--ak-red)]/30 bg-[var(--ak-red)]/10 px-5 py-2 text-sm font-black text-[var(--ak-glow)]">{fileName}</div>}
    </label>
  )
}
