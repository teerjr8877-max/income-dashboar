import { accountsSeed, cashFlowSeed, plannerGoalsSeed } from './mockData.js'

export const APP_DATA_VERSION = 1

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeString(value, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function normalizeDistribution(distribution) {
  if (!Array.isArray(distribution) || distribution.length !== 12) {
    return Array(12).fill(1 / 12)
  }

  const normalized = distribution.map((value) => Math.max(normalizeNumber(value, 0), 0))
  const total = normalized.reduce((sum, value) => sum + value, 0)

  if (!total) {
    return Array(12).fill(1 / 12)
  }

  return normalized.map((value) => Number((value / total).toFixed(6)))
}

function normalizeHolding(rawHolding, fallbackHolding, index) {
  // Guardrail: each holding must keep a stable numeric id and the normalized shape expected by portfolio planners.
  const id = normalizeNumber(rawHolding?.id, normalizeNumber(fallbackHolding?.id, index + 1))
  const marketValue = normalizeNumber(rawHolding?.marketValue, normalizeNumber(fallbackHolding?.marketValue, 0))

  return {
    id,
    ticker: normalizeString(rawHolding?.ticker, normalizeString(fallbackHolding?.ticker, 'UNKNOWN')),
    holdingName: normalizeString(rawHolding?.holdingName, normalizeString(fallbackHolding?.holdingName, 'Unnamed Holding')),
    shares: normalizeNumber(rawHolding?.shares, normalizeNumber(fallbackHolding?.shares, 0)),
    marketValue,
    costBasis: normalizeNumber(rawHolding?.costBasis, marketValue),
    annualYieldPercent: normalizeNumber(rawHolding?.annualYieldPercent, normalizeNumber(fallbackHolding?.annualYieldPercent, 0)),
    estimatedMonthlyIncome: normalizeNumber(rawHolding?.estimatedMonthlyIncome, normalizeNumber(fallbackHolding?.estimatedMonthlyIncome, 0)),
    category: normalizeString(rawHolding?.category, normalizeString(fallbackHolding?.category, 'Other')),
    monthlyDistribution: normalizeDistribution(rawHolding?.monthlyDistribution ?? fallbackHolding?.monthlyDistribution),
  }
}

function normalizeAccount(rawAccount, fallbackAccount, index) {
  // Guardrail: each account must preserve numeric id + holdings[] so downstream totals and planner assumptions stay valid.
  const fallbackHoldings = Array.isArray(fallbackAccount?.holdings) ? fallbackAccount.holdings : []
  const rawHoldings = Array.isArray(rawAccount?.holdings) ? rawAccount.holdings : fallbackHoldings

  return {
    id: normalizeNumber(rawAccount?.id, normalizeNumber(fallbackAccount?.id, index + 1)),
    owner: normalizeString(rawAccount?.owner, normalizeString(fallbackAccount?.owner, 'Joint')),
    accountName: normalizeString(rawAccount?.accountName, normalizeString(fallbackAccount?.accountName, 'Account')),
    institution: normalizeString(rawAccount?.institution, normalizeString(fallbackAccount?.institution, 'Unknown')),
    accountType: normalizeString(rawAccount?.accountType, normalizeString(fallbackAccount?.accountType, 'Other')),
    balance: normalizeNumber(rawAccount?.balance, normalizeNumber(fallbackAccount?.balance, 0)),
    monthlyContribution: normalizeNumber(rawAccount?.monthlyContribution, normalizeNumber(fallbackAccount?.monthlyContribution, 0)),
    notes: normalizeString(rawAccount?.notes, normalizeString(fallbackAccount?.notes, '')),
    holdings: rawHoldings.map((holding, holdingIndex) => normalizeHolding(holding, fallbackHoldings[holdingIndex], holdingIndex)),
  }
}

function normalizeCashFlowItem(rawItem, fallbackItem, index) {
  return {
    id: normalizeNumber(rawItem?.id, normalizeNumber(fallbackItem?.id, index + 1)),
    label: normalizeString(rawItem?.label, normalizeString(fallbackItem?.label, 'Untitled')),
    amount: normalizeNumber(rawItem?.amount, normalizeNumber(fallbackItem?.amount, 0)),
    owner: normalizeString(rawItem?.owner, normalizeString(fallbackItem?.owner, 'Joint')),
    category: normalizeString(rawItem?.category, normalizeString(fallbackItem?.category, 'Other')),
  }
}

function normalizeGoal(rawGoal, fallbackGoal, index) {
  return {
    id: normalizeNumber(rawGoal?.id, normalizeNumber(fallbackGoal?.id, index + 1)),
    title: normalizeString(rawGoal?.title, normalizeString(fallbackGoal?.title, 'Untitled Goal')),
    targetAmount: normalizeNumber(rawGoal?.targetAmount, normalizeNumber(fallbackGoal?.targetAmount, 0)),
    currentAmount: normalizeNumber(rawGoal?.currentAmount, normalizeNumber(fallbackGoal?.currentAmount, 0)),
    monthlyContribution: normalizeNumber(rawGoal?.monthlyContribution, normalizeNumber(fallbackGoal?.monthlyContribution, 0)),
  }
}

export function createDemoAppData() {
  return {
    version: APP_DATA_VERSION,
    accounts: structuredClone(accountsSeed),
    cashFlow: structuredClone(cashFlowSeed),
    goals: structuredClone(plannerGoalsSeed),
  }
}

export function normalizeAppData(rawData) {
  const demoData = createDemoAppData()

  if (!rawData || typeof rawData !== 'object') {
    return demoData
  }

  const rawAccounts = Array.isArray(rawData.accounts) ? rawData.accounts : demoData.accounts
  const rawIncome = Array.isArray(rawData.cashFlow?.income) ? rawData.cashFlow.income : demoData.cashFlow.income
  const rawExpenses = Array.isArray(rawData.cashFlow?.expenses) ? rawData.cashFlow.expenses : demoData.cashFlow.expenses
  const rawGoals = Array.isArray(rawData.goals) ? rawData.goals : demoData.goals

  return {
    version: APP_DATA_VERSION,
    // Canonical normalized model: accounts[] + cashFlow{income[],expenses[]} + goals[] must always exist.
    accounts: rawAccounts.map((account, index) => normalizeAccount(account, demoData.accounts[index], index)),
    cashFlow: {
      income: rawIncome.map((item, index) => normalizeCashFlowItem(item, demoData.cashFlow.income[index], index)),
      expenses: rawExpenses.map((item, index) => normalizeCashFlowItem(item, demoData.cashFlow.expenses[index], index)),
    },
    goals: rawGoals.map((goal, index) => normalizeGoal(goal, demoData.goals[index], index)),
  }
}
