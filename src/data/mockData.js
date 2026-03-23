export const accountOwners = ['JR', 'Lisa', 'Joint']
export const accountTypes = ['Brokerage', 'Roth IRA', '401k', 'Savings', 'Cash', 'HSA']
export const holdingCategories = ['Amplified Income', 'Alternative Income', 'Anchor', 'Growth', 'Crypto', 'Cash', 'Other']
export const cashFlowCategories = {
  income: ['Salary', 'Portfolio', 'Rental', 'Side Hustle', 'Other'],
  expenses: ['Mortgage', 'Utilities', 'Insurance', 'Groceries', 'Travel', 'Investments', 'Childcare', 'Other'],
}

export const plannerGoalOrder = ['Emergency Fund', 'Retirement', 'Real Estate / Down Payment', 'Travel / Sinking Fund']

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
  estimatedMonthlyIncome:
    estimatedMonthlyIncome ?? Number((((marketValue * annualYieldPercent) / 100) / 12).toFixed(2)),
  category,
})

const createAccount = ({
  id,
  owner,
  accountName,
  institution,
  accountType,
  balance,
  monthlyContribution,
  notes,
  holdings,
}) => ({
  id,
  owner,
  accountName,
  institution,
  accountType,
  balance,
  monthlyContribution,
  notes,
  holdings,
})

