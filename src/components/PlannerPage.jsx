import { calculateHouseholdMetrics, formatCurrency, plannerTargets } from '../data/mockData'
import { Panel } from '../ui/Panel'

export function PlannerPage({ accounts = [] }) {
  const metrics = calculateHouseholdMetrics(accounts)
  const emergencyFundAccount = accounts.find((account) => account.accountName === 'Joint Savings')
  const emergencyFundAmount = emergencyFundAccount?.currentBalance ?? 0

  const retirementAccounts = accounts.filter((account) => account.type === 'Roth' || account.type === '401k')
  const retirementBalance = retirementAccounts.reduce((sum, account) => sum + account.currentBalance, 0)
  const retirementProgress = Math.min((retirementBalance / plannerTargets.retirementTarget) * 100, 100)

  const sinkingFundTargetAmount = plannerTargets.sinkingFundTarget
  const sinkingFundProgress = Math.min((emergencyFundAmount / sinkingFundTargetAmount) * 100, 100)

  const projectionYears = [1, 3, 5, 10]
  const monthlyContribution = metrics.monthlyContributions

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Plan</p>
        <h2 className="mt-2 text-4xl font-semibold text-white">Planner</h2>
        <p className="mt-3 max-w-2xl text-slate-400">
          Track household goal progress with live balances and a simple projection based on current assets plus recurring contributions.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <GoalCard
          title="Emergency fund amount"
          value={formatCurrency(emergencyFundAmount)}
          progress={Math.min((emergencyFundAmount / plannerTargets.emergencyFundTarget) * 100, 100)}
          note={`Target ${formatCurrency(plannerTargets.emergencyFundTarget)} held primarily in joint reserves.`}
        />
        <GoalCard
          title="Retirement target progress"
          value={`${retirementProgress.toFixed(1)}%`}
          progress={retirementProgress}
          note={`${formatCurrency(retirementBalance)} of ${formatCurrency(plannerTargets.retirementTarget)} retirement target funded.`}
        />
        <GoalCard
          title="Real estate / sinking fund target"
          value={`${sinkingFundProgress.toFixed(1)}%`}
          progress={sinkingFundProgress}
          note={`${formatCurrency(emergencyFundAmount)} of ${formatCurrency(sinkingFundTargetAmount)} reserved for real estate and sinking fund goals.`}
        />
      </div>

      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-white">Net worth projection</h3>
            <p className="mt-2 text-sm text-slate-400">
              Uses current assets, recurring monthly contributions, and a simple 5% annual growth assumption.
            </p>
          </div>
          <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
            Simple projection
          </span>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {projectionYears.map((years) => {
            const projectedValue = projectNetWorth(metrics.totalHouseholdNetWorth, monthlyContribution, plannerTargets.projectionAnnualReturn, years)
            return (
              <div key={years} className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">{years}-year outlook</p>
                <p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(projectedValue)}</p>
                <p className="mt-2 text-sm text-slate-400">
                  Starting from {formatCurrency(metrics.totalHouseholdNetWorth)} with {formatCurrency(monthlyContribution)}/mo contributions.
                </p>
              </div>
            )
          })}
        </div>
      </Panel>
    </div>
  )
}

function GoalCard({ title, value, progress, note }) {
  return (
    <Panel>
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-200">{value}</span>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-emerald-300" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-4 text-slate-300">{note}</p>
    </Panel>
  )
}

function projectNetWorth(currentAssets, monthlyContribution, annualReturnRate, years) {
  const monthlyRate = annualReturnRate / 12
  const totalMonths = years * 12
  const growthOnAssets = currentAssets * (1 + monthlyRate) ** totalMonths
  const growthOnContributions = monthlyContribution * (((1 + monthlyRate) ** totalMonths - 1) / monthlyRate)

  return growthOnAssets + growthOnContributions
}
