import { calculateGoalProgress, calculateHouseholdMetrics, formatCurrency } from '../data/householdModel'
import { Panel } from '../ui/Panel'

export function PlannerPage({ accounts = [], goals = [], setGoals, workspace }) {
  const metrics = calculateHouseholdMetrics(accounts)

  const updateGoal = (id, field, value) => {
    setGoals((current) => current.map((goal) => (goal.id === id ? { ...goal, [field]: field === 'title' ? value : Number(value) || 0, updatedAt: new Date().toISOString() } : goal)), 'Updated planner goal')
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Goals Engine</p>
        <h2 className="mt-2 text-4xl font-semibold text-white">Planner</h2>
        <p className="mt-3 max-w-3xl text-slate-400">Turn strategy into action with editable household goals, shared contribution schedules, and cross-device progress that stays in sync.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {goals.map((goal) => {
          const progress = calculateGoalProgress(goal)
          return (
            <Panel key={goal.id}>
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl font-semibold text-white">{goal.title}</h3>
                <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-200">{progress.toFixed(1)}%</span>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-emerald-300" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-5 space-y-3">
                <GoalInput label="Target amount" value={goal.targetAmount} onChange={(value) => updateGoal(goal.id, 'targetAmount', value)} />
                <GoalInput label="Current amount" value={goal.currentAmount} onChange={(value) => updateGoal(goal.id, 'currentAmount', value)} />
                <GoalInput label="Monthly contribution" value={goal.monthlyContribution} onChange={(value) => updateGoal(goal.id, 'monthlyContribution', value)} />
              </div>
              <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Goal summary</p>
                <p className="mt-2 text-sm text-slate-300">{formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)} funded with {formatCurrency(goal.monthlyContribution)}/mo going toward this goal.</p>
              </div>
            </Panel>
          )
        })}
      </div>

      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-white">Contribution schedules</h3>
            <p className="mt-2 text-sm text-slate-400">Shared recurring funding rules that support the same synced household plan on every device.</p>
          </div>
          <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">{workspace.contributionSchedules.length} schedules</span>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workspace.contributionSchedules.map((schedule) => (
            <div key={schedule.id} className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{schedule.ownerId} · {schedule.cadence}</p>
              <p className="mt-3 text-lg font-semibold text-white">{schedule.label}</p>
              <p className="mt-2 text-sm text-slate-400">Targets {schedule.targetType} {schedule.targetId}</p>
              <p className="mt-4 text-2xl font-semibold text-white">{formatCurrency(schedule.amount)}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-white">Household goals dashboard</h3>
            <p className="mt-2 text-sm text-slate-400">Quick roll-up of live household capacity against your current goal plan.</p>
          </div>
          <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">Live planner</span>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <RollupCard label="Household net worth" value={formatCurrency(metrics.totalHouseholdNetWorth)} />
          <RollupCard label="Invested assets" value={formatCurrency(metrics.totalInvestedAssets)} />
          <RollupCard label="Cash / savings" value={formatCurrency(metrics.totalCashSavings)} />
          <RollupCard label="Monthly contributions" value={formatCurrency(metrics.monthlyHouseholdContributions)} />
        </div>
      </Panel>
    </div>
  )
}

function GoalInput({ label, onChange, value }) {
  return (
    <label className="block space-y-2 text-sm text-slate-300">
      <span>{label}</span>
      <input type="number" step="0.01" value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-brand-400" />
    </label>
  )
}

function RollupCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
      <p className="text-sm uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    </div>
  )
}