export const accountsSeed = [
  createAccount({
    id: 1,
    owner: 'JR',
    accountName: 'JR Brokerage',
    institution: 'Fidelity',
    accountType: 'Brokerage',
    balance: 128450,
    monthlyContribution: 1800,
    notes: 'Primary taxable income portfolio blending monthly cash flow, broad market exposure, and a small crypto sleeve.',
    holdings: [
      createHolding({ id: 101, ticker: 'SPYI', holdingName: 'NEOS S&P 500 High Income ETF', shares: 910.2, marketValue: 45400, annualYieldPercent: 12.1, category: 'Amplified Income' }),
      createHolding({ id: 102, ticker: 'JEPI', holdingName: 'JPMorgan Equity Premium Income ETF', shares: 286.4, marketValue: 16520, annualYieldPercent: 7.8, category: 'Amplified Income' }),
      createHolding({ id: 103, ticker: 'DGRO', holdingName: 'iShares Core Dividend Growth ETF', shares: 208.6, marketValue: 12940, annualYieldPercent: 2.4, category: 'Anchor' }),
      createHolding({ id: 104, ticker: 'VTI', holdingName: 'Vanguard Total Stock Market ETF', shares: 141.7, marketValue: 39450, annualYieldPercent: 1.3, category: 'Growth' }),
      createHolding({ id: 105, ticker: 'BTC', holdingName: 'Bitcoin', shares: 0.18, marketValue: 9650, annualYieldPercent: 0, category: 'Crypto' }),
      createHolding({ id: 106, ticker: 'CASH', holdingName: 'Brokerage Cash Position', shares: 1, marketValue: 14490, annualYieldPercent: 4.2, category: 'Cash' }),
    ],
  }),
  createAccount({
    id: 2,
    owner: 'JR',
    accountName: 'JR Roth IRA',
    institution: 'Fidelity',
    accountType: 'Roth IRA',
    balance: 156200,
    monthlyContribution: 583,
    notes: 'Tax-free retirement sleeve prioritizing dividend growth and core ETF accumulation.',
    holdings: [
      createHolding({ id: 201, ticker: 'DGRO', holdingName: 'iShares Core Dividend Growth ETF', shares: 395.5, marketValue: 24520, annualYieldPercent: 2.4, category: 'Anchor' }),
      createHolding({ id: 202, ticker: 'VTI', holdingName: 'Vanguard Total Stock Market ETF', shares: 188.1, marketValue: 52380, annualYieldPercent: 1.3, category: 'Growth' }),
      createHolding({ id: 203, ticker: 'JEPI', holdingName: 'JPMorgan Equity Premium Income ETF', shares: 268.9, marketValue: 15530, annualYieldPercent: 7.8, category: 'Amplified Income' }),
      createHolding({ id: 204, ticker: 'SCHD', holdingName: 'Schwab U.S. Dividend Equity ETF', shares: 230.6, marketValue: 41010, annualYieldPercent: 3.5, category: 'Anchor' }),
      createHolding({ id: 205, ticker: 'CASH', holdingName: 'Roth Cash Sweep', shares: 1, marketValue: 12760, annualYieldPercent: 4.1, category: 'Cash' }),
    ],
  }),
  createAccount({
    id: 3,
    owner: 'JR',
    accountName: 'JR 401k',
    institution: 'Empower',
    accountType: '401k',
    balance: 238900,
    monthlyContribution: 1950,
    notes: 'Employer retirement plan focused on total market growth with target-date diversification.',
    holdings: [
      createHolding({ id: 301, ticker: 'VTI', holdingName: 'Vanguard Total Stock Market ETF', shares: 362.4, marketValue: 100820, annualYieldPercent: 1.3, category: 'Growth' }),
      createHolding({ id: 302, ticker: 'FXAIX', holdingName: 'Fidelity 500 Index Fund', shares: 318.1, marketValue: 68740, annualYieldPercent: 1.4, category: 'Growth' }),
      createHolding({ id: 303, ticker: 'TR2055', holdingName: 'Target Retirement 2055 Fund', shares: 1650.2, marketValue: 51840, annualYieldPercent: 2.0, category: 'Anchor' }),
      createHolding({ id: 304, ticker: 'STBL', holdingName: 'Stable Value Fund', shares: 1, marketValue: 17500, annualYieldPercent: 3.1, category: 'Cash' }),
    ],
  }),
  createAccount({
    id: 4,
    owner: 'Lisa',
    accountName: 'Lisa Roth IRA',
    institution: 'Charles Schwab',
    accountType: 'Roth IRA',
    balance: 134500,
    monthlyContribution: 583,
    notes: 'Lisa\'s long-term Roth portfolio balancing broad growth and quality income funds.',
    holdings: [
      createHolding({ id: 401, ticker: 'VTI', holdingName: 'Vanguard Total Stock Market ETF', shares: 176.8, marketValue: 49210, annualYieldPercent: 1.3, category: 'Growth' }),
      createHolding({ id: 402, ticker: 'DGRO', holdingName: 'iShares Core Dividend Growth ETF', shares: 222.1, marketValue: 13780, annualYieldPercent: 2.4, category: 'Anchor' }),
      createHolding({ id: 403, ticker: 'JEPI', holdingName: 'JPMorgan Equity Premium Income ETF', shares: 194.4, marketValue: 11220, annualYieldPercent: 7.8, category: 'Amplified Income' }),
      createHolding({ id: 404, ticker: 'SCHG', holdingName: 'Schwab U.S. Large-Cap Growth ETF', shares: 295.3, marketValue: 65650, annualYieldPercent: 0.4, category: 'Growth' }),
      createHolding({ id: 405, ticker: 'CASH', holdingName: 'Roth Cash Sweep', shares: 1, marketValue: 4640, annualYieldPercent: 4.1, category: 'Cash' }),
    ],
  }),
  createAccount({
    id: 5,
    owner: 'Lisa',
    accountName: 'Lisa 401k',
    institution: 'Vanguard',
    accountType: '401k',
    balance: 267300,
    monthlyContribution: 1750,
    notes: 'Core retirement engine with target-date funds, index exposure, and fixed-income ballast.',
    holdings: [
      createHolding({ id: 501, ticker: 'VIIIX', holdingName: 'Vanguard Institutional Index Fund', shares: 192.6, marketValue: 62850, annualYieldPercent: 1.4, category: 'Growth' }),
      createHolding({ id: 502, ticker: 'VTIAX', holdingName: 'Vanguard Total International Stock Index Fund', shares: 820.5, marketValue: 30240, annualYieldPercent: 3.0, category: 'Growth' }),
      createHolding({ id: 503, ticker: 'TR2055', holdingName: 'Target Retirement 2055 Fund', shares: 2541.8, marketValue: 129840, annualYieldPercent: 2.0, category: 'Anchor' }),
      createHolding({ id: 504, ticker: 'VBTIX', holdingName: 'Vanguard Total Bond Market Index Fund', shares: 2320.4, marketValue: 28190, annualYieldPercent: 3.2, category: 'Anchor' }),
      createHolding({ id: 505, ticker: 'CASH', holdingName: 'Plan Settlement Cash', shares: 1, marketValue: 16180, annualYieldPercent: 3.8, category: 'Cash' }),
    ],
  }),
  createAccount({
    id: 6,
    owner: 'Joint',
    accountName: 'Joint Savings',
    institution: 'Ally Bank',
    accountType: 'Savings',
    balance: 46200,
    monthlyContribution: 1400,
    notes: 'Emergency fund and sinking fund reserves for travel, home maintenance, and short-term goals.',
    holdings: [
      createHolding({ id: 601, ticker: 'HYSA', holdingName: 'High-Yield Savings', shares: 1, marketValue: 31800, annualYieldPercent: 4.3, category: 'Cash' }),
      createHolding({ id: 602, ticker: 'MMF', holdingName: 'Money Market Bucket', shares: 1, marketValue: 14400, annualYieldPercent: 4.7, category: 'Cash' }),
    ],
  }),
  createAccount({
    id: 7,
    owner: 'Joint',
    accountName: 'Joint Cash',
    institution: 'Chase',
    accountType: 'Cash',
    balance: 18500,
    monthlyContribution: 900,
    notes: 'Operating cash for bills, lifestyle spending, and near-term flexibility.',
    holdings: [
      createHolding({ id: 701, ticker: 'CASH', holdingName: 'Household Checking', shares: 1, marketValue: 12300, annualYieldPercent: 0.1, category: 'Cash' }),
      createHolding({ id: 702, ticker: 'MMF', holdingName: 'Treasury Sweep', shares: 1, marketValue: 6200, annualYieldPercent: 3.8, category: 'Cash' }),
    ],
  }),
]

