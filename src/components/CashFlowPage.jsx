import { useMemo } from 'react'
import { formatCurrency } from '../data/mockData'
import { Panel } from '../ui/Panel'

export function CashFlowPage({ cashFlow, setCashFlow }) {
  const incomeTotal = useMemo(
    () => cashFlow.income.reduce((sum, row) => sum + Number(row.amount), 0),
    [cashFlow.income],
  )
  const expenseTotal = useMemo(
    () => cashFlow.expenses.reduce((sum, row) => sum + Number(row.amount), 0),
    [cashFlow.expenses],
  )
  const monthlySurplus = incomeTotal - expenseTotal

  const addRow = (type) => {
    setCashFlow((current) => ({
      ...current,
      [type]: [...current[type], { id: Date.now(), label: '', amount: 0 }],
    }))
  }

  const updateRow = (type, id, field, value) => {
    setCashFlow((current) => ({
      ...current,
      [type]: current[type].map((row) =>
        row.id === id
          ? { ...row, [field]: field === 'amount' ? Number(value) || 0 : value }
          : row,
      ),
    }))
  }

  const summaryCards = [
    { title: 'Monthly income', monthly: incomeTotal },
    { title: 'Monthly expenses', monthly: expenseTotal },
    { title: 'Monthly surplus', monthly: monthlySurplus },
  ]

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Movement</p>
        <h2 className="mt-2 text-4xl font-semibold text-white">CashFlow</h2>
        <p className="mt-3 max-w-2xl text-slate-400">
          Maintain editable monthly inflows and outflows to understand surplus capacity and annualized household cash flow.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {summaryCards.map((item) => (
          <Panel key={item.title}>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{item.title}</p>
            <p className="mt-4 text-3xl font-semibold text-white">{formatCurrency(item.monthly)}</p>
            <p className="mt-2 text-slate-300">Annualized: {formatCurrency(item.monthly * 12)}</p>
          </Panel>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <CashFlowTable
          title="Income rows"
          rows={cashFlow.income}
          type="income"
          accent="emerald"
          onAddRow={addRow}
          onUpdateRow={updateRow}
        />
        <CashFlowTable
          title="Expense rows"
          rows={cashFlow.expenses}
          type="expenses"
          accent="rose"
          onAddRow={addRow}
          onUpdateRow={updateRow}
        />
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
          <p className="mt-2 text-sm text-slate-400">Edit row labels and monthly values directly. Annualized values update automatically.</p>
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
          <div key={row.id} className="grid gap-3 rounded-3xl border border-slate-800 bg-slate-950/60 p-4 md:grid-cols-[1.4fr,0.9fr,0.9fr]">
            <label className="space-y-2 text-sm text-slate-300">
              <span>Label</span>
              <input
                value={row.label}
                onChange={(event) => onUpdateRow(type, row.id, 'label', event.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-brand-400"
              />
            </label>
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
