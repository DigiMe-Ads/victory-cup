import { contrastText, initials } from '../../lib/format'
import { isLightLogo } from '../../lib/logo'

const SIZES = {
  xs: 'size-7 text-[10px]',
  sm: 'size-9 text-xs',
  md: 'size-13 text-sm',
  lg: 'size-18 text-xl',
}

const RING = { xs: 3, sm: 3, md: 4, lg: 5 }

// Club logo framed by the team's own colour, so a club's A and B teams (same
// logo) still look different. Without a logo: initials on the team colour.
export default function TeamBadge({ team, size = 'md', className = '' }) {
  const color = team?.color || '#13266e'
  const logo = team?.logo ?? team?.logo_url
  const base = `grid shrink-0 place-items-center rounded-full font-bold shadow-sm ${SIZES[size]} ${className}`

  if (logo) {
    return (
      <span
        className={`${base} overflow-hidden ${isLightLogo(logo) ? 'bg-navy' : 'bg-white'}`}
        style={{ border: `${RING[size]}px solid ${color}` }}
        title={team.name}
      >
        <img src={logo} alt="" className="size-full object-contain p-[8%]" loading="lazy" />
      </span>
    )
  }

  return (
    <span className={base} style={{ backgroundColor: color, color: contrastText(color) }} title={team?.name}>
      {team ? initials(team.name) : '?'}
    </span>
  )
}

// Small colour swatch shown next to a team name.
export function ColorDot({ color, className = '' }) {
  return <span className={`inline-block size-2.5 shrink-0 rounded-full ring-1 ring-black/10 ${className}`} style={{ backgroundColor: color }} />
}