export const cashFlowSeed = {
  income: [
    { id: 1, label: 'JR Salary', amount: 9200, owner: 'JR', category: 'Salary' },
    { id: 2, label: 'Lisa Salary', amount: 7600, owner: 'Lisa', category: 'Salary' },
    { id: 3, label: 'Portfolio Income', amount: 2480, owner: 'Joint', category: 'Portfolio' },
  ],
  expenses: [
    { id: 101, label: 'Mortgage', amount: 3250, owner: 'Joint', category: 'Mortgage' },
    { id: 102, label: 'Utilities', amount: 540, owner: 'Joint', category: 'Utilities' },
    { id: 103, label: 'Insurance', amount: 710, owner: 'Joint', category: 'Insurance' },
    { id: 104, label: 'Groceries', amount: 1180, owner: 'Joint', category: 'Groceries' },
    { id: 105, label: 'Travel', amount: 650, owner: 'Joint', category: 'Travel' },
    { id: 106, label: 'Investments', amount: 2200, owner: 'Joint', category: 'Investments' },
  ],
}

export const plannerGoalsSeed = [
  { id: 1, title: 'Emergency Fund', targetAmount: 50000, currentAmount: 46200, monthlyContribution: 1400 },
  { id: 2, title: 'Retirement', targetAmount: 2000000, currentAmount: 796900, monthlyContribution: 4866 },
  { id: 3, title: 'Real Estate / Down Payment', targetAmount: 150000, currentAmount: 38000, monthlyContribution: 900 },
  { id: 4, title: 'Travel / Sinking Fund', targetAmount: 24000, currentAmount: 12600, monthlyContribution: 650 },
]

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatCurrencyPrecise(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value) {
  return `${Number(value).toFixed(1)}%`
}

