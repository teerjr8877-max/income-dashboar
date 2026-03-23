import { accountsSeed, cashFlowSeed, plannerGoalsSeed } from './mockData'

export const APP_DATA_VERSION = 1

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

  return {
    version: APP_DATA_VERSION,
    accounts: Array.isArray(rawData.accounts) ? rawData.accounts : demoData.accounts,
    cashFlow: {
      income: Array.isArray(rawData.cashFlow?.income) ? rawData.cashFlow.income : demoData.cashFlow.income,
      expenses: Array.isArray(rawData.cashFlow?.expenses) ? rawData.cashFlow.expenses : demoData.cashFlow.expenses,
    },
    goals: Array.isArray(rawData.goals) ? rawData.goals : demoData.goals,
  }
}
