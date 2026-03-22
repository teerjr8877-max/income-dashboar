import { useMemo, useState } from 'react'
import { accountsSeed } from '../data/mockData'
import { Panel } from '../ui/Panel'

const emptyAccount = {
  name: '',
  institution: '',
  type: 'Brokerage',
}

const emptyHolding = {
  symbol: '',
  name: '',
  shares: '',
  value: '',
}

export function AccountsPage() {
  const [accounts, setAccounts] = useState(accountsSeed)
  const [accountForm, setAccountForm] = useState(emptyAccount)
  const [selectedAccountId, setSelectedAccountId] = useState(accountsSeed[0]?.id ?? null)
  const [holdingForm, setHoldingForm] = useState(emptyHolding)
  const [editingHolding, setEditingHolding] = useState(null)

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === selectedAccountId) ?? accounts[0],
    [accounts, selectedAccountId],
  )

  const addAccount = (event) => {
    event.preventDefault()
    const nextAccount = {
      id: Date.now(),
      ...accountForm,
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
      symbol: holdingForm.symbol.trim().toUpperCase(),
      name: holdingForm.name.trim(),
      shares: Number(holdingForm.shares),
      value: Number(holdingForm.value),
    }

    setAccounts((current) =>
      current.map((account) => {
        if (account.id !== selectedAccount.id) return account

        const holdings = editingHolding
          ? account.holdings.map((holding) => (holding.id === editingHolding.id ? parsedHolding : holding))
          : [...account.holdings, parsedHolding]

        return { ...account, holdings }
      }),
    )

    setHoldingForm(emptyHolding)
    setEditingHolding(null)
  }

  const startEditHolding = (holding) => {
    setEditingHolding(holding)
    setHoldingForm({
      symbol: holding.symbol,
      name: holding.name,
      shares: String(holding.shares),
      value: String(holding.value),
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Manage</p>
        <h2 className="mt-2 text-4xl font-semibold text-white">Accounts</h2>
        <p className="mt-3 max-w-2xl text-slate-400">
          Add accounts, track holdings, and edit positions without leaving the WealthOS workspace.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,1.4fr]">
        <Panel>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Add account</h3>
            <span className="text-sm text-slate-400">{accounts.length} total</span>
          </div>

          <form className="mt-6 space-y-4" onSubmit={addAccount}>
            <Input label="Account name" value={accountForm.name} onChange={(value) => setAccountForm((current) => ({ ...current, name: value }))} />
            <Input label="Institution" value={accountForm.institution} onChange={(value) => setAccountForm((current) => ({ ...current, institution: value }))} />
            <label className="block space-y-2 text-sm text-slate-300">
              <span>Type</span>
              <select
                value={accountForm.type}
                onChange={(event) => setAccountForm((current) => ({ ...current, type: event.target.value }))}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-0 transition focus:border-brand-400"
              >
                <option>Brokerage</option>
                <option>Retirement</option>
                <option>Cash</option>
                <option>Crypto</option>
              </select>
            </label>
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
                  <p className="font-medium text-white">{account.name}</p>
                  <p className="mt-1 text-sm text-slate-400">{account.institution} · {account.type}</p>
                </button>
              )
            })}
          </div>
        </Panel>

        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-white">{selectedAccount?.name ?? 'Select an account'}</h3>
              <p className="mt-1 text-sm text-slate-400">
                Add holdings or update existing positions for the selected account.
              </p>
            </div>
            {selectedAccount && (
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                {selectedAccount.holdings.length} holdings
              </span>
            )}
          </div>

          <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={submitHolding}>
            <Input label="Ticker / symbol" value={holdingForm.symbol} onChange={(value) => setHoldingForm((current) => ({ ...current, symbol: value }))} />
            <Input label="Holding name" value={holdingForm.name} onChange={(value) => setHoldingForm((current) => ({ ...current, name: value }))} />
            <Input label="Shares" type="number" value={holdingForm.shares} onChange={(value) => setHoldingForm((current) => ({ ...current, shares: value }))} />
            <Input label="Market value" type="number" value={holdingForm.value} onChange={(value) => setHoldingForm((current) => ({ ...current, value: value }))} />
            <button className="rounded-2xl bg-brand-500 px-4 py-3 font-semibold text-white transition hover:bg-brand-400 md:col-span-2">
              {editingHolding ? 'Save holding changes' : 'Add holding'}
            </button>
          </form>

          <div className="mt-8 overflow-hidden rounded-3xl border border-slate-800">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
              <thead className="bg-slate-950/90 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Symbol</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Shares</th>
                  <th className="px-4 py-3 font-medium">Value</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                {selectedAccount?.holdings.map((holding) => (
                  <tr key={holding.id}>
                    <td className="px-4 py-4 font-semibold text-white">{holding.symbol}</td>
                    <td className="px-4 py-4 text-slate-300">{holding.name}</td>
                    <td className="px-4 py-4 text-slate-300">{holding.shares}</td>
                    <td className="px-4 py-4 text-slate-300">${holding.value.toLocaleString()}</td>
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
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  )
}

function Input({ label, onChange, value, type = 'text' }) {
  return (
    <label className="block space-y-2 text-sm text-slate-300">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-0 transition focus:border-brand-400"
      />
    </label>
  )
}