export function calculateHoldingMonthlyIncome(holding) {
  return Number((((Number(holding.marketValue) * Number(holding.annualYieldPercent)) / 100) / 12).toFixed(2))
}

export function calculateAccountMonthlyIncome(account) {
  return account.holdings.reduce((sum, holding) => sum + Number(holding.estimatedMonthlyIncome ?? calculateHoldingMonthlyIncome(holding)), 0)
}

export function calculateHouseholdMetrics(accounts) {
  const totalHouseholdNetWorth = accounts.reduce((sum, account) => sum + Number(account.balance), 0)
  const totalCashSavings = accounts
    .filter((account) => ['Savings', 'Cash'].includes(account.accountType))
    .reduce((sum, account) => sum + Number(account.balance), 0)
  const totalInvestedAssets = totalHouseholdNetWorth - totalCashSavings
  const monthlyPortfolioIncome = accounts.reduce((sum, account) => sum + calculateAccountMonthlyIncome(account), 0)
  const annualPortfolioIncome = monthlyPortfolioIncome * 12
  const monthlyHouseholdContributions = accounts.reduce((sum, account) => sum + Number(account.monthlyContribution), 0)

  return {
    totalHouseholdNetWorth,
    totalInvestedAssets,
    totalCashSavings,
    monthlyPortfolioIncome,
    annualPortfolioIncome,
    monthlyHouseholdContributions,
    numberOfAccounts: accounts.length,
  }
}

export function groupAccountsByOwner(accounts) {
  return accountOwners.map((owner) => {
    const ownerAccounts = accounts.filter((account) => account.owner === owner)
    return {
      owner,
      totalBalance: ownerAccounts.reduce((sum, account) => sum + Number(account.balance), 0),
      monthlyContributions: ownerAccounts.reduce((sum, account) => sum + Number(account.monthlyContribution), 0),
      monthlyIncome: ownerAccounts.reduce((sum, account) => sum + calculateAccountMonthlyIncome(account), 0),
      accountCount: ownerAccounts.length,
      accounts: ownerAccounts,
    }
  })
}

export function groupAccountsByAccountType(accounts) {
  return accountTypes
    .map((accountType) => {
      const matchingAccounts = accounts.filter((account) => account.accountType === accountType)
      return {
        accountType,
        totalBalance: matchingAccounts.reduce((sum, account) => sum + Number(account.balance), 0),
        accountCount: matchingAccounts.length,
      }
    })
    .filter((group) => group.accountCount > 0)
}

export function groupIncomeByCategory(accounts) {
  const displayCategories = ['Amplified Income', 'Alternative Income', 'Anchor', 'Growth', 'Cash', 'Other']
  const map = new Map(displayCategories.map((category) => [category, 0]))

  accounts.forEach((account) => {
    account.holdings.forEach((holding) => {
      const normalizedCategory = displayCategories.includes(holding.category) ? holding.category : 'Other'
      const current = map.get(normalizedCategory) ?? 0
      map.set(normalizedCategory, current + Number(holding.estimatedMonthlyIncome ?? 0))
    })
  })

  return displayCategories.map((category) => ({ category, amount: map.get(category) ?? 0 }))
}

export function buildNetWorthProjection(accounts, months = 12) {
  const metrics = calculateHouseholdMetrics(accounts)
  return Array.from({ length: months }, (_, index) => ({
    label: index === 0 ? 'Now' : `+${index}m`,
    netWorth: metrics.totalHouseholdNetWorth + metrics.monthlyHouseholdContributions * index,
  }))
}

export function summarizeCashFlowRows(rows, key) {
  const map = new Map()
  rows.forEach((row) => {
    const bucket = row[key] || 'Unassigned'
    map.set(bucket, (map.get(bucket) ?? 0) + Number(row.amount))
  })
  return [...map.entries()]
    .map(([label, amount]) => ({ label, amount }))
    .sort((a, b) => b.amount - a.amount)
}

export function calculateGoalProgress(goal) {
  if (!goal.targetAmount) return 0
  return Math.min((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100, 100)
}
