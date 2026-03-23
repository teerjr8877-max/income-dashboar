const navIcons = {
  Dashboard: (
    <path d="M4 12.75A2.75 2.75 0 0 1 6.75 10h2.5A2.75 2.75 0 0 1 12 12.75v6.5A2.75 2.75 0 0 1 9.25 22h-2.5A2.75 2.75 0 0 1 4 19.25zm8-8A2.75 2.75 0 0 1 14.75 2h2.5A2.75 2.75 0 0 1 20 4.75v14.5A2.75 2.75 0 0 1 17.25 22h-2.5A2.75 2.75 0 0 1 12 19.25zm-8-1A2.75 2.75 0 0 1 6.75 1h2.5A2.75 2.75 0 0 1 12 3.75v2.5A2.75 2.75 0 0 1 9.25 9h-2.5A2.75 2.75 0 0 1 4 6.25z" />
  ),
  Accounts: (
    <path d="M4 5.75A2.75 2.75 0 0 1 6.75 3h10.5A2.75 2.75 0 0 1 20 5.75v2.5A2.75 2.75 0 0 1 17.25 11H6.75A2.75 2.75 0 0 1 4 8.25zm0 9A2.75 2.75 0 0 1 6.75 12h10.5A2.75 2.75 0 0 1 20 14.75v2.5A2.75 2.75 0 0 1 17.25 20H6.75A2.75 2.75 0 0 1 4 17.25z" />
  ),
  CashFlow: (
    <path d="M12 2a1 1 0 0 1 1 1v1.12c3.39.49 6 2.23 6 5.13 0 3.18-3.07 4.4-6.26 5.11-2.59.58-4.24 1.05-4.24 2.39 0 1.25 1.46 2.06 3.58 2.06 2.1 0 3.85-.76 4.9-1.53a1 1 0 1 1 1.14 1.65c-1.16.8-2.98 1.59-5.12 1.81V21a1 1 0 1 1-2 0v-1.2C7.72 19.42 5 17.53 5 14.65c0-3.18 3.04-4.42 6.23-5.14 2.61-.58 4.27-1.03 4.27-2.36 0-1.33-1.56-2.15-3.69-2.15-1.78 0-3.27.52-4.43 1.31A1 1 0 1 1 6.3 4.67c1.19-.8 2.82-1.4 4.7-1.56V3a1 1 0 0 1 1-1" />
  ),
  Planner: (
    <path d="M6.75 3A2.75 2.75 0 0 0 4 5.75v12.5A2.75 2.75 0 0 0 6.75 21h10.5A2.75 2.75 0 0 0 20 18.25V5.75A2.75 2.75 0 0 0 17.25 3zm.75 5a1 1 0 0 1 1-1h7a1 1 0 1 1 0 2h-7a1 1 0 0 1-1-1m0 4a1 1 0 0 1 1-1h7a1 1 0 1 1 0 2h-7a1 1 0 0 1-1-1m1 3h4a1 1 0 1 1 0 2h-4a1 1 0 1 1 0-2" />
  ),
}

export function BottomNav({ currentPage, onNavigate }) {
  return (
    <nav className="mobile-bottom-nav lg:hidden">
      <div className="grid grid-cols-4 gap-1 rounded-t-3xl border border-slate-800/80 bg-slate-950/95 px-3 pb-[calc(0.9rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-20px_60px_rgba(2,6,23,0.7)] backdrop-blur-xl">
        {Object.entries(navIcons).map(([label, icon]) => {
          const active = label === currentPage
          return (
            <button
              key={label}
              type="button"
              onClick={() => onNavigate(label)}
              className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition ${
                active
                  ? 'bg-brand-500/15 text-white'
                  : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-100'
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className={`h-5 w-5 ${active ? 'text-brand-200' : 'text-slate-500'}`}
                aria-hidden="true"
              >
                {icon}
              </svg>
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
