import {
  calculateAccountMonthlyIncome,
  calculateHouseholdMetrics,
  formatCurrency,
  formatCurrencyPrecise,
  groupAccountsByOwner,
} from '../data/mockData'
import { Panel } from '../ui/Panel'
import { StatCard } from '../ui/StatCard'

export function DashboardPage({ accounts = [] }) {
  const metrics = calculateHouseholdMetrics(accounts)
  const ownerGroups = groupAccountsByOwner(accounts)
  const summaryCards = [
    {
      title: 'Total household net worth',
      value: formatCurrency(metrics.totalHouseholdNetWorth),
      change: `${metrics.numberOfAccounts} accounts`,
      detail: 'Combined balances across JR, Lisa, and joint household accounts.',
    },
    {
      title: 'Monthly portfolio income',
      value: formatCurrencyPrecise(metrics.monthlyPortfolioIncome),
      change: formatCurrency(metrics.annualPortfolioIncome),
      detail: 'Dividend, interest, and yield-driven monthly cash flow from all holdings.',
    },
    {
      title: 'Annual portfolio income',
      value: formatCurrency(metrics.annualPortfolioIncome),
      change: formatCurrencyPrecise(metrics.monthlyPortfolioIncome),
      detail: 'Forward annualized income based on current balances and yield assumptions.',
    },
    {
      title: 'Monthly contributions',
      value: formatCurrency(metrics.monthlyContributions),
      change: formatCurrency(metrics.monthlyContributions * 12),
      detail: 'Recurring monthly savings flowing into retirement, brokerage, and cash reserves.',
    },
    {
      title: 'Number of accounts',
      value: String(metrics.numberOfAccounts),
      change: 'Household coverage',
      detail: 'All tracked wealth containers inside the WealthOS operating system.',
    },
  ]

  const rankedAccounts = [...accounts].sort((a, b) => b.currentBalance - a.currentBalance)

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Overview</p>
        <h2 className="mt-2 text-4xl font-semibold text-white">Dashboard</h2>
        <p className="mt-3 max-w-2xl text-slate-400">
          Monitor real household assets, income production, and monthly savings velocity across your financial system.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr,1fr]">
        <Panel>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold text-white">Household account breakdown</h3>
              <p className="mt-2 text-sm text-slate-400">
                Review owner-level balance concentration, savings cadence, and the accounts driving the household plan.
              </p>
            </div>
            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
              Live data model
            </span>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {ownerGroups.map((group) => (
              <div key={group.owner} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-lg font-semibold text-white">{group.owner}</h4>
                  <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-200">
                    {group.accountCount} accounts
                  </span>
                </div>
                <p className="mt-4 text-3xl font-semibold text-white">{formatCurrency(group.totalBalance)}</p>
                <p className="mt-2 text-sm text-slate-400">Monthly contributions: {formatCurrency(group.monthlyContributions)}</p>

                <div className="mt-5 space-y-3">
                  {group.accounts.map((account) => (
                    <div key={account.id} className="rounded-2xl border border-slate-800/80 bg-slate-900/70 px-4 py-3">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-white">{account.accountName}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                            {account.institution} · {account.type}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-slate-200">{formatCurrency(account.currentBalance)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <h3 className="text-2xl font-semibold text-white">Top income-producing accounts</h3>
          <p className="mt-2 text-sm text-slate-400">
            A quick view of which accounts are generating the most monthly portfolio cash flow today.
          </p>

          <div className="mt-8 space-y-4">
            {rankedAccounts.map((account) => (
              <div key={account.id} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-white">{account.accountName}</p>
                    <p className="mt-1 text-sm text-slate-400">{account.owner} · {account.type} · {account.institution}</p>
                  </div>
                  <p className="text-right text-lg font-semibold text-white">{formatCurrency(account.currentBalance)}</p>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <MetricPill label="Monthly income" value={formatCurrencyPrecise(calculateAccountMonthlyIncome(account))} />
                  <MetricPill label="Monthly contributions" value={formatCurrency(account.monthlyContribution)} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
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
