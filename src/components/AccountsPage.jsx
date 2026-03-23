import { useEffect, useMemo, useState } from 'react'
import {
  accountOwners,
  accountTypes,
  calculateAccountMonthlyIncome,
  calculateHoldingMonthlyIncome,
  formatCurrency,
  formatCurrencyPrecise,
  groupAccountsByOwner,
  groupIncomeByAccount,
  holdingCategories,
  normalizeAccount,
} from '../data/mockData'
import { Panel } from '../ui/Panel'
import { SectionNav } from './SectionNav'

const accountSections = [
  { id: 'accounts-add-account', label: 'Add Account' },
  { id: 'accounts-holdings', label: 'Holdings' },
  { id: 'accounts-income-by-account', label: 'Income by Account' },
  { id: 'accounts-owner-breakdown', label: 'Owner Breakdown' },
]

const emptyAccount = {
  owner: 'JR',
  accountName: '',
  institution: '',
  accountType: 'Brokerage',
  balance: '',
  monthlyContribution: '',
  notes: '',
}

const emptyHolding = {
  ticker: '',
  holdingName: '',
  shares: '',
  marketValue: '',
  annualYieldPercent: '',
  category: 'Other',
}

export function AccountsPage({ accounts, setAccounts }) {
  const [accountForm, setAccountForm] = useState(emptyAccount)
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id ?? null)
  const [holdingForm, setHoldingForm] = useState(emptyHolding)
  const [editingHolding, setEditingHolding] = useState(null)

  useEffect(() => {
    if (!accounts.some((account) => account.id === selectedAccountId)) {
      setSelectedAccountId(accounts[0]?.id ?? null)
    }
  }, [accounts, selectedAccountId])

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === selectedAccountId) ?? accounts[0] ?? null,
    [accounts, selectedAccountId],
  )

  const incomeByAccount = groupIncomeByAccount(accounts)
  const ownerGroups = groupAccountsByOwner(accounts)
  const holdings = accounts.flatMap((account) =>
    account.holdings.map((holding) => ({
      ...holding,
      owner: account.owner,
      accountName: account.accountName,
      accountId: account.id,
      annualIncome: Number((holding.estimatedMonthlyIncome * 12).toFixed(2)),
    })),
  )

  const addAccount = (event) => {
    event.preventDefault()

    const nextAccount = normalizeAccount({
      id: Date.now(),
      owner: accountForm.owner,
      accountName: accountForm.accountName.trim(),
      institution: accountForm.institution.trim(),
      accountType: accountForm.accountType,
      balance: Number(accountForm.balance),
      monthlyContribution: Number(accountForm.monthlyContribution),
      notes: accountForm.notes.trim(),
      holdings: [],
    })

    setAccounts((current) => [...current, nextAccount])
    setSelectedAccountId(nextAccount.id)
    setAccountForm(emptyAccount)
  }

  const submitHolding = (event) => {
    event.preventDefault()
    if (!selectedAccount) return

    const parsedHolding = {
      id: editingHolding?.id ?? Date.now(),
      ticker: holdingForm.ticker.trim().toUpperCase(),
      holdingName: holdingForm.holdingName.trim(),
      shares: Number(holdingForm.shares),
      marketValue: Number(holdingForm.marketValue),
      annualYieldPercent: Number(holdingForm.annualYieldPercent),
      estimatedMonthlyIncome: calculateHoldingMonthlyIncome(holdingForm),
      category: holdingForm.category,
    }

    setAccounts((current) =>
      current.map((account) => {
        if (account.id !== selectedAccount.id) return account

        const holdingsForAccount = editingHolding
          ? account.holdings.map((holding) => (holding.id === editingHolding.id ? parsedHolding : holding))
          : [...account.holdings, parsedHolding]

        return normalizeAccount({ ...account, holdings: holdingsForAccount })
      }),
    )

    setHoldingForm(emptyHolding)
    setEditingHolding(null)
  }

  const startEditHolding = (holding) => {
    setEditingHolding(holding)
    setHoldingForm({
      ticker: holding.ticker,
      holdingName: holding.holdingName,
      shares: String(holding.shares),
      marketValue: String(holding.marketValue),
      annualYieldPercent: String(holding.annualYieldPercent),
      category: holding.category,
    })
  }

  const projectedHoldingIncome = calculateHoldingMonthlyIncome(holdingForm)

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        eyebrow="Accounts Engine"
        title="Household accounts"
        description="Manage every owner sleeve, update holdings, and keep passive income math aligned from holding to account to household view."
      />

      <SectionNav sections={accountSections} />

      <section id="accounts-add-account" className="scroll-mt-28">
        <div className="grid gap-5 xl:grid-cols-[1.05fr,0.95fr]">
          <Panel>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-white">Add household account</h3>
              <span className="text-sm text-slate-400">{accounts.length} tracked</span>
            </div>

            <form className="mt-6 space-y-4" onSubmit={addAccount}>
              <div className="grid gap-4 md:grid-cols-2">
                <Select label="Owner" value={accountForm.owner} options={accountOwners} onChange={(value) => setAccountForm((current) => ({ ...current, owner: value }))} />
                <Select label="Account type" value={accountForm.accountType} options={accountTypes} onChange={(value) => setAccountForm((current) => ({ ...current, accountType: value }))} />
              </div>
              <Input label="Account name" value={accountForm.accountName} onChange={(value) => setAccountForm((current) => ({ ...current, accountName: value }))} />
              <Input label="Institution" value={accountForm.institution} onChange={(value) => setAccountForm((current) => ({ ...current, institution: value }))} />
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Starting balance" type="number" step="0.01" value={accountForm.balance} onChange={(value) => setAccountForm((current) => ({ ...current, balance: value }))} />
                <Input label="Monthly contribution" type="number" step="0.01" value={accountForm.monthlyContribution} onChange={(value) => setAccountForm((current) => ({ ...current, monthlyContribution: value }))} />
              </div>
              <TextArea label="Notes" value={accountForm.notes} onChange={(value) => setAccountForm((current) => ({ ...current, notes: value }))} />
              <button className="w-full rounded-2xl bg-brand-500 px-4 py-3 font-semibold text-white transition hover:bg-brand-400">
                Add account
              </button>
            </form>
          </Panel>

          <Panel>
            <h3 className="text-xl font-semibold text-white">Tracked accounts</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">Tap an account to edit its holdings and inspect its income engine.</p>
            <div className="mt-5 space-y-3">
              {accounts.map((account) => {
                const active = account.id === selectedAccount?.id
                return (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => setSelectedAccountId(account.id)}
                    className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                      active ? 'border-brand-400 bg-brand-500/10' : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-white">{account.accountName}</p>
                        <p className="mt-1 text-sm text-slate-400">{account.owner} · {account.institution} · {account.accountType}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-200">{formatCurrency(account.balance)}</p>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <MetricCard label="Contribution" value={`${formatCurrency(account.monthlyContribution)}/mo`} />
                      <MetricCard label="Income" value={`${formatCurrencyPrecise(calculateAccountMonthlyIncome(account))}/mo`} />
                    </div>
                  </button>
                )
              })}
            </div>
          </Panel>
        </div>
      </section>

      <section id="accounts-holdings" className="space-y-5 scroll-mt-28">
        <Panel>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">{selectedAccount?.accountName ?? 'Select an account'}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {selectedAccount
                  ? `${selectedAccount.owner} · ${selectedAccount.institution} · ${selectedAccount.accountType}`
                  : 'Add or select an account to manage holdings.'}
              </p>
            </div>
            {selectedAccount ? (
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                {selectedAccount.holdings.length} holdings
              </span>
            ) : null}
          </div>

          {selectedAccount && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Balance" value={formatCurrency(selectedAccount.balance)} />
              <MetricCard label="Monthly contribution" value={formatCurrency(selectedAccount.monthlyContribution)} />
              <MetricCard label="Monthly income" value={formatCurrencyPrecise(calculateAccountMonthlyIncome(selectedAccount))} />
              <MetricCard label="Annual income" value={formatCurrency(calculateAccountMonthlyIncome(selectedAccount) * 12)} />
            </div>
          )}

          <form className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={submitHolding}>
            <Input label="Ticker" value={holdingForm.ticker} onChange={(value) => setHoldingForm((current) => ({ ...current, ticker: value }))} />
            <Input label="Holding name" value={holdingForm.holdingName} onChange={(value) => setHoldingForm((current) => ({ ...current, holdingName: value }))} />
            <Input label="Shares" type="number" step="0.0001" value={holdingForm.shares} onChange={(value) => setHoldingForm((current) => ({ ...current, shares: value }))} />
            <Input label="Market value" type="number" step="0.01" value={holdingForm.marketValue} onChange={(value) => setHoldingForm((current) => ({ ...current, marketValue: value }))} />
            <Input label="Annual yield %" type="number" step="0.01" value={holdingForm.annualYieldPercent} onChange={(value) => setHoldingForm((current) => ({ ...current, annualYieldPercent: value }))} />
            <Select label="Category" value={holdingForm.category} options={holdingCategories} onChange={(value) => setHoldingForm((current) => ({ ...current, category: value }))} />
            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 px-4 py-4 md:col-span-2 xl:col-span-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Estimated income relationship</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <MetricCard label="Monthly income" value={formatCurrencyPrecise(projectedHoldingIncome)} />
                <MetricCard label="Annual income" value={formatCurrency(projectedHoldingIncome * 12)} />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">Estimated monthly income = market value × annual yield % ÷ 12.</p>
            </div>
            <button className="rounded-2xl bg-brand-500 px-4 py-3 font-semibold text-white transition hover:bg-brand-400 md:col-span-2 xl:col-span-3">
              {editingHolding ? 'Save holding changes' : 'Add holding'}
            </button>
          </form>
        </Panel>

        <Panel>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">Portfolio holdings view</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">Monthly and annual holding income stay locked together for each owner, account, and category sleeve.</p>
            </div>
            <span className="rounded-full border border-slate-700 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-400">
              {holdings.length} holdings
            </span>
          </div>

          <div className="mt-5 hidden overflow-hidden rounded-3xl border border-slate-800 md:block">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
              <thead className="bg-slate-950/80 text-slate-400">
                <tr>
                  {['Owner', 'Account', 'Ticker', 'Holding Name', 'Category', 'Market Value', 'Yield %', 'Monthly Income', 'Annual Income', 'Action'].map((heading) => (
                    <th key={heading} className="px-4 py-3 font-medium">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/35">
                {holdings.map((holding) => (
                  <tr key={holding.id}>
                    <td className="px-4 py-4 text-white">{holding.owner}</td>
                    <td className="px-4 py-4 text-white">{holding.accountName}</td>
                    <td className="px-4 py-4 text-slate-200">{holding.ticker}</td>
                    <td className="px-4 py-4 text-slate-300">{holding.holdingName}</td>
                    <td className="px-4 py-4 text-slate-300">{holding.category}</td>
                    <td className="px-4 py-4 text-slate-200">{formatCurrency(holding.marketValue)}</td>
                    <td className="px-4 py-4 text-slate-200">{holding.annualYieldPercent}%</td>
                    <td className="px-4 py-4 text-slate-200">{formatCurrencyPrecise(holding.estimatedMonthlyIncome)}</td>
                    <td className="px-4 py-4 text-emerald-300">{formatCurrency(holding.annualIncome)}</td>
                    <td className="px-4 py-4">
                      {selectedAccount?.id === holding.accountId ? (
                        <button
                          type="button"
                          onClick={() => startEditHolding(holding)}
                          className="rounded-xl border border-brand-400/40 px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-brand-200 transition hover:border-brand-300 hover:text-white"
                        >
                          Edit
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500">Select account to edit</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 grid gap-3 md:hidden">
            {holdings.map((holding) => (
              <div key={holding.id} className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-white">{holding.ticker}</p>
                    <p className="mt-1 text-sm text-slate-400">{holding.holdingName}</p>
                  </div>
                  <span className="rounded-full bg-brand-500/10 px-2.5 py-1 text-[11px] font-semibold text-brand-200">{holding.category}</span>
                </div>
                <p className="mt-3 text-sm text-slate-400">{holding.owner} · {holding.accountName}</p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <MetricCard label="Market value" value={formatCurrency(holding.marketValue)} />
                  <MetricCard label="Yield" value={`${holding.annualYieldPercent}%`} />
                  <MetricCard label="Monthly income" value={formatCurrencyPrecise(holding.estimatedMonthlyIncome)} />
                  <MetricCard label="Annual income" value={formatCurrency(holding.annualIncome)} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section id="accounts-income-by-account" className="scroll-mt-28">
        <Panel>
          <h3 className="text-xl font-semibold text-white">Income by account</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">Monthly and annual income ranking across each household account.</p>
          <div className="mt-5 space-y-3">
            {incomeByAccount.map((account) => {
              const share = incomeByAccount[0]?.monthlyIncome ? (account.monthlyIncome / incomeByAccount[0].monthlyIncome) * 100 : 0
              return (
                <ProgressRow
                  key={account.id}
                  label={account.accountName}
                  caption={`${account.owner} · ${account.accountType}`}
                  value={formatCurrencyPrecise(account.monthlyIncome)}
                  subValue={formatCurrency(account.annualIncome)}
                  progress={share}
                />
              )
            })}
          </div>
        </Panel>
      </section>

      <section id="accounts-owner-breakdown" className="scroll-mt-28">
        <Panel>
          <h3 className="text-xl font-semibold text-white">Owner breakdown</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">Balance, contribution, and passive income distribution by owner sleeve.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {ownerGroups.map((group) => (
              <div key={group.owner} className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold text-white">{group.owner}</p>
                  <span className="rounded-full bg-brand-500/10 px-3 py-1 text-[11px] font-semibold text-brand-200">
                    {group.accountCount} accounts
                  </span>
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  <MetricCard label="Net worth" value={formatCurrency(group.totalBalance)} />
                  <MetricCard label="Monthly income" value={formatCurrencyPrecise(group.monthlyIncome)} />
                  <MetricCard label="Annual income" value={formatCurrency(group.annualIncome)} />
                  <MetricCard label="Contribution" value={formatCurrency(group.monthlyContributions)} />
                </div>
              </div>
            ))}
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

function MetricCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white sm:text-base">{value}</p>
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

function Input({ label, onChange, value, type = 'text', step }) {
  return (
    <label className="block space-y-2 text-sm text-slate-300">
      <span>{label}</span>
      <input
        type={type}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-0 transition focus:border-brand-400"
      />
    </label>
  )
}

function Select({ label, onChange, options, value }) {
  return (
    <label className="block space-y-2 text-sm text-slate-300">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-0 transition focus:border-brand-400"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function TextArea({ label, onChange, value }) {
  return (
    <label className="block space-y-2 text-sm text-slate-300">
      <span>{label}</span>
      <textarea
        rows="4"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-0 transition focus:border-brand-400"
      />
    </label>
  )
}
