export const HOUSEHOLD_CACHE_KEY = 'wealthos-household-cache-v2'
export const LEGACY_CACHE_KEY = 'wealthos-local-v1'
export const SESSION_KEY = 'wealthos-auth-session-v1'
export const ownerOptions = ['JR', 'Lisa', 'Joint']
export const accountTypes = ['Brokerage', 'Roth IRA', '401k', 'Savings', 'Cash', 'HSA']
export const holdingCategories = ['Amplified Income', 'Alternative Income', 'Anchor', 'Growth', 'Crypto', 'Cash', 'Other']
export const cashFlowCategories = {
  income: ['Salary', 'Portfolio', 'Rental', 'Side Hustle', 'Other'],
  expenses: ['Mortgage', 'Utilities', 'Insurance', 'Groceries', 'Travel', 'Investments', 'Childcare', 'Other'],
}

const plannerGoalOrder = ['Emergency Fund', 'Retirement', 'Real Estate / Down Payment', 'Travel / Sinking Fund']

const isoNow = () => new Date().toISOString()

export const defaultOwners = ownerOptions.map((name) => ({
  id: name,
  name,
  kind: name === 'Joint' ? 'joint' : 'person',
}))

const createHolding = ({
  id,
  ticker,
  holdingName,
  shares,
  marketValue,
  annualYieldPercent,
  estimatedMonthlyIncome,
  category,
}) => ({
  id,
  ticker,
  holdingName,
  shares,
  marketValue,
  annualYieldPercent,
  estimatedMonthlyIncome: estimatedMonthlyIncome ?? Number((((marketValue * annualYieldPercent) / 100) / 12).toFixed(2)),
  category,
  updatedAt: isoNow(),
})

const createAccount = ({
  id,
  ownerId,
  accountName,
  institution,
  accountType,
  balance,
  monthlyContribution,
  notes,
  holdings,
}) => ({
  id,
  ownerId,
  accountName,
  institution,
  accountType,
  balance,
  monthlyContribution,
  notes,
  holdings,
  updatedAt: isoNow(),
})

export function createStarterWorkspace({ householdId = null, householdName = 'JR & Lisa Household', slug = 'jr-lisa', createdBy = null } = {}) {
  const now = isoNow()
  return {
    schemaVersion: 2,
    household: {
      id: householdId,
      name: householdName,
      slug,
      owners: defaultOwners,
      createdAt: now,
      updatedAt: now,
    },
    accounts: starterAccounts(),
    cashFlowEntries: starterCashFlowEntries(),
    plannerGoals: starterPlannerGoals(),
    contributionSchedules: starterContributionSchedules(),
    activity: [],
    metadata: {
      createdAt: now,
      updatedAt: now,
      updatedBy: createdBy,
      lastCloudSyncAt: null,
      lastLocalSaveAt: null,
      source: 'demo',
    },
  }
}

