import { plannerMilestones } from '../data/mockData'
import { Panel } from '../ui/Panel'

export function PlannerPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Plan</p>
        <h2 className="mt-2 text-4xl font-semibold text-white">Planner</h2>
        <p className="mt-3 max-w-2xl text-slate-400">
          Track long-term milestones and coordinate capital allocation decisions around your major goals.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {plannerMilestones.map((milestone) => (
          <Panel key={milestone.title}>
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-semibold text-white">{milestone.title}</h3>
              <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-200">
                {milestone.target}
              </span>
            </div>
            <p className="mt-4 text-slate-300">{milestone.note}</p>
          </Panel>
        ))}
      </div>

      <Panel>
        <h3 className="text-xl font-semibold text-white">Scenario modeling</h3>
        <p className="mt-3 text-slate-400">
          Extend this page with Monte Carlo simulations, retirement projections, or capital deployment plans.
        </p>
      </Panel>
    </div>
  )
}
