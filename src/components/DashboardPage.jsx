import {
  buildNetWorthProjection,
  calculateAccountMonthlyIncome,
  calculateHouseholdMetrics,
  formatCurrency,
  formatCurrencyPrecise,
  formatPercent,
  groupAccountsByAccountType,
  groupAccountsByOwner,
  groupIncomeByCategory,
} from '../data/householdModel'
import { Panel } from '../ui/Panel'
import { StatCard } from '../ui/StatCard'

export function DashboardPage({ accounts = [] }) {
  const metrics = calculateHouseholdMetrics(accounts)
  const ownerGroups = groupAccountsByOwner(accounts)
  const accountTypeGroups = groupAccountsByAccountType(accounts)
  const incomeByCategory = groupIncomeByCategory(accounts)
  const projection = buildNetWorthProjection(accounts, 13)
  const maxProjection = Math.max(...projection.map((point) => point.netWorth), 1)
  const currentProjection = projection[0]?.netWorth ?? 0
  const projectedNetWorth = projection.at(-1)?.netWorth ?? 0
  const projectedGrowth = currentProjection ? ((projectedNetWorth - currentProjection) / currentProjection) * 100 : 0

  const summaryCards = [
    {
      title: 'Total household net worth',
      value: formatCurrency(metrics.totalHouseholdNetWorth),
      change: `${metrics.numberOfAccounts} accounts`,
      detail: 'Combined balances across all JR, Lisa, and Joint household accounts.',
    },
    {
      title: 'Total invested assets',
      value: formatCurrency(metrics.totalInvestedAssets),
      change: formatPercent((metrics.totalInvestedAssets / metrics.totalHouseholdNetWorth) * 100),
      detail: 'Retirement and brokerage capital currently deployed in the household investment engine.',
    },
    {
      title: 'Total cash / savings',
      value: formatCurrency(metrics.totalCashSavings),
      change: formatPercent((metrics.totalCashSavings / metrics.totalHouseholdNetWorth) * 100),
      detail: 'Liquidity reserved in savings and cash accounts for stability, spending, and short-term goals.',
    },
    {
      title: 'Monthly portfolio income',
      value: formatCurrencyPrecise(metrics.monthlyPortfolioIncome),
      change: formatCurrency(metrics.annualPortfolioIncome),
      detail: 'Estimated dividends, interest, and yield income produced each month from current holdings.',
    },
    {
      title: 'Annual portfolio income',
      value: formatCurrency(metrics.annualPortfolioIncome),
      change: formatCurrencyPrecise(metrics.monthlyPortfolioIncome),
      detail: 'Forward 12-month income estimate using each holding’s market value and annual yield.',
    },
    {
      title: 'Monthly contributions',
      value: formatCurrency(metrics.monthlyHouseholdContributions),
      change: formatCurrency(metrics.monthlyHouseholdContributions * 12),
      detail: 'Recurring monthly deposits across retirement, brokerage, savings, and cash reserves.',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-300">WealthOS V2</p>
        <h2 className="mt-2 text-4xl font-semibold text-white">Household Command Center</h2>
        <p className="mt-3 max-w-3xl text-slate-400">
          Run the full household balance sheet from one premium workspace with owner visibility, allocation clarity,
          portfolio income segmentation, and an operating table for every account in the household system.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <Panel className="overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-brand-300">Trajectory</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Net worth trajectory</h3>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              A lightweight 12-month command view using current household net worth and recurring monthly contributions.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricPill label="Current net worth" value={formatCurrency(currentProjection)} />
            <MetricPill label="Projected +12m" value={formatCurrency(projectedNetWorth)} />
            <MetricPill label="Projected growth" value={formatPercent(projectedGrowth)} />
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr,0.8fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
            <div className="flex h-80 items-end gap-3">
              {projection.map((point, index) => {
                const previous = projection[index - 1]?.netWorth ?? point.netWorth
                const delta = point.netWorth - previous
                return (
                  <div key={point.label} className="flex flex-1 flex-col items-center justify-end gap-3">
                    <div className="flex h-full w-full items-end">
                      <div
                        className="relative w-full overflow-hidden rounded-t-[1.5rem] border border-brand-400/10 bg-gradient-to-t from-brand-500 via-brand-400 to-emerald-300 shadow-lg shadow-brand-500/20"
                        style={{ height: `${Math.max((point.netWorth / maxProjection) * 100, 10)}%` }}
                      >
                        <div className="absolute inset-x-0 top-0 h-10 bg-white/10" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{point.label}</p>
                      <p className="mt-1 text-xs font-medium text-slate-200">{formatCurrency(point.netWorth)}</p>
                      <p className="mt-1 text-[11px] text-emerald-300">{index === 0 ? 'Base' : `+${formatCurrency(delta)}`}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Monthly contribution engine</p>
              <p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(metrics.monthlyHouseholdContributions)}</p>
              <p className="mt-2 text-sm text-slate-400">
                Recurring savings and investing adds approximately {formatCurrency(metrics.monthlyHouseholdContributions * 12)}
                {' '}to the household system each year before market movement.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Premium operating note</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Owner sleeves, account types, and income categories below all roll up from the same live household data,
                keeping the dashboard analytical without changing the underlying model or navigation.
              </p>
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Panel>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold text-white">Net worth by owner</h3>
              <p className="mt-2 text-sm text-slate-400">
                JR, Lisa, and Joint balances with ownership share of total household net worth.
              </p>
            </div>
            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
              Ownership view
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {ownerGroups.map((group) => {
              const share = metrics.totalHouseholdNetWorth ? (group.totalBalance / metrics.totalHouseholdNetWorth) * 100 : 0
              return (
                <div key={group.owner} className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.18em] text-slate-500">{group.owner}</p>
                      <p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(group.totalBalance)}</p>
                    </div>
                    <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-200">
                      {formatPercent(share)}
                    </span>
                  </div>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-emerald-300" style={{ width: `${share}%` }} />
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <MetricPill label="Accounts" value={String(group.accountCount)} />
                    <MetricPill label="Monthly income" value={formatCurrencyPrecise(group.monthlyIncome)} />
                  </div>
                </div>
              )
            })}
          </div>
        </Panel>

        <Panel>
          <h3 className="text-2xl font-semibold text-white">Asset allocation by account type</h3>
          <p className="mt-2 text-sm text-slate-400">
            Balance and percent of household net worth across brokerage, retirement, savings, cash, and HSA sleeves.
          </p>
          <div className="mt-6 space-y-4">
            {accountTypeGroups.map((group) => {
              const share = metrics.totalHouseholdNetWorth ? (group.totalBalance / metrics.totalHouseholdNetWorth) * 100 : 0
              return (
                <AllocationRow
                  key={group.accountType}
                  label={group.accountType}
                  value={formatCurrency(group.totalBalance)}
                  percentage={formatPercent(share)}
                  progress={share}
                  meta={`${group.accountCount} ${group.accountCount === 1 ? 'account' : 'accounts'}`}
                />
              )
            })}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr,0.95fr]">
        <Panel>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold text-white">Income by category</h3>
              <p className="mt-2 text-sm text-slate-400">
                Portfolio income grouped by amplified, alternative, anchor, growth, cash, and other category sleeves.
              </p>
            </div>
            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
              Annual + monthly
            </span>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/50">
            <div className="grid grid-cols-[1.2fr,0.8fr,0.8fr,0.8fr] gap-4 border-b border-slate-800 px-5 py-4 text-xs uppercase tracking-[0.2em] text-slate-500">
              <p>Category</p>
              <p>Monthly</p>
              <p>Annual</p>
              <p>Share</p>
            </div>
            <div className="divide-y divide-slate-800">
              {incomeByCategory.map((group) => {
                const share = metrics.monthlyPortfolioIncome ? (group.amount / metrics.monthlyPortfolioIncome) * 100 : 0
                return (
                  <div key={group.category} className="grid grid-cols-[1.2fr,0.8fr,0.8fr,0.8fr] gap-4 px-5 py-4 text-sm">
                    <div>
                      <p className="font-semibold text-white">{group.category}</p>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                        <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-emerald-300" style={{ width: `${share}%` }} />
                      </div>
                    </div>
                    <p className="font-medium text-slate-200">{formatCurrencyPrecise(group.amount)}</p>
                    <p className="font-medium text-slate-200">{formatCurrency(group.amount * 12)}</p>
                    <p className="text-brand-200">{formatPercent(share)}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </Panel>

        <Panel>
          <h3 className="text-2xl font-semibold text-white">Owner contribution pacing</h3>
          <p className="mt-2 text-sm text-slate-400">
            Monthly household funding mix across JR, Lisa, and Joint accounts.
          </p>

          <div className="mt-6 space-y-4">
            {ownerGroups.map((group) => {
              const progress = metrics.monthlyHouseholdContributions
                ? (group.monthlyContributions / metrics.monthlyHouseholdContributions) * 100
                : 0
              return (
                <div key={group.owner} className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-white">{group.owner}</p>
                      <p className="mt-1 text-sm text-slate-400">{formatCurrency(group.monthlyContributions)} / month</p>
                    </div>
                    <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-200">
                      {formatPercent(progress)}
                    </span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-emerald-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Panel>
      </div>

      <Panel>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-white">Household accounts breakdown</h3>
            <p className="mt-2 text-sm text-slate-400">
              Clean operating table across owner, institution, account type, balance, monthly contribution, and annual income.
            </p>
          </div>
          <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
            {metrics.numberOfAccounts} tracked accounts
          </span>
        </div>

        <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-800 bg-slate-950/50">
          <table className="min-w-full divide-y divide-slate-800 text-left">
            <thead className="bg-slate-950/90 text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-5 py-4 font-medium">Owner</th>
                <th className="px-5 py-4 font-medium">Account</th>
                <th className="px-5 py-4 font-medium">Institution</th>
                <th className="px-5 py-4 font-medium">Type</th>
                <th className="px-5 py-4 font-medium">Balance</th>
                <th className="px-5 py-4 font-medium">Monthly contribution</th>
                <th className="px-5 py-4 font-medium">Estimated annual income</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {accounts.map((account) => {
                const annualIncome = calculateAccountMonthlyIncome(account) * 12
                return (
                  <tr key={account.id} className="transition-colors hover:bg-slate-900/80">
                    <td className="px-5 py-4 text-white">{account.ownerId}</td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-white">{account.accountName}</p>
                        <p className="mt-1 text-xs text-slate-500">{account.holdings.length} holdings</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-300">{account.institution}</td>
                    <td className="px-5 py-4 text-slate-300">{account.accountType}</td>
                    <td className="px-5 py-4 font-medium text-white">{formatCurrency(account.balance)}</td>
                    <td className="px-5 py-4 text-slate-200">{formatCurrency(account.monthlyContribution)}</td>
                    <td className="px-5 py-4 text-emerald-300">{formatCurrency(annualIncome)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

function MetricPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  )
}

function AllocationRow({ label, value, percentage, progress, meta }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-white">{label}</p>
          <p className="mt-1 text-sm text-slate-400">{meta}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-white">{value}</p>
          <p className="mt-1 text-sm text-brand-200">{percentage}</p>
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-emerald-300" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