function starterAccounts() {
  return [
    createAccount({
      id: 'acct-jr-brokerage', ownerId: 'JR', accountName: 'JR Brokerage', institution: 'Fidelity', accountType: 'Brokerage', balance: 128450, monthlyContribution: 1800,
      notes: 'Primary taxable income portfolio blending monthly cash flow, broad market exposure, and a small crypto sleeve.',
      holdings: [
        createHolding({ id: 'hold-101', ticker: 'SPYI', holdingName: 'NEOS S&P 500 High Income ETF', shares: 910.2, marketValue: 45400, annualYieldPercent: 12.1, category: 'Amplified Income' }),
        createHolding({ id: 'hold-102', ticker: 'JEPI', holdingName: 'JPMorgan Equity Premium Income ETF', shares: 286.4, marketValue: 16520, annualYieldPercent: 7.8, category: 'Amplified Income' }),
        createHolding({ id: 'hold-103', ticker: 'DGRO', holdingName: 'iShares Core Dividend Growth ETF', shares: 208.6, marketValue: 12940, annualYieldPercent: 2.4, category: 'Anchor' }),
        createHolding({ id: 'hold-104', ticker: 'VTI', holdingName: 'Vanguard Total Stock Market ETF', shares: 141.7, marketValue: 39450, annualYieldPercent: 1.3, category: 'Growth' }),
        createHolding({ id: 'hold-105', ticker: 'BTC', holdingName: 'Bitcoin', shares: 0.18, marketValue: 9650, annualYieldPercent: 0, category: 'Crypto' }),
        createHolding({ id: 'hold-106', ticker: 'CASH', holdingName: 'Brokerage Cash Position', shares: 1, marketValue: 14490, annualYieldPercent: 4.2, category: 'Cash' }),
      ],
    }),
    createAccount({
      id: 'acct-jr-roth', ownerId: 'JR', accountName: 'JR Roth IRA', institution: 'Fidelity', accountType: 'Roth IRA', balance: 156200, monthlyContribution: 583,
      notes: 'Tax-free retirement sleeve prioritizing dividend growth and core ETF accumulation.',
      holdings: [
        createHolding({ id: 'hold-201', ticker: 'DGRO', holdingName: 'iShares Core Dividend Growth ETF', shares: 395.5, marketValue: 24520, annualYieldPercent: 2.4, category: 'Anchor' }),
        createHolding({ id: 'hold-202', ticker: 'VTI', holdingName: 'Vanguard Total Stock Market ETF', shares: 188.1, marketValue: 52380, annualYieldPercent: 1.3, category: 'Growth' }),
        createHolding({ id: 'hold-203', ticker: 'JEPI', holdingName: 'JPMorgan Equity Premium Income ETF', shares: 268.9, marketValue: 15530, annualYieldPercent: 7.8, category: 'Amplified Income' }),
        createHolding({ id: 'hold-204', ticker: 'SCHD', holdingName: 'Schwab U.S. Dividend Equity ETF', shares: 230.6, marketValue: 41010, annualYieldPercent: 3.5, category: 'Anchor' }),
        createHolding({ id: 'hold-205', ticker: 'CASH', holdingName: 'Roth Cash Sweep', shares: 1, marketValue: 12760, annualYieldPercent: 4.1, category: 'Cash' }),
      ],
    }),
    createAccount({
      id: 'acct-jr-401k', ownerId: 'JR', accountName: 'JR 401k', institution: 'Empower', accountType: '401k', balance: 238900, monthlyContribution: 1950,
      notes: 'Employer retirement plan focused on total market growth with target-date diversification.',
      holdings: [
        createHolding({ id: 'hold-301', ticker: 'VTI', holdingName: 'Vanguard Total Stock Market ETF', shares: 362.4, marketValue: 100820, annualYieldPercent: 1.3, category: 'Growth' }),
        createHolding({ id: 'hold-302', ticker: 'FXAIX', holdingName: 'Fidelity 500 Index Fund', shares: 318.1, marketValue: 68740, annualYieldPercent: 1.4, category: 'Growth' }),
        createHolding({ id: 'hold-303', ticker: 'TR2055', holdingName: 'Target Retirement 2055 Fund', shares: 1650.2, marketValue: 51840, annualYieldPercent: 2, category: 'Anchor' }),
        createHolding({ id: 'hold-304', ticker: 'STBL', holdingName: 'Stable Value Fund', shares: 1, marketValue: 17500, annualYieldPercent: 3.1, category: 'Cash' }),
      ],
    }),
    createAccount({
      id: 'acct-lisa-roth', ownerId: 'Lisa', accountName: 'Lisa Roth IRA', institution: 'Charles Schwab', accountType: 'Roth IRA', balance: 134500, monthlyContribution: 583,
      notes: "Lisa's long-term Roth portfolio balancing broad growth and quality income funds.",
      holdings: [
        createHolding({ id: 'hold-401', ticker: 'VTI', holdingName: 'Vanguard Total Stock Market ETF', shares: 176.8, marketValue: 49210, annualYieldPercent: 1.3, category: 'Growth' }),
        createHolding({ id: 'hold-402', ticker: 'DGRO', holdingName: 'iShares Core Dividend Growth ETF', shares: 222.1, marketValue: 13780, annualYieldPercent: 2.4, category: 'Anchor' }),
        createHolding({ id: 'hold-403', ticker: 'JEPI', holdingName: 'JPMorgan Equity Premium Income ETF', shares: 194.4, marketValue: 11220, annualYieldPercent: 7.8, category: 'Amplified Income' }),
        createHolding({ id: 'hold-404', ticker: 'SCHG', holdingName: 'Schwab U.S. Large-Cap Growth ETF', shares: 295.3, marketValue: 65650, annualYieldPercent: 0.4, category: 'Growth' }),
        createHolding({ id: 'hold-405', ticker: 'CASH', holdingName: 'Roth Cash Sweep', shares: 1, marketValue: 4640, annualYieldPercent: 4.1, category: 'Cash' }),
      ],
    }),
    createAccount({
      id: 'acct-lisa-401k', ownerId: 'Lisa', accountName: 'Lisa 401k', institution: 'Vanguard', accountType: '401k', balance: 267300, monthlyContribution: 1750,
      notes: 'Core retirement engine with target-date funds, index exposure, and fixed-income ballast.',
      holdings: [
        createHolding({ id: 'hold-501', ticker: 'VIIIX', holdingName: 'Vanguard Institutional Index Fund', shares: 192.6, marketValue: 62850, annualYieldPercent: 1.4, category: 'Growth' }),
        createHolding({ id: 'hold-502', ticker: 'VTIAX', holdingName: 'Vanguard Total International Stock Index Fund', shares: 820.5, marketValue: 30240, annualYieldPercent: 3, category: 'Growth' }),
        createHolding({ id: 'hold-503', ticker: 'TR2055', holdingName: 'Target Retirement 2055 Fund', shares: 2541.8, marketValue: 129840, annualYieldPercent: 2, category: 'Anchor' }),
        createHolding({ id: 'hold-504', ticker: 'VBTIX', holdingName: 'Vanguard Total Bond Market Index Fund', shares: 2320.4, marketValue: 28190, annualYieldPercent: 3.2, category: 'Anchor' }),
        createHolding({ id: 'hold-505', ticker: 'CASH', holdingName: 'Plan Settlement Cash', shares: 1, marketValue: 16180, annualYieldPercent: 3.8, category: 'Cash' }),
      ],
    }),
    createAccount({
      id: 'acct-joint-savings', ownerId: 'Joint', accountName: 'Joint Savings', institution: 'Ally Bank', accountType: 'Savings', balance: 46200, monthlyContribution: 1400,
      notes: 'Emergency fund and sinking fund reserves for travel, home maintenance, and short-term goals.',
      holdings: [
        createHolding({ id: 'hold-601', ticker: 'HYSA', holdingName: 'High-Yield Savings', shares: 1, marketValue: 31800, annualYieldPercent: 4.3, category: 'Cash' }),
        createHolding({ id: 'hold-602', ticker: 'MMF', holdingName: 'Money Market Bucket', shares: 1, marketValue: 14400, annualYieldPercent: 4.7, category: 'Cash' }),
      ],
    }),
    createAccount({
      id: 'acct-joint-cash', ownerId: 'Joint', accountName: 'Joint Cash', institution: 'Chase', accountType: 'Cash', balance: 18500, monthlyContribution: 900,
      notes: 'Operating cash for bills, lifestyle spending, and near-term flexibility.',
      holdings: [
        createHolding({ id: 'hold-701', ticker: 'CASH', holdingName: 'Household Checking', shares: 1, marketValue: 12300, annualYieldPercent: 0.1, category: 'Cash' }),
        createHolding({ id: 'hold-702', ticker: 'MMF', holdingName: 'Treasury Sweep', shares: 1, marketValue: 6200, annualYieldPercent: 3.8, category: 'Cash' }),
      ],
    }),
  ]
}

