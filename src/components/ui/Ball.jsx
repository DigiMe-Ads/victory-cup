// Classic black & white football in the Victory crest style.
export default function Ball({ className = 'size-10', color = '#13266e' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="29" fill="#fff" stroke={color} strokeWidth="4" />
      <polygon points="32,20 43,28 39,41 25,41 21,28" fill={color} />
      <g stroke={color} strokeWidth="3" strokeLinecap="round">
        <line x1="32" y1="20" x2="32" y2="5" />
        <line x1="43" y1="28" x2="58" y2="23" />
        <line x1="39" y1="41" x2="48" y2="55" />
        <line x1="25" y1="41" x2="16" y2="55" />
        <line x1="21" y1="28" x2="6" y2="23" />
      </g>
    </svg>
  )
}
