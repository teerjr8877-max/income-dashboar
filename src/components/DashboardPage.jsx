import {
  buildNetWorthProjection,
  calculateHouseholdMetrics,
  formatCurrency,
  formatCurrencyPrecise,
  formatPercent,
  groupAccountsByAccountType,
  groupAccountsByOwner,
  groupIncomeByCategory,
} from '../data/mockData'
import { Panel } from '../ui/Panel'
import { StatCard } from '../ui/StatCard'

export function DashboardPage({ accounts = [] }) {
  const metrics = calculateHouseholdMetrics(accounts)
  const ownerGroups = groupAccountsByOwner(accounts)
  const accountTypeGroups = groupAccountsByAccountType(accounts)
  const incomeByCategory = groupIncomeByCategory(accounts)
  const projection = buildNetWorthProjection(accounts, 12)
  const maxProjection = Math.max(...projection.map((point) => point.netWorth), 1)

  const summaryCards = [
    {
      title: 'Total household net worth',
      value: formatCurrency(metrics.totalHouseholdNetWorth),
      change: `${metrics.numberOfAccounts} accounts`,
      detail: 'Combined balances across all JR, Lisa, and joint household accounts.',
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
          Run the full household balance sheet from one premium workspace with live account coverage, owner visibility,
          income tracking, contribution pacing, and a simple net worth trajectory.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
        <StatCard
          title="Number of accounts"
          value={String(metrics.numberOfAccounts)}
          change="Coverage"
          detail="Total number of tracked household containers across investing, retirement, and cash management."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr,1fr]">
        <Panel>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold text-white">Net worth chart</h3>
              <p className="mt-2 text-sm text-slate-400">
                Simple 12-month path using current household net worth plus recurring monthly contributions.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Projected +12m</p>
              <p className="mt-2 text-xl font-semibold text-white">{formatCurrency(projection.at(-1)?.netWorth ?? 0)}</p>
            </div>
          </div>

          <div className="mt-8 flex h-72 items-end gap-3 rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
            {projection.map((point) => (
              <div key={point.label} className="flex flex-1 flex-col items-center justify-end gap-3">
                <div className="flex h-full w-full items-end">
                  <div
                    className="w-full rounded-t-2xl bg-gradient-to-t from-brand-500 via-brand-400 to-emerald-300 shadow-lg shadow-brand-500/20"
                    style={{ height: `${Math.max((point.netWorth / maxProjection) * 100, 8)}%` }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{point.label}</p>
                  <p className="mt-1 text-xs text-slate-300">{formatCurrency(point.netWorth)}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <h3 className="text-2xl font-semibold text-white">Contribution progress</h3>
          <p className="mt-2 text-sm text-slate-400">
            Monthly owner pacing compared with total household contribution capacity.
          </p>

          <div className="mt-8 space-y-4">
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

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold text-white">Household account breakdown</h3>
              <p className="mt-2 text-sm text-slate-400">
                Every account with owner, institution, type, balance, monthly contribution, and monthly income context.
              </p>
            </div>
            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
              All accounts
            </span>
          </div>

          <div className="mt-6 space-y-3">
            {accounts.map((account) => (
              <div key={account.id} className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-white">{account.accountName}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {account.owner} · {account.institution} · {account.accountType}
                    </p>
                  </div>
                  <p className="text-xl font-semibold text-white">{formatCurrency(account.balance)}</p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <MetricPill label="Monthly contribution" value={formatCurrency(account.monthlyContribution)} />
                  <MetricPill label="Monthly income" value={formatCurrencyPrecise(account.holdings.reduce((sum, holding) => sum + holding.estimatedMonthlyIncome, 0))} />
                  <MetricPill label="Holdings" value={String(account.holdings.length)} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel>
            <h3 className="text-2xl font-semibold text-white">Net worth by owner</h3>
            <p className="mt-2 text-sm text-slate-400">See how the household balance sheet is distributed across JR, Lisa, and joint ownership.</p>
            <div className="mt-6 space-y-4">
              {ownerGroups.map((group) => {
                const share = metrics.totalHouseholdNetWorth ? (group.totalBalance / metrics.totalHouseholdNetWorth) * 100 : 0
                return (
                  <StackRow
                    key={group.owner}
                    label={group.owner}
                    value={formatCurrency(group.totalBalance)}
                    meta={`${group.accountCount} accounts · ${formatCurrencyPrecise(group.monthlyIncome)}/mo income`}
                    progress={share}
                  />
                )
              })}
            </div>
          </Panel>

          <Panel>
            <h3 className="text-2xl font-semibold text-white">Net worth by account type</h3>
            <p className="mt-2 text-sm text-slate-400">Track which account structures hold the most capital today.</p>
            <div className="mt-6 space-y-4">
              {accountTypeGroups.map((group) => {
                const share = metrics.totalHouseholdNetWorth ? (group.totalBalance / metrics.totalHouseholdNetWorth) * 100 : 0
                return (
                  <StackRow
                    key={group.accountType}
                    label={group.accountType}
                    value={formatCurrency(group.totalBalance)}
                    meta={`${group.accountCount} accounts`}
                    progress={share}
                  />
                )
              })}
            </div>
          </Panel>

          <Panel>
            <h3 className="text-2xl font-semibold text-white">Income by owner</h3>
            <p className="mt-2 text-sm text-slate-400">Forward monthly portfolio income production by ownership bucket.</p>
            <div className="mt-6 space-y-4">
              {ownerGroups.map((group) => {
                const share = metrics.monthlyPortfolioIncome ? (group.monthlyIncome / metrics.monthlyPortfolioIncome) * 100 : 0
                return (
                  <StackRow
                    key={group.owner}
                    label={group.owner}
                    value={formatCurrencyPrecise(group.monthlyIncome)}
                    meta={`Annualized ${formatCurrency(group.monthlyIncome * 12)}`}
                    progress={share}
                  />
                )
              })}
            </div>
          </Panel>

          <Panel>
            <h3 className="text-2xl font-semibold text-white">Income by category</h3>
            <p className="mt-2 text-sm text-slate-400">Understand which sleeves are carrying household portfolio cash flow.</p>
            <div className="mt-6 space-y-4">
              {incomeByCategory.map((group) => {
                const share = metrics.monthlyPortfolioIncome ? (group.amount / metrics.monthlyPortfolioIncome) * 100 : 0
                return (
                  <StackRow
                    key={group.category}
                    label={group.category}
                    value={formatCurrencyPrecise(group.amount)}
                    meta={`Annualized ${formatCurrency(group.amount * 12)}`}
                    progress={share}
                  />
                )
              })}
            </div>
          </Panel>
        </div>
      </div>
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

function StackRow({ label, value, meta, progress }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-white">{label}</p>
          <p className="mt-1 text-sm text-slate-400">{meta}</p>
        </div>
        <p className="text-lg font-semibold text-white">{value}</p>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-emerald-300" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
