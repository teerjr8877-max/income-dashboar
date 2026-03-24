import { html, useEffect, useMemo, useState } from './lib/react.js'
import { AccountsPage } from './components/AccountsPage.jsx'
import { BottomNav } from './components/BottomNav.jsx'
import { CashFlowPage } from './components/CashFlowPage.jsx'
import { DashboardPage } from './components/DashboardPage.jsx'
import { PlannerPage } from './components/PlannerPage.jsx'
import { Sidebar } from './components/Sidebar.jsx'
import { usePersistentAppData } from './hooks/usePersistentAppData.js'

const CURRENT_PAGE_STORAGE_KEY = 'wealthos.current-page.v1'
const pages = { Dashboard: DashboardPage, Accounts: AccountsPage, CashFlow: CashFlowPage, Planner: PlannerPage }

export default function App() {
  const { appData, setAppData, saveState, lastSavedAt, resetToDemoData } = usePersistentAppData()
  const [currentPage, setCurrentPage] = useState(() => {
    try {
      return window.sessionStorage.getItem(CURRENT_PAGE_STORAGE_KEY) ?? 'Dashboard'
    } catch {
      return 'Dashboard'
    }
  })

  useEffect(() => {
    try {
      window.sessionStorage.setItem(CURRENT_PAGE_STORAGE_KEY, currentPage)
    } catch (error) {
      console.error('Failed to persist current page in sessionStorage.', error)
    }
  }, [currentPage])

  const accounts = Array.isArray(appData?.accounts) ? appData.accounts : []
  const cashFlow = appData?.cashFlow ?? { income: [], expenses: [] }
  const goals = Array.isArray(appData?.goals) ? appData.goals : []
  const CurrentPage = pages[currentPage] ?? DashboardPage

  const pageProps = useMemo(() => ({
    accounts,
    setAccounts: (updater) => setAppData((current) => ({ ...current, accounts: typeof updater === 'function' ? updater(Array.isArray(current.accounts) ? current.accounts : []) : updater })),
    cashFlow,
    setCashFlow: (updater) => setAppData((current) => ({ ...current, cashFlow: typeof updater === 'function' ? updater(current.cashFlow ?? { income: [], expenses: [] }) : updater })),
    goals,
    setGoals: (updater) => setAppData((current) => ({ ...current, goals: typeof updater === 'function' ? updater(Array.isArray(current.goals) ? current.goals : []) : updater })),
  }), [accounts, cashFlow, goals, setAppData])

  const handleResetDemoData = () => window.confirm('Reset all local WealthOS data back to the demo portfolio?') && resetToDemoData()
  const handleExportData = () => {
    try {
      const blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' })
      const objectUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = `wealthos-export-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
      link.click()
      window.URL.revokeObjectURL(objectUrl)
    } catch (error) {
      console.error('Failed to export app data.', error)
    }
  }

  return html`<div className="min-h-screen bg-slate-950 text-slate-100 lg:flex"><${Sidebar} currentPage=${currentPage} onNavigate=${setCurrentPage} saveState=${saveState} lastSavedAt=${lastSavedAt} onResetDemoData=${handleResetDemoData} onExportData=${handleExportData} /><main className="wealth-main flex-1 px-6 py-8 sm:px-8 lg:px-10 lg:pb-8"><${CurrentPage} accounts=${pageProps.accounts} setAccounts=${pageProps.setAccounts} cashFlow=${pageProps.cashFlow} setCashFlow=${pageProps.setCashFlow} goals=${pageProps.goals} setGoals=${pageProps.setGoals} /></main><${BottomNav} currentPage=${currentPage} onNavigate=${setCurrentPage} /></div>`
}
