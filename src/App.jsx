import { useMemo, useState } from 'react'
import { AccountsPage } from './components/AccountsPage'
import { CashFlowPage } from './components/CashFlowPage'
import { DashboardPage } from './components/DashboardPage'
import { PlannerPage } from './components/PlannerPage'
import { Sidebar } from './components/Sidebar'
import { accountsSeed, cashFlowSeed, plannerGoalsSeed } from './data/mockData'

const pages = {
  Dashboard: DashboardPage,
  Accounts: AccountsPage,
  CashFlow: CashFlowPage,
  Planner: PlannerPage,
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('Dashboard')
  const [accounts, setAccounts] = useState(accountsSeed)
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
      <main className="flex-1 px-6 py-8 sm:px-8 lg:px-10">
        <CurrentPage {...pageProps} />
      </main>
    </div>
  )
}
