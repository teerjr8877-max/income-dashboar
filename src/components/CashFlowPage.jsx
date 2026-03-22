import { useMemo } from 'react'
import {
  accountOwners,
  cashFlowCategories,
  formatCurrency,
  summarizeCashFlowRows,
} from '../data/mockData'
import { Panel } from '../ui/Panel'

export function CashFlowPage({ cashFlow, setCashFlow }) {
  const incomeTotal = useMemo(() => cashFlow.income.reduce((sum, row) => sum + Number(row.amount), 0), [cashFlow.income])
  const expenseTotal = useMemo(() => cashFlow.expenses.reduce((sum, row) => sum + Number(row.amount), 0), [cashFlow.expenses])
  const monthlySurplus = incomeTotal - expenseTotal
  const annualSurplus = monthlySurplus * 12
  const incomeByOwner = summarizeCashFlowRows(cashFlow.income, 'owner')
  const expensesByCategory = summarizeCashFlowRows(cashFlow.expenses, 'category')

  const addRow = (type) => {
    setCashFlow((current) => ({
      ...current,
      [type]: [
        ...current[type],
        {
          id: Date.now(),
          label: '',
          amount: 0,
          owner: type === 'income' ? 'JR' : 'Joint',
          category: cashFlowCategories[type][0],
        },
      ],
    }))
  }

  const updateRow = (type, id, field, value) => {
    setCashFlow((current) => ({
      ...current,
      [type]: current[type].map((row) => (row.id === id ? { ...row, [field]: field === 'amount' ? Number(value) || 0 : value } : row)),
    }))
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Household Movement</p>
        <h2 className="mt-2 text-4xl font-semibold text-white">CashFlow</h2>
        <p className="mt-3 max-w-3xl text-slate-400">
          Run household income and expense operations with owner assignment, category visibility, and a clear read on
          monthly and annual surplus capacity.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-4">
        <SummaryCard title="Total monthly income" value={formatCurrency(incomeTotal)} detail={`Annualized ${formatCurrency(incomeTotal * 12)}`} />
        <SummaryCard title="Total monthly expenses" value={formatCurrency(expenseTotal)} detail={`Annualized ${formatCurrency(expenseTotal * 12)}`} />
        <SummaryCard title="Monthly surplus" value={formatCurrency(monthlySurplus)} detail="Income minus all monthly expenses" />
        <SummaryCard title="Annual surplus" value={formatCurrency(annualSurplus)} detail="Current monthly surplus annualized across 12 months" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-6">
          <CashFlowTable title="Income rows" rows={cashFlow.income} type="income" accent="emerald" onAddRow={addRow} onUpdateRow={updateRow} />
          <CashFlowTable title="Expense rows" rows={cashFlow.expenses} type="expenses" accent="rose" onAddRow={addRow} onUpdateRow={updateRow} />
        </div>

        <div className="space-y-6">
          <Panel>
            <h3 className="text-2xl font-semibold text-white">Income by owner</h3>
            <p className="mt-2 text-sm text-slate-400">Who is powering monthly household inflows right now.</p>
            <div className="mt-6 space-y-4">
              {incomeByOwner.map((item) => {
                const share = incomeTotal ? (item.amount / incomeTotal) * 100 : 0
                return <InsightRow key={item.label} label={item.label} amount={item.amount} progress={share} />
              })}
            </div>
          </Panel>

          <Panel>
            <h3 className="text-2xl font-semibold text-white">Expenses by category</h3>
            <p className="mt-2 text-sm text-slate-400">Where household cash is being allocated each month.</p>
            <div className="mt-6 space-y-4">
              {expensesByCategory.map((item) => {
                const share = expenseTotal ? (item.amount / expenseTotal) * 100 : 0
                return <InsightRow key={item.label} label={item.label} amount={item.amount} progress={share} />
              })}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}

function CashFlowTable({ title, rows, type, accent, onAddRow, onUpdateRow }) {
  return (
    <Panel>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm text-slate-400">Edit labels, owners, categories, and monthly values directly. Annualized values update automatically.</p>
        </div>
        <button
          type="button"
          onClick={() => onAddRow(type)}
          className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
            accent === 'emerald'
              ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200 hover:border-emerald-300'
              : 'border-rose-400/30 bg-rose-500/10 text-rose-200 hover:border-rose-300'
          }`}
        >
          Add row
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="grid gap-3 rounded-3xl border border-slate-800 bg-slate-950/60 p-4 md:grid-cols-2 xl:grid-cols-[1.2fr,0.7fr,0.7fr,0.8fr,0.8fr]">
            <label className="space-y-2 text-sm text-slate-300">
              <span>Label</span>
              <input
                value={row.label}
                onChange={(event) => onUpdateRow(type, row.id, 'label', event.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-brand-400"
              />
            </label>
            <SelectField label="Owner" value={row.owner} options={accountOwners} onChange={(value) => onUpdateRow(type, row.id, 'owner', value)} />
            <SelectField label="Category" value={row.category} options={cashFlowCategories[type]} onChange={(value) => onUpdateRow(type, row.id, 'category', value)} />
            <label className="space-y-2 text-sm text-slate-300">
              <span>Monthly</span>
              <input
                type="number"
                step="0.01"
                value={row.amount}
                onChange={(event) => onUpdateRow(type, row.id, 'amount', event.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-brand-400"
              />
            </label>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Annualized</p>
              <p className="mt-2 text-lg font-semibold text-white">{formatCurrency(Number(row.amount) * 12)}</p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function SummaryCard({ title, value, detail }) {
  return (
    <Panel>
      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{title}</p>
      <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-slate-300">{detail}</p>
    </Panel>
  )
}

function InsightRow({ label, amount, progress }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-lg font-semibold text-white">{label}</p>
        <p className="text-lg font-semibold text-white">{formatCurrency(amount)}</p>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-emerald-300" style={{ width: `${progress}%` }} />
      </div>
    </div>
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
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}
