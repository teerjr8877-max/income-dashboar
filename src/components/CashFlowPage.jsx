import { cashFlowItems } from '../data/mockData'
import { Panel } from '../ui/Panel'

export function CashFlowPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Movement</p>
        <h2 className="mt-2 text-4xl font-semibold text-white">CashFlow</h2>
        <p className="mt-3 max-w-2xl text-slate-400">
          Review your inflows and outflows to keep investment velocity and lifestyle spending aligned.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cashFlowItems.map((item) => (
          <Panel key={item.label}>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{item.type}</p>
            <p className="mt-4 text-3xl font-semibold text-white">{item.amount}</p>
            <p className="mt-2 text-slate-300">{item.label}</p>
          </Panel>
        ))}
      </div>

      <Panel>
        <h3 className="text-xl font-semibold text-white">Monthly summary</h3>
        <p className="mt-3 text-slate-400">
          Cash flow analytics, recurring subscription monitoring, and category drill-downs can be connected here.
        </p>
      </Panel>
    </div>
  )
}
