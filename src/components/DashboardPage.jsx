import {
  buildFireMetrics,
  buildNetWorthProjection,
  calculateHouseholdMetrics,
  formatCurrency,
  formatCurrencyPrecise,
  formatPercent,
  groupAccountsByAccountType,
  groupAccountsByOwner,
  groupIncomeByAccount,
  groupIncomeByCategory,
} from '../data/mockData'
import { Panel } from '../ui/Panel'
import { StatCard } from '../ui/StatCard'
import { SectionNav } from './SectionNav'

const dashboardSections = [
  { id: 'dashboard-overview', label: 'Overview' },
  { id: 'dashboard-income-engine', label: 'Income Engine' },
  { id: 'dashboard-fire-tracker', label: 'FIRE Tracker' },
  { id: 'dashboard-accounts-breakdown', label: 'Accounts Breakdown' },
]

export function DashboardPage({ accounts = [] }) {
  const metrics = calculateHouseholdMetrics(accounts)
  const ownerGroups = groupAccountsByOwner(accounts)
  const accountTypeGroups = groupAccountsByAccountType(accounts)
  const incomeByCategory = groupIncomeByCategory(accounts)
  const incomeByAccount = groupIncomeByAccount(accounts)
  const fireMetrics = buildFireMetrics(accounts)
  const projection = buildNetWorthProjection(accounts, 13)
  const maxProjection = Math.max(...projection.map((point) => point.netWorth), 1)

  const summaryCards = [
    {
      title: 'Monthly portfolio income',
      value: formatCurrencyPrecise(metrics.monthlyPortfolioIncome),
      change: formatCurrency(metrics.annualPortfolioIncome),
      detail: 'Every holding rolls into a monthly income total, and annual income is always monthly × 12.',
      tone: 'brand',
    },
    {
      title: 'Annual portfolio income',
      value: formatCurrency(metrics.annualPortfolioIncome),
      change: formatCurrencyPrecise(metrics.monthlyPortfolioIncome),
      detail: 'Forward 12-month passive income based on market value and annual yield across the household portfolio.',
      tone: 'emerald',
    },
    {
      title: 'Weighted portfolio yield',
      value: formatPercent(metrics.weightedPortfolioYield),
      change: formatCurrency(metrics.holdingsMarketValue),
      detail: 'Portfolio-wide yield derived from annual income divided by total holdings market value.',
      tone: 'slate',
    },
    {
      title: 'Total household net worth',
      value: formatCurrency(metrics.totalHouseholdNetWorth),
      change: `${metrics.numberOfAccounts} accounts`,
      detail: 'Full household balance sheet across owner sleeves and account types.',
      tone: 'slate',
    },
    {
      title: 'Total invested assets',
      value: formatCurrency(metrics.totalInvestedAssets),
      change: formatPercent((metrics.totalInvestedAssets / metrics.totalHouseholdNetWorth) * 100),
      detail: 'Investable capital deployed into taxable, retirement, and income-producing holdings.',
      tone: 'slate',
    },
    {
      title: 'Monthly contributions',
      value: formatCurrency(metrics.monthlyHouseholdContributions),
      change: formatCurrency(metrics.monthlyHouseholdContributions * 12),
      detail: 'Recurring savings rate powering long-term compounding and FIRE acceleration.',
      tone: 'slate',
    },
  ]

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        eyebrow="WealthOS Premium"
        title="Household command center"
        description="A premium mobile-first wealth and FIRE dashboard for passive income, account oversight, and next-step execution."
      />

      <SectionNav sections={dashboardSections} />

      <section id="dashboard-overview" className="space-y-5 scroll-mt-28">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {summaryCards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>

        <Panel className="overflow-hidden">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-brand-300">Trajectory</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Net worth trajectory</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                A simple 12-month runway using current household net worth plus recurring monthly contributions.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <MetricPill label="Current" value={formatCurrency(projection[0]?.netWorth)} />
              <MetricPill label="Projected +12m" value={formatCurrency(projection.at(-1)?.netWorth)} />
              <MetricPill
                label="Growth"
                value={formatPercent(
                  projection[0]?.netWorth
                    ? (((projection.at(-1)?.netWorth ?? 0) - projection[0].netWorth) / projection[0].netWorth) * 100
                    : 0,
                )}
              />
            </div>
          </div>

          <div className="mt-6 flex h-56 items-end gap-2 overflow-x-auto pb-2 sm:h-72 sm:gap-3">
            {projection.map((point, index) => {
              const previous = projection[index - 1]?.netWorth ?? point.netWorth
              const delta = point.netWorth - previous
              return (
                <div key={point.label} className="flex min-w-[52px] flex-1 flex-col items-center gap-3">
                  <div className="flex h-full w-full items-end">
                    <div
                      className="w-full rounded-t-[1.25rem] bg-gradient-to-t from-brand-500 via-brand-400 to-emerald-300 shadow-lg shadow-brand-500/20"
                      style={{ height: `${Math.max((point.netWorth / maxProjection) * 100, 10)}%` }}
                    />
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
        </Panel>
      </section>

      <section id="dashboard-income-engine" className="space-y-5 scroll-mt-28">
        <div className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.24em] text-brand-300">Income Engine</p>
          <h3 className="text-2xl font-semibold text-white">Passive income control layer</h3>
          <p className="max-w-3xl text-sm leading-6 text-slate-400">
            Monthly income, annualized income, yield efficiency, and income concentration are all synchronized from the holdings model.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MiniStat label="Monthly Portfolio Income" value={formatCurrencyPrecise(metrics.monthlyPortfolioIncome)} />
          <MiniStat label="Annual Portfolio Income" value={formatCurrency(metrics.annualPortfolioIncome)} />
          <MiniStat label="Weighted Portfolio Yield" value={formatPercent(metrics.weightedPortfolioYield)} />
          <MiniStat label="Income Owners" value={String(ownerGroups.filter((group) => group.monthlyIncome > 0).length)} />
          <MiniStat label="Income Accounts" value={String(incomeByAccount.filter((group) => group.monthlyIncome > 0).length)} />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.1fr,0.9fr]">
          <Panel>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xl font-semibold text-white">Income by category</h4>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Amplified, alternative, anchor, growth, cash, and other sleeves with monthly, annual, and share of portfolio income.
                </p>
              </div>
              <span className="rounded-full border border-slate-700 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-400">
                Live category mix
              </span>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {incomeByCategory.map((group) => (
                <div key={group.category} className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-base font-semibold text-white">{group.category}</p>
                    <span className="rounded-full bg-brand-500/10 px-2.5 py-1 text-[11px] font-semibold text-brand-200">
                      {formatPercent(group.portfolioShare)}
                    </span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-emerald-300" style={{ width: `${group.portfolioShare}%` }} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <MetricBlock label="Monthly" value={formatCurrencyPrecise(group.monthlyIncome)} />
                    <MetricBlock label="Annual" value={formatCurrency(group.annualIncome)} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <div className="space-y-5">
            <Panel>
              <h4 className="text-xl font-semibold text-white">Income by owner</h4>
              <p className="mt-2 text-sm leading-6 text-slate-400">Which owner sleeve is carrying the current passive income load.</p>
              <div className="mt-5 space-y-3">
                {ownerGroups.map((group) => {
                  const progress = metrics.monthlyPortfolioIncome ? (group.monthlyIncome / metrics.monthlyPortfolioIncome) * 100 : 0
                  return (
                    <ProgressRow
                      key={group.owner}
                      label={group.owner}
                      value={formatCurrencyPrecise(group.monthlyIncome)}
                      subValue={formatCurrency(group.annualIncome)}
                      progress={progress}
                    />
                  )
                })}
              </div>
            </Panel>

            <Panel>
              <h4 className="text-xl font-semibold text-white">Income by account</h4>
              <p className="mt-2 text-sm leading-6 text-slate-400">Account-level income distribution for account concentration awareness.</p>
              <div className="mt-5 space-y-3">
                {incomeByAccount.map((group) => {
                  const progress = metrics.monthlyPortfolioIncome ? (group.monthlyIncome / metrics.monthlyPortfolioIncome) * 100 : 0
                  return (
                    <ProgressRow
                      key={group.id}
                      label={group.accountName}
                      caption={`${group.owner} · ${group.accountType}`}
                      value={formatCurrencyPrecise(group.monthlyIncome)}
                      subValue={formatCurrency(group.annualIncome)}
                      progress={progress}
                    />
                  )
                })}
              </div>
            </Panel>
          </div>
        </div>
      </section>

      <section id="dashboard-fire-tracker" className="space-y-5 scroll-mt-28">
        <div className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.24em] text-brand-300">FIRE Tracker</p>
          <h3 className="text-2xl font-semibold text-white">Passive income coverage against your target</h3>
          <p className="max-w-3xl text-sm leading-6 text-slate-400">
            Default monthly FIRE target is set to {formatCurrency(fireMetrics.monthlyTarget)} with live progress driven by current portfolio income.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard title="Target Monthly Income" value={formatCurrency(fireMetrics.monthlyTarget)} change="Default" detail="Baseline monthly FIRE cash-flow target." tone="slate" />
          <StatCard title="Current Passive Income" value={formatCurrencyPrecise(fireMetrics.currentPassiveIncome)} change={formatCurrency(fireMetrics.currentPassiveIncome * 12)} detail="Current monthly passive income from the portfolio." tone="brand" />
          <StatCard title="Coverage Ratio" value={formatPercent(fireMetrics.coverageRatio * 100)} change={`${fireMetrics.coverageRatio.toFixed(2)}x`} detail="Current passive income divided by the target monthly income." tone="emerald" />
          <StatCard title="Remaining Income Gap" value={formatCurrencyPrecise(fireMetrics.remainingIncomeGap)} change={formatCurrency(fireMetrics.remainingIncomeGap * 12)} detail="How much more monthly passive income is needed to hit FIRE." tone="slate" />
          <StatCard title="Annual FIRE Target" value={formatCurrency(fireMetrics.annualFireTarget)} change="12 months" detail="Annual target derived from the monthly FIRE target." tone="slate" />
        </div>

        <Panel>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Progress bar</p>
              <h4 className="mt-2 text-xl font-semibold text-white">FIRE income progress</h4>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Current passive income covers {formatPercent(fireMetrics.progressPercent)} of the monthly FIRE target.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/60 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Target relationship</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {formatCurrencyPrecise(fireMetrics.currentPassiveIncome)} / {formatCurrency(fireMetrics.monthlyTarget)}
              </p>
            </div>
          </div>
          <div className="mt-6 h-4 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-400 via-brand-500 to-emerald-300 transition-all"
              style={{ width: `${fireMetrics.progressPercent}%` }}
            />
          </div>
        </Panel>
      </section>

      <section id="dashboard-accounts-breakdown" className="space-y-5 scroll-mt-28">
        <div className="grid gap-5 xl:grid-cols-[0.92fr,1.08fr]">
          <Panel>
            <h3 className="text-2xl font-semibold text-white">Net worth by owner</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">Owner-level net worth, income, and contribution pacing in one view.</p>
            <div className="mt-5 space-y-3">
              {ownerGroups.map((group) => {
                const share = metrics.totalHouseholdNetWorth ? (group.totalBalance / metrics.totalHouseholdNetWorth) * 100 : 0
                return (
                  <ProgressRow
                    key={group.owner}
                    label={group.owner}
                    value={formatCurrency(group.totalBalance)}
                    subValue={`${formatCurrencyPrecise(group.monthlyIncome)} income / ${formatCurrency(group.monthlyContributions)} contrib.`}
                    progress={share}
                  />
                )
              })}
            </div>
          </Panel>

          <Panel>
            <h3 className="text-2xl font-semibold text-white">Asset allocation by account type</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">Balance and portfolio share across brokerage, retirement, savings, and cash sleeves.</p>
            <div className="mt-5 space-y-3">
              {accountTypeGroups.map((group) => {
                const share = metrics.totalHouseholdNetWorth ? (group.totalBalance / metrics.totalHouseholdNetWorth) * 100 : 0
                return (
                  <ProgressRow
                    key={group.accountType}
                    label={group.accountType}
                    value={formatCurrency(group.totalBalance)}
                    subValue={`${group.accountCount} ${group.accountCount === 1 ? 'account' : 'accounts'} · ${formatPercent(share)}`}
                    progress={share}
                  />
                )
              })}
            </div>
          </Panel>
        </div>

        <Panel>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-2xl font-semibold text-white">Accounts breakdown</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Monthly and annual income stay mathematically aligned for every account in the household system.
              </p>
            </div>
            <span className="rounded-full border border-slate-700 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-400">
              {metrics.numberOfAccounts} tracked accounts
            </span>
          </div>

          <div className="mt-5 hidden overflow-hidden rounded-3xl border border-slate-800 md:block">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
              <thead className="bg-slate-950/80 text-slate-400">
                <tr>
                  {['Owner', 'Account', 'Institution', 'Type', 'Balance', 'Monthly income', 'Annual income'].map((heading) => (
                    <th key={heading} className="px-4 py-3 font-medium">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/35">
                {metrics.accounts.map((account) => {
                  const monthlyIncome = account.holdings.reduce((sum, holding) => sum + holding.estimatedMonthlyIncome, 0)
                  const annualIncome = monthlyIncome * 12
                  return (
                    <tr key={account.id}>
                      <td className="px-4 py-4 text-white">{account.owner}</td>
                      <td className="px-4 py-4 text-white">{account.accountName}</td>
                      <td className="px-4 py-4 text-slate-300">{account.institution}</td>
                      <td className="px-4 py-4 text-slate-300">{account.accountType}</td>
                      <td className="px-4 py-4 text-slate-200">{formatCurrency(account.balance)}</td>
                      <td className="px-4 py-4 text-slate-200">{formatCurrencyPrecise(monthlyIncome)}</td>
                      <td className="px-4 py-4 text-emerald-300">{formatCurrency(annualIncome)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-5 grid gap-3 md:hidden">
            {metrics.accounts.map((account) => {
              const monthlyIncome = account.holdings.reduce((sum, holding) => sum + holding.estimatedMonthlyIncome, 0)
              const annualIncome = monthlyIncome * 12
              return (
                <div key={account.id} className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-white">{account.accountName}</p>
                      <p className="mt-1 text-sm text-slate-400">{account.owner} · {account.institution} · {account.accountType}</p>
                    </div>
                    <span className="rounded-full bg-brand-500/10 px-2.5 py-1 text-[11px] font-semibold text-brand-200">
                      {account.holdings.length} holdings
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <MetricBlock label="Balance" value={formatCurrency(account.balance)} />
                    <MetricBlock label="Monthly income" value={formatCurrencyPrecise(monthlyIncome)} />
                    <MetricBlock label="Annual income" value={formatCurrency(annualIncome)} />
                    <MetricBlock label="Contribution" value={formatCurrency(account.monthlyContribution)} />
                  </div>
                </div>
              )
            })}
          </div>
        </Panel>
      </section>
    </div>
  )
}

function PageHeader({ eyebrow, title, description }) {
  return (
    <div>
      <p className="text-sm uppercase tracking-[0.3em] text-brand-300">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">{description}</p>
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-3 text-xl font-semibold text-white">{value}</p>
    </div>
  )
}

function MetricPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-base font-semibold text-white sm:text-lg">{value}</p>
    </div>
  )
}

function MetricBlock({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-3 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  )
}

function ProgressRow({ label, value, subValue, progress, caption }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-white">{label}</p>
          {caption ? <p className="mt-1 text-sm text-slate-500">{caption}</p> : null}
          <p className="mt-1 text-sm text-slate-400">{subValue}</p>
        </div>
        <p className="text-sm font-semibold text-white">{value}</p>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-emerald-300" style={{ width: `${Math.min(progress, 100)}%` }} />
      </div>
    </div>
  )
}
