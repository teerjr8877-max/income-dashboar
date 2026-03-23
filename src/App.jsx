import { useMemo, useState } from 'react'
import { AccountsPage } from './components/AccountsPage'
import { BottomNav } from './components/BottomNav'
import { CashFlowPage } from './components/CashFlowPage'
import { DashboardPage } from './components/DashboardPage'
import { PlannerPage } from './components/PlannerPage'
import { Sidebar } from './components/Sidebar'
import { accountsSeed, cashFlowSeed, normalizeAccount, plannerGoalsSeed } from './data/mockData'

const pages = {
  Dashboard: DashboardPage,
  Accounts: AccountsPage,
  CashFlow: CashFlowPage,
  Planner: PlannerPage,
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('Dashboard')
  const [accounts, setAccounts] = useState(accountsSeed.map(normalizeAccount))
  const [cashFlow, setCashFlow] = useState(cashFlowSeed)
  const [goals, setGoals] = useState(plannerGoalsSeed)

  const CurrentPage = pages[currentPage]

  const pageProps = useMemo(
    () => ({
      accounts,
      setAccounts,
      cashFlow,
      setCashFlow,
      goals,
      setGoals,
    }),
    [accounts, cashFlow, goals],
  )

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 lg:flex">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="wealth-main flex-1 px-4 pb-28 pt-4 sm:px-5 sm:pt-5 lg:px-8 lg:pb-10 lg:pt-8">
        <div className="mx-auto w-full max-w-7xl">
          <CurrentPage {...pageProps} />
        </div>
      </main>
      <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  )
}
