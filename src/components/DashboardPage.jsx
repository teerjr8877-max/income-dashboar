import { summaryCards } from '../data/mockData'
import { Panel } from '../ui/Panel'
import { StatCard } from '../ui/StatCard'

export function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Overview</p>
        <h2 className="mt-2 text-4xl font-semibold text-white">Dashboard</h2>
        <p className="mt-3 max-w-2xl text-slate-400">
          Monitor total assets, passive income, and contribution progress across your financial system.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {summaryCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <Panel className="min-h-[320px] overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-white">Wealth Chart</h3>
            <p className="mt-2 text-sm text-slate-400">Placeholder for balance history, benchmark comparisons, and account growth analytics.</p>
          </div>
          <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
            Placeholder
          </span>
        </div>

        <div className="mt-8 grid h-[220px] place-items-center rounded-3xl border border-dashed border-brand-400/30 bg-gradient-to-br from-brand-500/10 via-slate-900 to-slate-950 text-center">
          <div>
            <p className="text-lg font-medium text-white">Interactive chart area</p>
            <p className="mt-2 text-sm text-slate-400">Connect charting or analytics libraries here in the next iteration.</p>
          </div>
        </div>
      </Panel>
    </div>
  )
}
