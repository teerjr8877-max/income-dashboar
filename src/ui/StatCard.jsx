import { html } from '../lib/react.js'
import { Panel } from './Panel.jsx'

export function StatCard({ title, value, change, detail, tone = 'emerald' }) {
  const toneClasses = {
    emerald: 'bg-emerald-500/10 text-emerald-300',
    brand: 'bg-brand-500/10 text-brand-200',
    slate: 'bg-slate-800 text-slate-300',
  }

  return html`
    <${Panel} className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">${title}</h3>
        <span className=${`rounded-full px-3 py-1 text-[11px] font-semibold ${toneClasses[tone] ?? toneClasses.emerald}`}>
          ${change}
        </span>
      </div>
      <p className="text-2xl font-semibold text-white sm:text-3xl">${value}</p>
      <p className="text-sm leading-6 text-slate-400">${detail}</p>
    </${Panel}>
  `
}
