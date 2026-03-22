const navItems = ['Dashboard', 'Accounts', 'CashFlow', 'Planner']

export function Sidebar({ currentPage, onNavigate }) {
  return (
    <aside className="flex min-h-screen w-full max-w-xs flex-col border-r border-slate-800 bg-slate-950/90 px-6 py-8">
      <div>
        <p className="text-sm uppercase tracking-[0.4em] text-brand-300">WealthOS</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Personal Financial Operating System</h1>
      </div>

      <nav className="mt-10 space-y-2">
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

      <div className="mt-auto rounded-3xl border border-brand-400/20 bg-brand-500/10 p-5 text-sm text-slate-200">
        <p className="font-semibold text-white">Net worth runway</p>
        <p className="mt-2 text-slate-300">Review allocation, income, and annual contribution targets in one workspace.</p>
      </div>
    </aside>
  )
}
