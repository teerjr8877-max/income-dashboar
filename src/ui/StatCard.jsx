import { Panel } from './Panel'

export function StatCard({ title, value, change, detail }) {
  return (
    <Panel className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">{title}</h3>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          {change}
        </span>
      </div>
      <p className="text-3xl font-semibold text-white">{value}</p>
      <p className="text-sm text-slate-400">{detail}</p>
    </Panel>
  )
}
