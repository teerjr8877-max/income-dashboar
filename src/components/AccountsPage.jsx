import { useEffect, useMemo, useState } from 'react'
import {
  accountOwners,
  accountTypes,
  calculateAccountMonthlyIncome,
  calculateHoldingMonthlyIncome,
  formatCurrency,
  formatCurrencyPrecise,
  holdingCategories,
} from '../data/mockData'
import { Panel } from '../ui/Panel'

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

  const addAccount = (event) => {
    event.preventDefault()

    const nextAccount = {
      id: Date.now(),
      owner: accountForm.owner,
      accountName: accountForm.accountName.trim(),
      institution: accountForm.institution.trim(),
      accountType: accountForm.accountType,
      balance: Number(accountForm.balance),
      monthlyContribution: Number(accountForm.monthlyContribution),
      notes: accountForm.notes.trim(),
      holdings: [],
    }

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

        const holdings = editingHolding
          ? account.holdings.map((holding) => (holding.id === editingHolding.id ? parsedHolding : holding))
          : [...account.holdings, parsedHolding]

        const balance = holdings.reduce((sum, holding) => sum + Number(holding.marketValue), 0)

        return { ...account, holdings, balance }
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

  const projectedHoldingIncome = formatCurrencyPrecise(calculateHoldingMonthlyIncome(holdingForm))

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Accounts Engine</p>
        <h2 className="mt-2 text-4xl font-semibold text-white">Household Accounts</h2>
        <p className="mt-3 max-w-3xl text-slate-400">
          Manage each owner’s balance sheet with complete account records, realistic holdings, and automatic monthly income
          calculations per position.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr,1.45fr]">
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
              <Input label="Balance" type="number" step="0.01" value={accountForm.balance} onChange={(value) => setAccountForm((current) => ({ ...current, balance: value }))} />
              <Input
                label="Monthly contribution"
                type="number"
                step="0.01"
                value={accountForm.monthlyContribution}
                onChange={(value) => setAccountForm((current) => ({ ...current, monthlyContribution: value }))}
              />
            </div>
            <TextArea label="Notes" value={accountForm.notes} onChange={(value) => setAccountForm((current) => ({ ...current, notes: value }))} />
            <button className="w-full rounded-2xl bg-brand-500 px-4 py-3 font-semibold text-white transition hover:bg-brand-400">
              Add account
            </button>
          </form>

          <div className="mt-8 space-y-3">
            {accounts.map((account) => {
              const active = account.id === selectedAccount?.id
              return (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => setSelectedAccountId(account.id)}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
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
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Contribution {formatCurrency(account.monthlyContribution)}/mo</p>
                    <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Income {formatCurrencyPrecise(calculateAccountMonthlyIncome(account))}/mo</p>
                  </div>
                </button>
              )
            })}
          </div>
        </Panel>

        <Panel>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-white">{selectedAccount?.accountName ?? 'Select an account'}</h3>
              <p className="mt-1 text-sm text-slate-400">
                {selectedAccount
                  ? `${selectedAccount.owner} · ${selectedAccount.institution} · ${selectedAccount.accountType}`
                  : 'Add or select an account to manage holdings.'}
              </p>
            </div>
            {selectedAccount && (
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                {selectedAccount.holdings.length} holdings
              </span>
            )}
          </div>

          {selectedAccount && (
            <>
              <div className="mt-6 grid gap-4 lg:grid-cols-4">
                <MetricCard label="Balance" value={formatCurrency(selectedAccount.balance)} />
                <MetricCard label="Monthly contribution" value={formatCurrency(selectedAccount.monthlyContribution)} />
                <MetricCard label="Monthly income" value={formatCurrencyPrecise(calculateAccountMonthlyIncome(selectedAccount))} />
                <MetricCard label="Institution" value={selectedAccount.institution} />
              </div>
              <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Notes</p>
                <p className="mt-2 text-sm text-slate-300">{selectedAccount.notes}</p>
              </div>
            </>
          )}

          <form className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={submitHolding}>
            <Input label="Ticker" value={holdingForm.ticker} onChange={(value) => setHoldingForm((current) => ({ ...current, ticker: value }))} />
            <Input label="Holding name" value={holdingForm.holdingName} onChange={(value) => setHoldingForm((current) => ({ ...current, holdingName: value }))} />
            <Input label="Shares" type="number" step="0.0001" value={holdingForm.shares} onChange={(value) => setHoldingForm((current) => ({ ...current, shares: value }))} />
            <Input label="Market value" type="number" step="0.01" value={holdingForm.marketValue} onChange={(value) => setHoldingForm((current) => ({ ...current, marketValue: value }))} />
            <Input
              label="Annual yield percent"
              type="number"
              step="0.01"
              value={holdingForm.annualYieldPercent}
              onChange={(value) => setHoldingForm((current) => ({ ...current, annualYieldPercent: value }))}
            />
            <Select label="Category" value={holdingForm.category} options={holdingCategories} onChange={(value) => setHoldingForm((current) => ({ ...current, category: value }))} />
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 md:col-span-2 xl:col-span-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Estimated monthly income</p>
              <p className="mt-2 text-xl font-semibold text-white">{projectedHoldingIncome}</p>
              <p className="mt-1 text-sm text-slate-400">Automatically calculated from market value × annual yield % ÷ 12.</p>
            </div>
            <button className="rounded-2xl bg-brand-500 px-4 py-3 font-semibold text-white transition hover:bg-brand-400 md:col-span-2 xl:col-span-3">
              {editingHolding ? 'Save holding changes' : 'Add holding'}
            </button>
          </form>

          <div className="mt-8 overflow-x-auto rounded-3xl border border-slate-800">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
              <thead className="bg-slate-950/90 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Ticker</th>
                  <th className="px-4 py-3 font-medium">Holding</th>
                  <th className="px-4 py-3 font-medium">Shares</th>
                  <th className="px-4 py-3 font-medium">Market value</th>
                  <th className="px-4 py-3 font-medium">Yield</th>
                  <th className="px-4 py-3 font-medium">Est. monthly income</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                {selectedAccount?.holdings.map((holding) => (
                  <tr key={holding.id}>
                    <td className="px-4 py-4 font-semibold text-white">{holding.ticker}</td>
                    <td className="px-4 py-4 text-slate-300">{holding.holdingName}</td>
                    <td className="px-4 py-4 text-slate-300">{holding.shares}</td>
                    <td className="px-4 py-4 text-slate-300">{formatCurrency(holding.marketValue)}</td>
                    <td className="px-4 py-4 text-slate-300">{holding.annualYieldPercent}%</td>
                    <td className="px-4 py-4 text-slate-300">{formatCurrencyPrecise(holding.estimatedMonthlyIncome)}</td>
                    <td className="px-4 py-4 text-slate-300">{holding.category}</td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => startEditHolding(holding)}
                        className="rounded-xl border border-brand-400/40 px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-brand-200 transition hover:border-brand-300 hover:text-white"
                      >
                        Edit holding
                      </button>
                    </td>
                  </tr>
                ))}
                {!selectedAccount?.holdings.length && (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={8}>
                      No holdings yet. Add the first household position for this account using the form above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  )
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
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