function starterCashFlowEntries() {
  return [
    { id: 'cf-1', type: 'income', label: 'JR Salary', amount: 9200, ownerId: 'JR', category: 'Salary', updatedAt: isoNow() },
    { id: 'cf-2', type: 'income', label: 'Lisa Salary', amount: 7600, ownerId: 'Lisa', category: 'Salary', updatedAt: isoNow() },
    { id: 'cf-3', type: 'income', label: 'Portfolio Income', amount: 2480, ownerId: 'Joint', category: 'Portfolio', updatedAt: isoNow() },
    { id: 'cf-101', type: 'expenses', label: 'Mortgage', amount: 3250, ownerId: 'Joint', category: 'Mortgage', updatedAt: isoNow() },
    { id: 'cf-102', type: 'expenses', label: 'Utilities', amount: 540, ownerId: 'Joint', category: 'Utilities', updatedAt: isoNow() },
    { id: 'cf-103', type: 'expenses', label: 'Insurance', amount: 710, ownerId: 'Joint', category: 'Insurance', updatedAt: isoNow() },
    { id: 'cf-104', type: 'expenses', label: 'Groceries', amount: 1180, ownerId: 'Joint', category: 'Groceries', updatedAt: isoNow() },
    { id: 'cf-105', type: 'expenses', label: 'Travel', amount: 650, ownerId: 'Joint', category: 'Travel', updatedAt: isoNow() },
    { id: 'cf-106', type: 'expenses', label: 'Investments', amount: 2200, ownerId: 'Joint', category: 'Investments', updatedAt: isoNow() },
  ]
}

