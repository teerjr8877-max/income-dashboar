export function Panel({ className = '', children }) {
  return (
    <section
      className={`rounded-[28px] border border-slate-800/80 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(2,6,23,0.78))] p-4 shadow-panel backdrop-blur-xl sm:p-5 lg:p-6 ${className}`}
    >
      {children}
    </section>
  )
}
