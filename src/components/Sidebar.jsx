const navItems = ['Dashboard', 'Accounts', 'CashFlow', 'Planner']

export function Sidebar({ currentPage, onNavigate }) {
  return (
    <aside className="hidden min-h-screen w-full max-w-[290px] flex-col border-r border-slate-800/80 bg-slate-950/90 px-6 py-8 lg:flex">
      <div>
        <p className="text-sm uppercase tracking-[0.4em] text-brand-300">WealthOS</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Premium Household Wealth Operating System</h1>
        <p className="mt-4 text-sm leading-6 text-slate-400">
          Mobile-first FIRE command center for household net worth, passive income, cash flow, and planning.
        </p>
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
                  : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{item}</span>
              <span className="text-xs uppercase tracking-[0.22em] text-slate-400">Open</span>
            </button>
          )
        })}
      </nav>

      <div className="mt-auto rounded-[28px] border border-brand-400/20 bg-brand-500/10 p-5 text-sm text-slate-200">
        <p className="font-semibold text-white">Income engine online</p>
        <p className="mt-2 leading-6 text-slate-300">
          FIRE math, income segmentation, and account-level control all stay connected to the same demo household portfolio.
        </p>
      </div>
    </aside>
  )
}