function starterPlannerGoals() {
  return plannerGoalOrder.map((title, index) => {
    const seed = [
      { targetAmount: 50000, currentAmount: 46200, monthlyContribution: 1400 },
      { targetAmount: 2000000, currentAmount: 796900, monthlyContribution: 4866 },
      { targetAmount: 150000, currentAmount: 38000, monthlyContribution: 900 },
      { targetAmount: 24000, currentAmount: 12600, monthlyContribution: 650 },
    ][index]

    return {
      id: `goal-${index + 1}`,
      title,
      ownerId: 'Joint',
      ...seed,
      updatedAt: isoNow(),
    }
  })
}

function starterContributionSchedules() {
  return [
    { id: 'sched-1', targetType: 'account', targetId: 'acct-jr-brokerage', ownerId: 'JR', label: 'JR Brokerage auto-invest', cadence: 'monthly', amount: 1800, updatedAt: isoNow() },
    { id: 'sched-2', targetType: 'account', targetId: 'acct-jr-roth', ownerId: 'JR', label: 'JR Roth IRA', cadence: 'monthly', amount: 583, updatedAt: isoNow() },
    { id: 'sched-3', targetType: 'account', targetId: 'acct-jr-401k', ownerId: 'JR', label: 'JR 401k payroll', cadence: 'monthly', amount: 1950, updatedAt: isoNow() },
    { id: 'sched-4', targetType: 'account', targetId: 'acct-lisa-roth', ownerId: 'Lisa', label: 'Lisa Roth IRA', cadence: 'monthly', amount: 583, updatedAt: isoNow() },
    { id: 'sched-5', targetType: 'account', targetId: 'acct-lisa-401k', ownerId: 'Lisa', label: 'Lisa 401k payroll', cadence: 'monthly', amount: 1750, updatedAt: isoNow() },
    { id: 'sched-6', targetType: 'account', targetId: 'acct-joint-savings', ownerId: 'Joint', label: 'Emergency fund', cadence: 'monthly', amount: 1400, updatedAt: isoNow() },
    { id: 'sched-7', targetType: 'account', targetId: 'acct-joint-cash', ownerId: 'Joint', label: 'Bills buffer', cadence: 'monthly', amount: 900, updatedAt: isoNow() },
  ]
}

export function getOwnerName(ownerId) {
  return defaultOwners.find((owner) => owner.id === ownerId)?.name ?? ownerId
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value) || 0)
}

export function formatCurrencyPrecise(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0)
}

export function formatPercent(value) {
  return `${Number.isFinite(Number(value)) ? Number(value).toFixed(1) : '0.0'}%`
}

export function calculateHoldingMonthlyIncome(holding) {
  return Number((((Number(holding.marketValue) * Number(holding.annualYieldPercent)) / 100) / 12).toFixed(2))
}

export function calculateAccountMonthlyIncome(account) {
  return account.holdings.reduce((sum, holding) => sum + Number(holding.estimatedMonthlyIncome ?? calculateHoldingMonthlyIncome(holding)), 0)
}

export function calculateHouseholdMetrics(accounts) {
  const totalHouseholdNetWorth = accounts.reduce((sum, account) => sum + Number(account.balance), 0)
  const totalCashSavings = accounts.filter((account) => ['Savings', 'Cash'].includes(account.accountType)).reduce((sum, account) => sum + Number(account.balance), 0)
  const totalInvestedAssets = totalHouseholdNetWorth - totalCashSavings
  const monthlyPortfolioIncome = accounts.reduce((sum, account) => sum + calculateAccountMonthlyIncome(account), 0)
  const annualPortfolioIncome = monthlyPortfolioIncome * 12
  const monthlyHouseholdContributions = accounts.reduce((sum, account) => sum + Number(account.monthlyContribution), 0)

  return { totalHouseholdNetWorth, totalInvestedAssets, totalCashSavings, monthlyPortfolioIncome, annualPortfolioIncome, monthlyHouseholdContributions, numberOfAccounts: accounts.length }
}

