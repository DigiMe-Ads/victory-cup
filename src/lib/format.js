export function formatDate(date, opts = {}) {
  if (!date) return 'Date TBA'
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...opts,
  })
}

export function formatTime(time) {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  const suffix = h >= 12 ? 'pm' : 'am'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`
}

export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Readable text colour on top of a team colour.
export function contrastText(hex = '#13266e') {
  const c = hex.replace('#', '')
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#0b1747' : '#ffffff'
}

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export const TEAM_COLORS = [
  '#13266e', '#e3202e', '#1e6fd9', '#38bdf8', '#f5c518', '#16a34a',
  '#f97316', '#6d28d9', '#9f1239', '#14b8a6', '#111827', '#ec4899',
]

export const STATUS_LABEL = { upcoming: 'Upcoming', live: 'Live now', closed: 'Completed' }

export const SEGMENTS = [
  { id: 'mixed', label: 'Boys & Girls Mixed', short: 'Mixed' },
  { id: 'girls', label: 'Girls Only', short: 'Girls' },
]
