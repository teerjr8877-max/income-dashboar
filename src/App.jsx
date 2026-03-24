import { useEffect, useMemo, useState } from 'react'
import { AccountsPage } from './components/AccountsPage'
import { CashFlowPage } from './components/CashFlowPage'
import { DashboardPage } from './components/DashboardPage'
import { PlannerPage } from './components/PlannerPage'
import { accountsSeed, cashFlowSeed, plannerGoalsSeed } from './data/mockData'
import { createPlannerScenarios, FIRE_STORAGE_KEY } from './lib/firePlanner'
import { Sidebar } from './components/Sidebar'

const pages = {
  Dashboard: DashboardPage,
  Accounts: AccountsPage,
  CashFlow: CashFlowPage,
  Planner: PlannerPage,
}

function buildDefaultState() {
  const baseAccounts = accountsSeed
  const baseCashFlow = cashFlowSeed

  return {
    accounts: baseAccounts,
    cashFlow: baseCashFlow,
    goals: plannerGoalsSeed,
    plannerScenarios: createPlannerScenarios(
      {
        totalInvestedAssets: baseAccounts
          .filter((account) => !['Savings', 'Cash'].includes(account.accountType))
          .reduce((sum, account) => sum + Number(account.balance), 0),
        monthlyPortfolioIncome: baseAccounts.reduce(
          (sum, account) => sum + account.holdings.reduce((holdingSum, holding) => holdingSum + Number(holding.estimatedMonthlyIncome || 0), 0),
          0,
        ),
        monthlyHouseholdContributions: baseAccounts.reduce((sum, account) => sum + Number(account.monthlyContribution), 0),
      },
      baseCashFlow,
    ),
  }
}

function loadInitialState() {
  if (typeof window === 'undefined') return buildDefaultState()

  const fallback = buildDefaultState()

  try {
    const stored = window.localStorage.getItem(FIRE_STORAGE_KEY)
    if (!stored) return fallback

    const parsed = JSON.parse(stored)
    return {
      accounts: parsed.accounts ?? fallback.accounts,
      cashFlow: parsed.cashFlow ?? fallback.cashFlow,
      goals: parsed.goals ?? fallback.goals,
      plannerScenarios: parsed.plannerScenarios?.length ? parsed.plannerScenarios : fallback.plannerScenarios,
    }
  } catch {
    return fallback
  }
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('Dashboard')
  const [appState, setAppState] = useState(loadInitialState)

  const { accounts, cashFlow, goals, plannerScenarios } = appState

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(FIRE_STORAGE_KEY, JSON.stringify(appState))
  }, [appState])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const syncFromStorage = (event) => {
      if (event.key !== FIRE_STORAGE_KEY || !event.newValue) return

      try {
        const nextState = JSON.parse(event.newValue)
        setAppState((current) => ({
          accounts: nextState.accounts ?? current.accounts,
          cashFlow: nextState.cashFlow ?? current.cashFlow,
          goals: nextState.goals ?? current.goals,
          plannerScenarios: nextState.plannerScenarios ?? current.plannerScenarios,
        }))
      } catch {
        // no-op if another tab writes malformed state
      }
    }

    window.addEventListener('storage', syncFromStorage)
    return () => window.removeEventListener('storage', syncFromStorage)
  }, [])

  const CurrentPage = pages[currentPage]

  const pageProps = useMemo(
    () => ({
      accounts,
      setAccounts: (value) => setAppState((current) => ({ ...current, accounts: typeof value === 'function' ? value(current.accounts) : value })),
      cashFlow,
      setCashFlow: (value) => setAppState((current) => ({ ...current, cashFlow: typeof value === 'function' ? value(current.cashFlow) : value })),
      goals,
      setGoals: (value) => setAppState((current) => ({ ...current, goals: typeof value === 'function' ? value(current.goals) : value })),
      plannerScenarios,
      setPlannerScenarios: (value) =>
        setAppState((current) => ({
          ...current,
          plannerScenarios: typeof value === 'function' ? value(current.plannerScenarios) : value,
        })),
    }),
    [accounts, cashFlow, goals, plannerScenarios],
  )

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 lg:flex">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 px-4 py-6 sm:px-8 lg:px-10">
        <CurrentPage {...pageProps} />
      </main>
    </div>
  )
}
