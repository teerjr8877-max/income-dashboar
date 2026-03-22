import { useState } from 'react'
import { AccountsPage } from './components/AccountsPage'
import { CashFlowPage } from './components/CashFlowPage'
import { DashboardPage } from './components/DashboardPage'
import { PlannerPage } from './components/PlannerPage'
import { Sidebar } from './components/Sidebar'

const pages = {
  Dashboard: DashboardPage,
  Accounts: AccountsPage,
  CashFlow: CashFlowPage,
  Planner: PlannerPage,
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('Dashboard')
  const CurrentPage = pages[currentPage]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 lg:flex">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 px-6 py-8 sm:px-8 lg:px-10">
        <CurrentPage />
      </main>
    </div>
  )
}
