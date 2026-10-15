import { useRef, useState } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { useToast } from '../../hooks/useToast'
import { uploadTeamLogo } from '../../lib/api'
import { isLightLogo } from '../../lib/logo'

// Big files are fine: they're trimmed and shrunk before upload.
const MAX_BYTES = 15 * 1024 * 1024

// Optional team logo: uploads straight to Storage and hands back the public URL.
export default function LogoPicker({ value, onChange, emptyLabel = 'Add logo (optional)' }) {
  const input = useRef(null)
  const [busy, setBusy] = useState(false)
  const toast = useToast()

  async function pick(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) return toast('Please choose an image file', 'error')
    if (file.size > MAX_BYTES) return toast('Logo must be under 15 MB', 'error')
    setBusy(true)
    try {
      onChange(await uploadTeamLogo(file))
    } catch (err) {
      const msg = err.message || 'Upload failed'
      toast(/row-level security|unauthorized/i.test(msg) ? 'Not allowed: please log in with an admin account' : msg, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-navy/15 px-3 py-1.5 text-sm font-bold text-navy/60 transition hover:border-navy hover:text-navy disabled:cursor-wait"
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : value ? (
          <img src={value} alt="" className={`size-5 rounded-full object-contain ${isLightLogo(value) ? 'bg-navy' : ''}`} />
        ) : (
          <ImagePlus className="size-4" />
        )}
        {busy ? 'Uploading…' : value ? 'Change logo' : emptyLabel}
      </button>
      {value && !busy && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="inline-flex cursor-pointer items-center gap-1 text-sm font-bold text-navy/50 hover:text-red"
        >
          <X className="size-4" /> Remove
        </button>
      )}
      <input ref={input} type="file" accept="image/*" className="hidden" onChange={pick} />
    </div>
  )
}
