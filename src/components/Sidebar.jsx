const navItems = ['Dashboard', 'Accounts', 'CashFlow', 'Planner']

function formatSavedTimestamp(lastSavedAt) {
  if (!(lastSavedAt instanceof Date) || Number.isNaN(lastSavedAt.getTime())) {
    return 'Saved locally'
  }

  return `Saved ${lastSavedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
}

export function Sidebar({
  currentPage,
  onNavigate,
  onResetDemoData,
  onExportData,
  saveState,
  lastSavedAt,
}) {
  const saveLabel = saveState === 'saving' ? 'Saving…' : formatSavedTimestamp(lastSavedAt)

  return (
    <>
      <aside className="flex w-full flex-col border-b border-slate-800 bg-slate-950/90 px-6 py-8 lg:min-h-screen lg:max-w-xs lg:border-b-0 lg:border-r">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-brand-300">WealthOS V2</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Household Wealth Operating System</h1>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-slate-200">
          <span className={`inline-flex h-2.5 w-2.5 rounded-full ${saveState === 'saving' ? 'bg-amber-300' : 'bg-emerald-300'}`} />
          <span className="font-medium text-white">{saveLabel}</span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <button
            type="button"
            onClick={onExportData}
            className="rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:text-white"
          >
            Export data
          </button>
          <button
            type="button"
            onClick={onResetDemoData}
            className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-100 transition hover:border-rose-300 hover:text-white"
          >
            Reset demo data
          </button>
        </div>

        <nav className="mt-10 hidden space-y-2 lg:block">
          {navItems.map((item) => {
            const active = item === currentPage
            return (
              <button
                key={item}
                type="button"
                onClick={() => onNavigate(item)}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                  active
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                    : 'bg-slate-900/50 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{item}</span>
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">View</span>
              </button>
            )
          })}
        </nav>

        <div className="mt-8 rounded-3xl border border-brand-400/20 bg-brand-500/10 p-5 text-sm text-slate-200 lg:mt-auto">
          <p className="font-semibold text-white">Household command center</p>
          <p className="mt-2 text-slate-300">
            Monitor net worth, contributions, cash flow, and household goals with autosave, local persistence,
            and one-tap exports.
          </p>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-3xl grid-cols-4 gap-2">
          {navItems.map((item) => {
            const active = item === currentPage
            return (
              <button
                key={item}
                type="button"
                onClick={() => onNavigate(item)}
                className={`rounded-2xl px-3 py-3 text-center text-xs font-semibold transition ${
                  active ? 'bg-brand-500 text-white' : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item}
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
