export function Panel({ className = '', children }) {
  return (
    <section className={`rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-panel backdrop-blur ${className}`}>
      {children}
    </section>
  )
}
