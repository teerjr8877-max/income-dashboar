import { useEffect, useMemo, useState } from 'react'
import { AccountsPage } from './components/AccountsPage'
import { CashFlowPage } from './components/CashFlowPage'
import { DashboardPage } from './components/DashboardPage'
import { PlannerPage } from './components/PlannerPage'
import { Sidebar } from './components/Sidebar'
import { usePersistentAppData } from './hooks/usePersistentAppData'

const pages = {
  Dashboard: DashboardPage,
  Accounts: AccountsPage,
  CashFlow: CashFlowPage,
  Planner: PlannerPage,
}

export default function App() {
  const {
    appData,
    setAppData,
    saveState,
    lastSavedAt,
    resetToDemoData,
  } = usePersistentAppData()
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window === 'undefined') return 'Dashboard'
    return window.sessionStorage.getItem('wealthos.current-page') ?? 'Dashboard'
  })

  useEffect(() => {
    window.sessionStorage.setItem('wealthos.current-page', currentPage)
  }, [currentPage])

  const { accounts, cashFlow, goals } = appData
  const CurrentPage = pages[currentPage] ?? DashboardPage

  const pageProps = useMemo(
    () => ({
      accounts,
      setAccounts: (updater) => setAppData((current) => ({
        ...current,
        accounts: typeof updater === 'function' ? updater(current.accounts) : updater,
      })),
      cashFlow,
      setCashFlow: (updater) => setAppData((current) => ({
        ...current,
        cashFlow: typeof updater === 'function' ? updater(current.cashFlow) : updater,
      })),
      goals,
      setGoals: (updater) => setAppData((current) => ({
        ...current,
        goals: typeof updater === 'function' ? updater(current.goals) : updater,
      })),
    }),
    [accounts, cashFlow, goals, setAppData],
  )

  const handleResetDemoData = () => {
    if (window.confirm('Reset all local WealthOS data back to the demo portfolio?')) {
      resetToDemoData()
    }
  }

  const handleExportData = () => {
    const blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' })
    const objectUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

    link.href = objectUrl
    link.download = `wealthos-export-${timestamp}.json`
    link.click()
    window.URL.revokeObjectURL(objectUrl)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 lg:flex">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        saveState={saveState}
        lastSavedAt={lastSavedAt}
        onResetDemoData={handleResetDemoData}
        onExportData={handleExportData}
      />
      <main className="flex-1 px-6 py-8 pb-28 sm:px-8 lg:px-10 lg:pb-8">
        <CurrentPage {...pageProps} />
      </main>
    </div>
  )
}
