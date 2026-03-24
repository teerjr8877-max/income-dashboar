import { html, useMemo, useState } from '../lib/react.js'
import {
  buildFireMetrics,
  buildFireMonteCarloSimulation,
  calculateGoalProgress,
  calculateHouseholdMetrics,
  formatCurrency,
} from '../data/mockData.js'
import { Panel } from '../ui/Panel.jsx'
import { SectionNav } from './SectionNav.jsx'

const plannerSections = [
  { id: 'planner-monte-carlo', label: 'Monte Carlo' },
  { id: 'planner-goals', label: 'Goals' },
  { id: 'planner-fi-progress', label: 'FI Progress' },
  { id: 'planner-scenarios', label: 'Scenarios' },
  { id: 'planner-next-actions', label: 'Next Actions' },
]

export function PlannerPage({ accounts = [], goals = [], setGoals }) {
  const metrics = calculateHouseholdMetrics(accounts)
  const fireMetrics = buildFireMetrics(accounts)

  const [simulationYears, setSimulationYears] = useState(15)
  const [expectedReturnPercent, setExpectedReturnPercent] = useState(7)
  const [volatilityPercent, setVolatilityPercent] = useState(12)
  const [targetIncome, setTargetIncome] = useState(fireMetrics.monthlyTarget)
  const [monthlyContribution, setMonthlyContribution] = useState(metrics.monthlyHouseholdContributions)

  const simulation = useMemo(
    () =>
      buildFireMonteCarloSimulation(accounts, {
        years: simulationYears,
        expectedAnnualReturn: expectedReturnPercent / 100,
        annualVolatility: volatilityPercent / 100,
        monthlyTarget: targetIncome,
        monthlyContribution,
        incomeYieldPercent: metrics.weightedPortfolioYield / 100,
      }),
    [
      accounts,
      expectedReturnPercent,
      metrics.weightedPortfolioYield,
      monthlyContribution,
      simulationYears,
      targetIncome,
      volatilityPercent,
    ],
  )

  const outcomeCards = [
    {
      label: 'Pessimistic (P10)',
      monthlyIncome: simulation.percentile10Income,
      detail: '10th percentile outcome based on current assumptions.',
    },
    {
      label: 'Base (P50)',
      monthlyIncome: simulation.percentile50Income,
      detail: 'Median expected outcome across simulation paths.',
    },
    {
      label: 'Optimistic (P90)',
      monthlyIncome: simulation.percentile90Income,
      detail: '90th percentile outcome in stronger return environments.',
    },
  ]

  const annualProjection = outcomeCards.map((outcome) => ({
    ...outcome,
    annualIncome: outcome.monthlyIncome * 12,
  }))

  const monteCarloSummary = buildMonteCarloSummary({
    successRate: simulation.successRate,
    years: simulation.years,
    monthlyTarget: simulation.monthlyTarget,
    averageHitMonth: simulation.averageHitMonth,
    baseIncome: simulation.percentile50Income,
  })

  const updateGoal = (id, field, value) => {
    setGoals((current) =>
      current.map((goal) =>
        goal.id === id ? { ...goal, [field]: field === 'title' ? value : Number(value) || 0 } : goal,
      ),
    )
  }

  const scenarioCards = [
    {
      title: 'Lean FIRE',
      value: formatCurrency(7000),
      detail: `Coverage today: ${((fireMetrics.currentPassiveIncome / 7000) * 100).toFixed(1)}%`,
    },
    {
      title: 'Target FIRE',
      value: formatCurrency(fireMetrics.monthlyTarget),
      detail: `Gap remaining: ${formatCurrency(fireMetrics.remainingIncomeGap)}`,
    },
    {
      title: 'Fat FIRE',
      value: formatCurrency(14000),
      detail: `Coverage today: ${((fireMetrics.currentPassiveIncome / 14000) * 100).toFixed(1)}%`,
    },
  ]

  const nextActions = [
    `Increase monthly passive income by ${formatCurrency(fireMetrics.remainingIncomeGap)} to reach the default FIRE target.`,
    `Maintain current contribution rate of ${formatCurrency(metrics.monthlyHouseholdContributions)} per month to keep compounding momentum strong.`,
    'Review highest-yield sleeves first when reallocating capital for better income efficiency.',
  ]

  return html`<div className="space-y-5 lg:space-y-6">
    <${PageHeader}
      eyebrow="Goals Engine"
      title="Planner"
      description="Translate your household wealth strategy into clear targets, FI progress, scenarios, and immediate next actions."
    />
    <${SectionNav} sections=${plannerSections} />

    <section id="planner-monte-carlo" className="scroll-mt-28">
      <${Panel}>
        <h3 className="text-2xl font-semibold text-white">Monte Carlo FIRE Planner</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Stress-test the FIRE plan with scenario inputs and review success probability, percentile outcomes, and a plain-English readout.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <${ScenarioInput} label="Years" min="1" max="40" value=${simulationYears} onChange=${setSimulationYears} />
          <${ScenarioInput}
            label="Expected return (%)"
            min="0"
            max="20"
            step="0.1"
            value=${expectedReturnPercent}
            onChange=${setExpectedReturnPercent}
          />
          <${ScenarioInput}
            label="Volatility (%)"
            min="1"
            max="40"
            step="0.1"
            value=${volatilityPercent}
            onChange=${setVolatilityPercent}
          />
          <${ScenarioInput}
            label="Target monthly income ($)"
            min="1000"
            max="30000"
            step="100"
            value=${targetIncome}
            onChange=${setTargetIncome}
          />
          <${ScenarioInput}
            label="Monthly contribution ($)"
            min="0"
            max="20000"
            step="50"
            value=${monthlyContribution}
            onChange=${setMonthlyContribution}
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <${RollupCard} label="Success probability" value=${`${(simulation.successRate * 100).toFixed(1)}%`} />
          <${RollupCard} label="Average monthly outcome" value=${formatCurrency(simulation.averageTerminalIncome)} />
          <${RollupCard}
            label="Average target hit month"
            value=${simulation.averageHitMonth <= simulation.years * 12 ? `Month ${Math.round(simulation.averageHitMonth)}` : 'Beyond horizon'}
          />
          <${RollupCard} label="Simulation paths" value=${simulation.simulations.toLocaleString('en-US')} />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          ${outcomeCards.map(
            (outcome) => html`<${Panel} key=${outcome.label} className="border-slate-700 bg-slate-950/70">
              <p className="text-sm uppercase tracking-[0.18em] text-slate-400">${outcome.label}</p>
              <p className="mt-3 text-3xl font-semibold text-white">${formatCurrency(outcome.monthlyIncome)}</p>
              <p className="mt-2 text-sm text-slate-300">${outcome.detail}</p>
            </${Panel}>`,
          )}
        </div>

        <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
          <h4 className="text-lg font-semibold text-white">Retirement projection output</h4>
          <p className="mt-1 text-sm text-slate-400">Projected annual income at year ${simulation.years} using Monte Carlo percentile outcomes.</p>
          <div className="mt-4 space-y-3">
            ${annualProjection.map(
              (projection) => html`<div key=${projection.label} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
                <span className="text-sm text-slate-300">${projection.label}</span>
                <span className="text-sm font-semibold text-white">${formatCurrency(projection.annualIncome)} / year</span>
              </div>`,
            )}
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-brand-400/25 bg-brand-500/5 p-5">
          <h4 className="text-lg font-semibold text-white">Plain-English summary</h4>
          <p className="mt-2 text-sm leading-6 text-slate-200">${monteCarloSummary}</p>
        </div>
      </${Panel}>
    </section>

    <section id="planner-goals" className="scroll-mt-28">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        ${goals.map((goal) => {
          const progress = calculateGoalProgress(goal)
          return html`<${Panel} key=${goal.id}>
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-semibold text-white">${goal.title}</h3>
              <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-200">${progress.toFixed(1)}%</span>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-emerald-300" style=${{ width: `${progress}%` }} />
            </div>
            <div className="mt-5 space-y-3">
              <${GoalInput} label="Target amount" value=${goal.targetAmount} onChange=${(value) => updateGoal(goal.id, 'targetAmount', value)} />
              <${GoalInput} label="Current amount" value=${goal.currentAmount} onChange=${(value) => updateGoal(goal.id, 'currentAmount', value)} />
              <${GoalInput}
                label="Monthly contribution"
                value=${goal.monthlyContribution}
                onChange=${(value) => updateGoal(goal.id, 'monthlyContribution', value)}
              />
            </div>
          </${Panel}>`
        })}
      </div>
    </section>

    <section id="planner-fi-progress" className="scroll-mt-28">
      <${Panel}>
        <h3 className="text-2xl font-semibold text-white">FI progress</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">Track household assets, passive income, and current progress toward financial independence.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <${RollupCard} label="Household net worth" value=${formatCurrency(metrics.totalHouseholdNetWorth)} />
          <${RollupCard} label="Invested assets" value=${formatCurrency(metrics.totalInvestedAssets)} />
          <${RollupCard} label="Current passive income" value=${formatCurrency(fireMetrics.currentPassiveIncome)} />
          <${RollupCard} label="FIRE coverage" value=${`${(fireMetrics.coverageRatio * 100).toFixed(1)}%`} />
        </div>
      </${Panel}>
    </section>

    <section id="planner-scenarios" className="scroll-mt-28">
      <div className="grid gap-4 xl:grid-cols-3">
        ${scenarioCards.map(
          (scenario) => html`<${Panel} key=${scenario.title}>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">${scenario.title}</p>
            <p className="mt-4 text-3xl font-semibold text-white">${scenario.value}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">${scenario.detail}</p>
          </${Panel}>`,
        )}
      </div>
    </section>

    <section id="planner-next-actions" className="scroll-mt-28">
      <${Panel}>
        <h3 className="text-2xl font-semibold text-white">Next actions</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">Suggested moves based on your live household portfolio and FIRE gap.</p>
        <div className="mt-5 space-y-3">
          ${nextActions.map(
            (action) => html`<div key=${action} className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4 text-sm leading-6 text-slate-300">${action}</div>`,
          )}
        </div>
      </${Panel}>
    </section>
  </div>`
}

function buildMonteCarloSummary({ successRate, years, monthlyTarget, averageHitMonth, baseIncome }) {
  const successLabel = `${(successRate * 100).toFixed(1)}%`
  const hitTiming =
    averageHitMonth <= years * 12
      ? `typically reaches the goal around month ${Math.round(averageHitMonth)}`
      : `does not reliably hit the goal within ${years} years`

  return `With these assumptions, the plan has a ${successLabel} probability of reaching ${formatCurrency(monthlyTarget)} in monthly passive income within ${years} years, and the base-case outcome projects about ${formatCurrency(baseIncome)} per month at the end of the period. The model ${hitTiming}.`
}

function PageHeader({ eyebrow, title, description }) {
  return html`<div>
    <p className="text-sm uppercase tracking-[0.3em] text-brand-300">${eyebrow}</p>
    <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">${title}</h2>
    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">${description}</p>
  </div>`
}

function GoalInput({ label, onChange, value }) {
  return html`<label className="block space-y-2 text-sm text-slate-300">
    <span>${label}</span>
    <input
      type="number"
      step="0.01"
      value=${value}
      onChange=${(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-brand-400"
    />
  </label>`
}

function ScenarioInput({ label, min, max, onChange, step = '1', value }) {
  return html`<label className="block space-y-2 text-sm text-slate-300">
    <span>${label}</span>
    <input
      type="number"
      min=${min}
      max=${max}
      step=${step}
      value=${value}
      onChange=${(event) => onChange(Number(event.target.value) || 0)}
      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-brand-400"
    />
  </label>`
}

function RollupCard({ label, value }) {
  return html`<div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
    <p className="text-sm uppercase tracking-[0.18em] text-slate-500">${label}</p>
    <p className="mt-3 text-3xl font-semibold text-white">${value}</p>
  </div>`
}
