const navItems = ['Dashboard', 'Accounts', 'CashFlow', 'Planner', 'Settings']

export function Sidebar({ currentPage, onNavigate, householdName, syncState, userEmail }) {
  return (
    <aside className="flex w-full flex-col border-r border-slate-800 bg-slate-950/90 px-4 py-6 lg:min-h-screen lg:max-w-xs lg:px-6 lg:py-8">
      <div>
        <p className="text-sm uppercase tracking-[0.4em] text-brand-300">WealthOS Shared</p>
        <h1 className="mt-3 text-2xl font-semibold text-white lg:text-3xl">{householdName}</h1>
        <p className="mt-2 text-sm text-slate-400">{userEmail}</p>
      </div>

      <nav className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {navItems.map((item) => {
          const active = item === currentPage
          return (
            <button key={item} type="button" onClick={() => onNavigate(item)} className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${active ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'bg-slate-900/50 text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
              <span>{item}</span>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">View</span>
            </button>
          )
        })}
      </nav>

      <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/60 p-5 text-sm text-slate-200 lg:mt-auto">
        <p className="font-semibold text-white">Sync status</p>
        <p className="mt-2 text-slate-300">{syncState.label}</p>
        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">Autosave + local fallback enabled</p>
      </div>
    </aside>
  )
}
