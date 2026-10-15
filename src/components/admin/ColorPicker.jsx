import { TEAM_COLORS } from '../../lib/format'

// Team colour: a preset swatch or any custom colour.
export default function ColorPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {TEAM_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          aria-label={`Colour ${c}`}
          className={`size-7 cursor-pointer rounded-full ring-offset-2 transition hover:scale-110 ${value === c ? 'ring-2 ring-navy' : ''}`}
          style={{ backgroundColor: c }}
        />
      ))}
      <label className="relative grid size-7 cursor-pointer place-items-center overflow-hidden rounded-full bg-[conic-gradient(red,yellow,lime,cyan,blue,magenta,red)]" title="Custom colour">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
          aria-label="Custom colour"
        />
      </label>
    </div>
  )
}
