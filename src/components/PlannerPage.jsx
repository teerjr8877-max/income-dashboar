import { useEffect, useMemo, useState } from 'react'
import { calculateHouseholdMetrics, formatCurrency, formatCurrencyPrecise, formatPercent } from '../data/mockData'
import {
  calculateFireMetrics,
  calculateRetirementDistribution,
  createPlannerScenarios,
  FIRE_SIMULATION_COUNT,
  runMonteCarloSimulation,
} from '../lib/firePlanner'
import { Panel } from '../ui/Panel'

const scenarioNumericFields = [
  'startingPortfolio',
  'annualContribution',
  'monthlyPassiveIncome',
  'targetFireIncome',
  'expectedReturn',
  'volatility',
  'annualWithdrawalTarget',
  'inflationAssumption',
  'timeHorizon',
  'currentAge',
  'retirementAge',
  'passiveIncomeGrowth',
  'contributionGrowth',
  'simulationCount',
]

export function PlannerPage({ accounts = [], cashFlow, goals = [], setGoals, plannerScenarios = [], setPlannerScenarios }) {
  const metrics = calculateHouseholdMetrics(accounts)
  const [selectedScenarioId, setSelectedScenarioId] = useState(plannerScenarios[0]?.id ?? null)

  useEffect(() => {
    if (!plannerScenarios.length) {
      setPlannerScenarios(createPlannerScenarios(metrics, cashFlow))
      return
    }

    if (!plannerScenarios.some((scenario) => scenario.id === selectedScenarioId)) {
      setSelectedScenarioId(plannerScenarios[0]?.id ?? null)
    }
  }, [cashFlow, metrics, plannerScenarios, selectedScenarioId, setPlannerScenarios])

  const selectedScenario = useMemo(
    () => plannerScenarios.find((scenario) => scenario.id === selectedScenarioId) ?? plannerScenarios[0] ?? null,
    [plannerScenarios, selectedScenarioId],
  )

  const scenarioAnalytics = useMemo(
    () =>
      plannerScenarios.map((scenario) => {
        const simulation = runMonteCarloSimulation(scenario)
        const fireMetrics = calculateFireMetrics({ scenario, metrics })
        return {
          scenario,
          simulation,
          fireMetrics,
        }
      }),
    [metrics, plannerScenarios],
  )

  const activeAnalysis = scenarioAnalytics.find((entry) => entry.scenario.id === selectedScenario?.id) ?? scenarioAnalytics[0]
  const retirementDistribution = activeAnalysis ? calculateRetirementDistribution(activeAnalysis.scenario, activeAnalysis.simulation) : null

  const updateGoal = (id, field, value) => {
    setGoals((current) =>
      current.map((goal) => (goal.id === id ? { ...goal, [field]: field === 'title' ? value : Number(value) || 0 } : goal)),
    )
  }

  const updateScenario = (id, field, value) => {
    setPlannerScenarios((current) =>
      current.map((scenario) => {
        if (scenario.id !== id) return scenario
        const nextValue = scenarioNumericFields.includes(field) ? Number(value) || 0 : value
        const nextScenario = { ...scenario, [field]: nextValue }
        if (field === 'targetFireIncome') nextScenario.annualWithdrawalTarget = nextValue * 12
        if (field === 'annualWithdrawalTarget') nextScenario.targetFireIncome = nextValue / 12
        return nextScenario
      }),
    )
  }

  const addScenario = () => {
    const template = selectedScenario ?? createPlannerScenarios(metrics, cashFlow)[0]
    const nextScenario = { ...template, id: Date.now(), name: `${template.name} Copy` }
    setPlannerScenarios((current) => [...current, nextScenario])
    setSelectedScenarioId(nextScenario.id)
  }

  if (!activeAnalysis || !selectedScenario) {
    return <Panel><p className="text-sm text-slate-300">Loading planner…</p></Panel>
  }

  const { simulation, fireMetrics } = activeAnalysis

  const overviewCards = [
    { label: 'FIRE target', value: formatCurrency(fireMetrics.fireTarget), detail: '4% rule target after passive income offset' },
    { label: 'Current invested assets', value: formatCurrency(fireMetrics.currentInvestedAssets), detail: 'Live invested assets powering the plan' },
    { label: 'Current passive income', value: formatCurrencyPrecise(fireMetrics.annualPassiveIncome / 12), detail: `${formatCurrency(fireMetrics.annualPassiveIncome)} / year` },
    { label: 'Annual contribution', value: formatCurrency(selectedScenario.annualContribution), detail: 'Editable annual savings and investing' },
    { label: 'Expected return', value: formatPercent(selectedScenario.expectedReturn), detail: `Volatility ${formatPercent(selectedScenario.volatility)}` },
    { label: 'Withdrawal target', value: formatCurrency(selectedScenario.annualWithdrawalTarget), detail: `${formatCurrency(selectedScenario.targetFireIncome)} / month` },
    { label: 'Success probability', value: formatPercent(simulation.successProbability), detail: `${simulation.simulationCount} Monte Carlo runs` },
  ]

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Goals Engine</p>
        <h2 className="mt-2 text-4xl font-semibold text-white">Monte Carlo FIRE Planner</h2>
        <p className="mt-3 max-w-4xl text-slate-400">
          Turn WealthOS into a true household planning terminal with retirement scenario analysis, FIRE progress tracking,
          distribution modeling, and premium Monte Carlo projections that use your live portfolio income engine.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => (
          <PlannerMetricCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr,1.08fr]">
        <Panel>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-brand-300">Scenario Builder</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Household scenario modeling engine</h3>
              <p className="mt-2 text-sm text-slate-400">
                Save multiple cases and sync them through the current browser persistence layer. Cross-tab updates refresh automatically.
              </p>
            </div>
            <button
              type="button"
              onClick={addScenario}
              className="rounded-2xl border border-brand-400/30 bg-brand-500/10 px-4 py-2 text-sm font-semibold text-brand-100 transition hover:border-brand-300 hover:bg-brand-500/20"
            >
              Duplicate scenario
            </button>
          </div>

          <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
            {plannerScenarios.map((scenario) => {
              const isActive = scenario.id === selectedScenario.id
              return (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => setSelectedScenarioId(scenario.id)}
                  className={`min-w-[170px] rounded-2xl border px-4 py-3 text-left transition ${
                    isActive ? 'border-brand-300 bg-brand-500/15' : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <p className="font-semibold text-white">{scenario.name}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                    FI in {activeYearsToFiText(scenarioAnalytics.find((item) => item.scenario.id === scenario.id)?.fireMetrics.yearsToFi)}
                  </p>
                </button>
              )
            })}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Field label="Scenario name" value={selectedScenario.name} onChange={(value) => updateScenario(selectedScenario.id, 'name', value)} />
            <SelectField
              label="Income strategy"
              value={selectedScenario.incomeMode}
              options={[{ label: 'Reinvest income', value: 'reinvest' }, { label: 'Cash harvest', value: 'harvest' }]}
              onChange={(value) => updateScenario(selectedScenario.id, 'incomeMode', value)}
            />
            <Field label="Starting portfolio" type="number" value={selectedScenario.startingPortfolio} onChange={(value) => updateScenario(selectedScenario.id, 'startingPortfolio', value)} />
            <Field label="Annual contribution" type="number" value={selectedScenario.annualContribution} onChange={(value) => updateScenario(selectedScenario.id, 'annualContribution', value)} />
            <Field label="Monthly passive income" type="number" value={selectedScenario.monthlyPassiveIncome} onChange={(value) => updateScenario(selectedScenario.id, 'monthlyPassiveIncome', value)} />
            <Field label="Target FIRE income / month" type="number" value={selectedScenario.targetFireIncome} onChange={(value) => updateScenario(selectedScenario.id, 'targetFireIncome', value)} />
            <Field label="Annual withdrawal target" type="number" value={selectedScenario.annualWithdrawalTarget} onChange={(value) => updateScenario(selectedScenario.id, 'annualWithdrawalTarget', value)} />
            <Field label="Expected return %" type="number" step="0.1" value={selectedScenario.expectedReturn} onChange={(value) => updateScenario(selectedScenario.id, 'expectedReturn', value)} />
            <Field label="Volatility %" type="number" step="0.1" value={selectedScenario.volatility} onChange={(value) => updateScenario(selectedScenario.id, 'volatility', value)} />
            <Field label="Inflation %" type="number" step="0.1" value={selectedScenario.inflationAssumption} onChange={(value) => updateScenario(selectedScenario.id, 'inflationAssumption', value)} />
            <Field label="Passive income growth %" type="number" step="0.1" value={selectedScenario.passiveIncomeGrowth} onChange={(value) => updateScenario(selectedScenario.id, 'passiveIncomeGrowth', value)} />
            <Field label="Current age" type="number" value={selectedScenario.currentAge} onChange={(value) => updateScenario(selectedScenario.id, 'currentAge', value)} />
            <Field label="Retirement age" type="number" value={selectedScenario.retirementAge} onChange={(value) => updateScenario(selectedScenario.id, 'retirementAge', value)} />
            <Field label="Time horizon (years)" type="number" value={selectedScenario.timeHorizon} onChange={(value) => updateScenario(selectedScenario.id, 'timeHorizon', value)} />
            <Field label="Simulation count" type="number" value={selectedScenario.simulationCount} onChange={(value) => updateScenario(selectedScenario.id, 'simulationCount', value)} helper={`Minimum ${FIRE_SIMULATION_COUNT}`} />
          </div>
        </Panel>

        <Panel className="overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-brand-300">Monte Carlo Engine</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Probability-weighted trajectory bands</h3>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Browser-based simulation across contribution and withdrawal phases with passive income offsets, inflation-aware spending,
                and optimistic / pessimistic outcome bands.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <MetricPill label="Median ending" value={formatCurrency(simulation.medianEndingValue)} />
              <MetricPill label="Pessimistic" value={formatCurrency(simulation.pessimisticEndingValue)} />
              <MetricPill label="Optimistic" value={formatCurrency(simulation.optimisticEndingValue)} />
            </div>
          </div>

          <div className="mt-6 rounded-[2rem] border border-slate-800 bg-slate-950/70 p-4 sm:p-5">
            <TrajectoryChart trajectory={simulation.trajectory} retirementYear={simulation.retirementYear} />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ScenarioOutcomeCard title="Success probability" value={formatPercent(simulation.successProbability)} detail="Runs ending with capital remaining" />
            <ScenarioOutcomeCard title="Contribution phase" value={`${simulation.retirementYear} yrs`} detail={`Retire around age ${selectedScenario.retirementAge}`} />
            <ScenarioOutcomeCard title="Withdrawal phase" value={`${Math.max(selectedScenario.timeHorizon - simulation.retirementYear, 0)} yrs`} detail="Inflation-adjusted drawdown modeled" />
            <ScenarioOutcomeCard title="Passive income mode" value={selectedScenario.incomeMode === 'reinvest' ? 'Reinvest' : 'Harvest'} detail="Used in both accumulation and retirement math" />
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.04fr,0.96fr]">
        <Panel>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold text-white">FIRE progress + retirement metrics</h3>
              <p className="mt-2 text-sm text-slate-400">
                Coast FIRE, full FIRE, safe withdrawal coverage, and live income gap using current WealthOS household data.
              </p>
            </div>
            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
              FIRE metrics
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <ProgressCard label="Coast FIRE progress" value={formatPercent(fireMetrics.coastFireProgress)} progress={fireMetrics.coastFireProgress} detail={`Coast number ${formatCurrency(fireMetrics.coastFireNumber)}`} />
            <ProgressCard label="Full FIRE progress" value={formatPercent(fireMetrics.fullFireProgress)} progress={fireMetrics.fullFireProgress} detail={`Target ${formatCurrency(fireMetrics.fireTarget)}`} />
            <ProgressCard label="Years to FI" value={activeYearsToFiText(fireMetrics.yearsToFi)} progress={fireMetrics.yearsToFi === null ? 0 : Math.max(100 - fireMetrics.yearsToFi * 3, 5)} detail="Deterministic estimate with contributions + income growth" />
            <ProgressCard label="Safe withdrawal estimate" value={formatCurrency(fireMetrics.safeWithdrawalEstimate)} progress={(fireMetrics.safeWithdrawalEstimate / Math.max(fireMetrics.annualTargetIncome, 1)) * 100} detail={`${formatCurrency(fireMetrics.safeWithdrawalEstimate / 12)}/month from current assets`} />
            <ProgressCard label="Income gap to FI" value={formatCurrency(fireMetrics.incomeGap)} progress={fireMetrics.annualTargetIncome ? ((fireMetrics.annualTargetIncome - fireMetrics.incomeGap) / fireMetrics.annualTargetIncome) * 100 : 0} detail={`Target ${formatCurrency(fireMetrics.annualTargetIncome)} / yr`} />
            <ProgressCard label="Current passive offset" value={formatCurrency(fireMetrics.annualPassiveIncome)} progress={fireMetrics.annualTargetIncome ? (fireMetrics.annualPassiveIncome / fireMetrics.annualTargetIncome) * 100 : 0} detail="Portfolio income reducing required draw" />
          </div>
        </Panel>

        <Panel>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold text-white">Retirement distribution view</h3>
              <p className="mt-2 text-sm text-slate-400">
                Translate the scenario into expected income, required withdrawals, and the draw burden on principal at retirement.
              </p>
            </div>
            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
              Income strategy
            </span>
          </div>

          {retirementDistribution && (
            <div className="mt-6 space-y-4">
              <DistributionRow label="Expected monthly passive income" value={formatCurrencyPrecise(retirementDistribution.expectedMonthlyPassiveIncome)} detail="Projected forward using passive income growth assumption" />
              <DistributionRow label="Annual withdrawal need" value={formatCurrency(retirementDistribution.annualWithdrawalNeed)} detail="After passive income offsets retirement spending" />
              <DistributionRow label="Coverage ratio" value={formatPercent(retirementDistribution.coverageRatio)} detail="Passive income as a share of retirement need" />
              <DistributionRow label="Shortfall / surplus" value={formatCurrency(retirementDistribution.shortfallOrSurplus)} detail="Positive means passive income exceeds target spending" />
              <DistributionRow label="Estimated draw burden" value={formatPercent(retirementDistribution.drawBurden)} detail="Withdrawal need divided by median retirement portfolio" />
            </div>
          )}
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.02fr,0.98fr]">
        <Panel>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold text-white">Scenario comparison</h3>
              <p className="mt-2 text-sm text-slate-400">Compare years to FI, success probability, and ending values across every saved scenario.</p>
            </div>
            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
              Multi-scenario
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {scenarioAnalytics.map((entry) => (
              <ScenarioComparisonRow
                key={entry.scenario.id}
                label={entry.scenario.name}
                yearsToFi={entry.fireMetrics.yearsToFi}
                successProbability={entry.simulation.successProbability}
                endingValue={entry.simulation.medianEndingValue}
              />
            ))}
          </div>
        </Panel>

        <Panel>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold text-white">Household goals dashboard</h3>
              <p className="mt-2 text-sm text-slate-400">Editable wealth goals remain live alongside the new premium planner system.</p>
            </div>
            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
              Live planner
            </span>
          </div>

          <div className="mt-6 grid gap-4">
            {goals.map((goal) => {
              const progress = calculateGoalProgress(goal)
              return (
                <div key={goal.id} className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="text-lg font-semibold text-white">{goal.title}</h4>
                    <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-200">
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-emerald-300" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <Field label="Target amount" type="number" value={goal.targetAmount} onChange={(value) => updateGoal(goal.id, 'targetAmount', value)} />
                    <Field label="Current amount" type="number" value={goal.currentAmount} onChange={(value) => updateGoal(goal.id, 'currentAmount', value)} />
                    <Field label="Monthly contribution" type="number" value={goal.monthlyContribution} onChange={(value) => updateGoal(goal.id, 'monthlyContribution', value)} />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <RollupCard label="Household net worth" value={formatCurrency(metrics.totalHouseholdNetWorth)} />
            <RollupCard label="Invested assets" value={formatCurrency(metrics.totalInvestedAssets)} />
            <RollupCard label="Cash / savings" value={formatCurrency(metrics.totalCashSavings)} />
            <RollupCard label="Monthly contributions" value={formatCurrency(metrics.monthlyHouseholdContributions)} />
          </div>
        </Panel>
      </div>
    </div>
  )
}

function calculateGoalProgress(goal) {
  if (!goal.targetAmount) return 0
  return Math.min((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100, 100)
}

function activeYearsToFiText(years) {
  if (years === null) return '50y+'
  return `${years}y`
}

function PlannerMetricCard({ label, value, detail }) {
  return (
    <Panel className="space-y-3">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="text-3xl font-semibold text-white">{value}</p>
      <p className="text-sm text-slate-400">{detail}</p>
    </Panel>
  )
}

function Field({ helper, label, onChange, step = '0.01', type = 'text', value }) {
  return (
    <label className="space-y-2 text-sm text-slate-300">
      <span>{label}</span>
      <input
        type={type}
        step={type === 'number' ? step : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-brand-400"
      />
      {helper ? <p className="text-xs text-slate-500">{helper}</p> : null}
    </label>
  )
}

function SelectField({ label, onChange, options, value }) {
  return (
    <label className="space-y-2 text-sm text-slate-300">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-brand-400"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  )
}

function MetricPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  )
}

function ScenarioOutcomeCard({ title, value, detail }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
      <p className="text-sm uppercase tracking-[0.18em] text-slate-500">{title}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{detail}</p>
    </div>
  )
}

function ProgressCard({ detail, label, progress, value }) {
  const normalized = Math.max(0, Math.min(progress, 100))
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm uppercase tracking-[0.18em] text-slate-500">{label}</p>
        <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-200">{value}</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-emerald-300" style={{ width: `${normalized}%` }} />
      </div>
      <p className="mt-3 text-sm text-slate-400">{detail}</p>
    </div>
  )
}

function DistributionRow({ detail, label, value }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="mt-2 text-sm text-slate-400">{detail}</p>
        </div>
        <p className="text-2xl font-semibold text-white">{value}</p>
      </div>
    </div>
  )
}

function ScenarioComparisonRow({ endingValue, label, successProbability, yearsToFi }) {
  const width = yearsToFi === null ? 100 : Math.min((yearsToFi / 30) * 100, 100)

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-white">{label}</p>
          <p className="mt-1 text-sm text-slate-400">Median ending value {formatCurrency(endingValue)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Success</p>
          <p className="mt-1 text-lg font-semibold text-white">{formatPercent(successProbability)}</p>
        </div>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-emerald-300" style={{ width: `${Math.max(8, 100 - width)}%` }} />
      </div>
      <p className="mt-3 text-sm text-slate-300">Years to FI: {activeYearsToFiText(yearsToFi)}</p>
    </div>
  )
}

function TrajectoryChart({ trajectory, retirementYear }) {
  const width = 720
  const height = 280
  const padding = 24
  const maxValue = Math.max(...trajectory.map((point) => point.optimistic), 1)
  const innerWidth = width - padding * 2
  const innerHeight = height - padding * 2

  const toX = (year) => padding + (year / Math.max(trajectory.length - 1, 1)) * innerWidth
  const toY = (value) => height - padding - (value / maxValue) * innerHeight
  const buildLine = (key) => trajectory.map((point, index) => `${index === 0 ? 'M' : 'L'} ${toX(point.year)} ${toY(point[key])}`).join(' ')
  const bandPath = [
    ...trajectory.map((point, index) => `${index === 0 ? 'M' : 'L'} ${toX(point.year)} ${toY(point.optimistic)}`),
    ...[...trajectory].reverse().map((point) => `L ${toX(point.year)} ${toY(point.pessimistic)}`),
    'Z',
  ].join(' ')
  const retirementX = toX(retirementYear)

  return (
    <div className="space-y-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
        <defs>
          <linearGradient id="planner-band" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="planner-line" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#6ee7b7" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((tick) => {
          const y = padding + (innerHeight / 3) * tick
          return <line key={tick} x1={padding} x2={width - padding} y1={y} y2={y} stroke="#1e293b" strokeDasharray="4 6" />
        })}
        <path d={bandPath} fill="url(#planner-band)" />
        <path d={buildLine('median')} fill="none" stroke="url(#planner-line)" strokeWidth="4" strokeLinecap="round" />
        <path d={buildLine('optimistic')} fill="none" stroke="#7dd3fc" strokeOpacity="0.8" strokeWidth="2" strokeDasharray="7 8" />
        <path d={buildLine('pessimistic')} fill="none" stroke="#94a3b8" strokeOpacity="0.7" strokeWidth="2" strokeDasharray="7 8" />
        <line x1={retirementX} x2={retirementX} y1={padding} y2={height - padding} stroke="#f8fafc" strokeOpacity="0.35" strokeDasharray="6 6" />
      </svg>
      <div className="grid gap-3 sm:grid-cols-4">
        <MetricPill label="Band" value="10th–90th pct" />
        <MetricPill label="Median line" value="50th pct" />
        <MetricPill label="Retirement mark" value={`Year ${retirementYear}`} />
        <MetricPill label="Horizon" value={`${trajectory.length - 1} years`} />
      </div>
    </div>
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