export function groupAccountsByOwner(accounts) {
  return ownerOptions.map((ownerId) => {
    const ownerAccounts = accounts.filter((account) => account.ownerId === ownerId)
    return {
      owner: ownerId,
      totalBalance: ownerAccounts.reduce((sum, account) => sum + Number(account.balance), 0),
      monthlyContributions: ownerAccounts.reduce((sum, account) => sum + Number(account.monthlyContribution), 0),
      monthlyIncome: ownerAccounts.reduce((sum, account) => sum + calculateAccountMonthlyIncome(account), 0),
      accountCount: ownerAccounts.length,
      accounts: ownerAccounts,
    }
  })
}

export function groupAccountsByAccountType(accounts) {
  return accountTypes.map((accountType) => {
    const matchingAccounts = accounts.filter((account) => account.accountType === accountType)
    return { accountType, totalBalance: matchingAccounts.reduce((sum, account) => sum + Number(account.balance), 0), accountCount: matchingAccounts.length }
  }).filter((group) => group.accountCount > 0)
}

export function groupIncomeByCategory(accounts) {
  const displayCategories = ['Amplified Income', 'Alternative Income', 'Anchor', 'Growth', 'Cash', 'Other']
  const map = new Map(displayCategories.map((category) => [category, 0]))
  accounts.forEach((account) => {
    account.holdings.forEach((holding) => {
      const normalizedCategory = displayCategories.includes(holding.category) ? holding.category : 'Other'
      map.set(normalizedCategory, (map.get(normalizedCategory) ?? 0) + Number(holding.estimatedMonthlyIncome ?? 0))
    })
  })
  return displayCategories.map((category) => ({ category, amount: map.get(category) ?? 0 }))
}

export function buildNetWorthProjection(accounts, months = 12) {
  const metrics = calculateHouseholdMetrics(accounts)
  return Array.from({ length: months }, (_, index) => ({ label: index === 0 ? 'Now' : `+${index}m`, netWorth: metrics.totalHouseholdNetWorth + metrics.monthlyHouseholdContributions * index }))
}

export function summarizeRows(rows, key) {
  const map = new Map()
  rows.forEach((row) => {
    const bucket = row[key] || 'Unassigned'
    map.set(bucket, (map.get(bucket) ?? 0) + Number(row.amount))
  })
  return [...map.entries()].map(([label, amount]) => ({ label, amount })).sort((a, b) => b.amount - a.amount)
}

