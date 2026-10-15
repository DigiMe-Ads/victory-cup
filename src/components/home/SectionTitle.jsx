export default function SectionTitle({ kicker, title, className = '' }) {
  return (
    <div className={`mb-6 ${className}`}>
      {kicker && <p className="font-cond text-sm font-bold tracking-[0.25em] text-red uppercase">{kicker}</p>}
      <h2 className="heading flex items-center gap-3 text-3xl text-navy sm:text-4xl">
        {title} <span className="streak" />
      </h2>
    </div>
  )
}
