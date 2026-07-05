import { UploadCloud } from 'lucide-react'

export default function AKUploader({ fileName, onFile }: { fileName?: string | null; onFile: (file: File) => void }) {
  return (
    <label className="group flex min-h-[310px] cursor-pointer flex-col items-center justify-center rounded-[2.2rem] border border-dashed border-white/15 bg-[radial-gradient(circle_at_center,rgba(217,4,41,.18),transparent_45%),rgba(255,255,255,.03)] p-8 text-center transition hover:border-[var(--ak-red)]/60 hover:bg-white/[0.045]">
      <input type="file" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) onFile(file) }} />
      <div className="flex h-20 w-20 items-center justify-center rounded-[1.8rem] bg-[var(--ak-red)]/15 text-[var(--ak-glow)] shadow-[0_0_50px_rgba(217,4,41,.22)] transition group-hover:scale-105">
        <UploadCloud size={36} />
      </div>
      <h2 className="mt-6 text-3xl font-black tracking-tight">Drop your ORI file</h2>
      <p className="mt-2 max-w-md text-sm text-white/38">Drag your original file here or tap to select. AK Cloud will prepare the technical analysis workspace.</p>
      {fileName && <div className="mt-5 rounded-full border border-[var(--ak-red)]/30 bg-[var(--ak-red)]/10 px-4 py-2 text-sm font-bold text-[var(--ak-glow)]">{fileName}</div>}
    </label>
  )
}