export function calculateGoalProgress(goal) {
  if (!goal.targetAmount) return 0
  return Math.min((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100, 100)
}

export function normalizeWorkspace(candidate) {
  if (!candidate) return createStarterWorkspace()
  if (candidate.schemaVersion === 2) return candidate
  return migrateLegacyData(candidate)
}

export function migrateLegacyData(candidate) {
  const now = isoNow()
  if (candidate?.accounts && candidate?.cashFlow && candidate?.goals) {
    return {
      schemaVersion: 2,
      household: {
        id: null,
        name: 'JR & Lisa Household',
        slug: 'jr-lisa',
        owners: defaultOwners,
        createdAt: now,
        updatedAt: now,
      },
      accounts: (candidate.accounts ?? []).map((account) => ({
        ...account,
        ownerId: account.owner ?? account.ownerId ?? 'Joint',
        holdings: (account.holdings ?? []).map((holding) => ({ ...holding, updatedAt: now })),
        updatedAt: now,
      })),
      cashFlowEntries: [...(candidate.cashFlow.income ?? []).map((row) => ({ ...row, type: 'income', ownerId: row.owner ?? row.ownerId ?? 'Joint', updatedAt: now })), ...(candidate.cashFlow.expenses ?? []).map((row) => ({ ...row, type: 'expenses', ownerId: row.owner ?? row.ownerId ?? 'Joint', updatedAt: now }))],
      plannerGoals: (candidate.goals ?? []).map((goal) => ({ ...goal, ownerId: goal.ownerId ?? 'Joint', updatedAt: now })),
      contributionSchedules: [],
      activity: [],
      metadata: { createdAt: now, updatedAt: now, updatedBy: null, lastCloudSyncAt: null, lastLocalSaveAt: null, source: 'legacy-local' },
    }
  }
  return createStarterWorkspace()
}

export function persistLocalWorkspace(workspace) {
  localStorage.setItem(HOUSEHOLD_CACHE_KEY, JSON.stringify(workspace))
  return workspace
}

export function loadLocalWorkspace() {
  const current = localStorage.getItem(HOUSEHOLD_CACHE_KEY)
  if (current) {
    try {
      return normalizeWorkspace(JSON.parse(current))
    } catch {
      localStorage.removeItem(HOUSEHOLD_CACHE_KEY)
    }
  }
  const legacy = localStorage.getItem(LEGACY_CACHE_KEY)
  if (legacy) {
    try {
      return normalizeWorkspace(JSON.parse(legacy))
    } catch {
      localStorage.removeItem(LEGACY_CACHE_KEY)
    }
  }
  return createStarterWorkspace()
}

export function saveSession(session) {
  if (!session) {
    localStorage.removeItem(SESSION_KEY)
    return
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function loadSession() {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function createActivityEntry(message, userEmail) {
  return {
    id: crypto.randomUUID(),
    message,
    userEmail,
    createdAt: isoNow(),
  }
}

export function stampWorkspace(workspace, userId) {
  return {
    ...workspace,
    household: { ...workspace.household, updatedAt: isoNow() },
    metadata: {
      ...workspace.metadata,
      updatedAt: isoNow(),
      updatedBy: userId,
    },
  }
}

export function mergeWorkspaceRecords(localWorkspace, remoteWorkspace) {
  const mergeById = (localRows = [], remoteRows = [], nestedKey = null) => {
    const map = new Map()
    for (const row of [...remoteRows, ...localRows]) {
      const existing = map.get(row.id)
      if (!existing || new Date(row.updatedAt ?? 0).getTime() >= new Date(existing.updatedAt ?? 0).getTime()) {
        map.set(row.id, nestedKey ? { ...row, [nestedKey]: mergeById(row[nestedKey] ?? [], existing?.[nestedKey] ?? [], null) } : row)
      }
    }
    return [...map.values()]
  }

  const merged = {
    ...remoteWorkspace,
    household: new Date(localWorkspace.household.updatedAt ?? 0).getTime() > new Date(remoteWorkspace.household.updatedAt ?? 0).getTime()
      ? localWorkspace.household
      : remoteWorkspace.household,
    accounts: mergeById(localWorkspace.accounts, remoteWorkspace.accounts, 'holdings').map((account) => ({
      ...account,
      holdings: mergeById(localWorkspace.accounts.find((item) => item.id === account.id)?.holdings ?? [], remoteWorkspace.accounts.find((item) => item.id === account.id)?.holdings ?? []),
    })),
    cashFlowEntries: mergeById(localWorkspace.cashFlowEntries, remoteWorkspace.cashFlowEntries),
    plannerGoals: mergeById(localWorkspace.plannerGoals, remoteWorkspace.plannerGoals),
    contributionSchedules: mergeById(localWorkspace.contributionSchedules, remoteWorkspace.contributionSchedules),
    activity: mergeById(localWorkspace.activity, remoteWorkspace.activity),
    metadata: {
      ...remoteWorkspace.metadata,
      updatedAt: new Date(localWorkspace.metadata.updatedAt ?? 0).getTime() > new Date(remoteWorkspace.metadata.updatedAt ?? 0).getTime()
        ? localWorkspace.metadata.updatedAt
        : remoteWorkspace.metadata.updatedAt,
      updatedBy: localWorkspace.metadata.updatedBy ?? remoteWorkspace.metadata.updatedBy,
    },
  }

  return merged
}

export function toCashFlowBuckets(entries) {
  return {
    income: entries.filter((entry) => entry.type === 'income'),
    expenses: entries.filter((entry) => entry.type === 'expenses'),
  }
}

export function exportWorkspace(workspace) {
  return JSON.stringify(workspace, null, 2)
}
