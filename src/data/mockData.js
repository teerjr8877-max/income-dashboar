export const accountOwners = ['JR', 'Lisa', 'Joint']
export const accountTypes = ['Brokerage', 'Roth IRA', '401k', 'Savings', 'Cash', 'HSA']
export const holdingCategories = ['Amplified Income', 'Alternative Income', 'Anchor', 'Growth', 'Cash', 'Other']

export const cashFlowCategories = {
  income: ['Salary', 'Portfolio', 'Rental', 'Side Hustle', 'Other'],
  expenses: ['Mortgage', 'Utilities', 'Insurance', 'Groceries', 'Travel', 'Investments', 'Childcare', 'Other'],
}

const FIRE_MONTHLY_TARGET = 10000

const createHolding = ({
  id,
  ticker,
  holdingName,
  shares,
  marketValue,
  annualYieldPercent,
  estimatedMonthlyIncome,
  category,
}) => {
  const monthlyIncome =
    estimatedMonthlyIncome ?? calculateHoldingMonthlyIncome({ marketValue, annualYieldPercent })

  return {
    id,
    ticker,
    holdingName,
    shares,
    marketValue,
    annualYieldPercent,
    estimatedMonthlyIncome: monthlyIncome,
    estimatedAnnualIncome: calculateHoldingAnnualIncome({ estimatedMonthlyIncome: monthlyIncome }),
    category,
  }
}

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
}) => {
  const normalizedHoldings = holdings.map((holding) => createHolding(holding))
  const holdingsMarketValue = normalizedHoldings.reduce((sum, holding) => sum + Number(holding.marketValue), 0)

  return {
    id,
    owner,
    accountName,
    institution,
    accountType,
    balance: holdingsMarketValue || Number(balance) || 0,
    monthlyContribution,
    notes,
    holdings: normalizedHoldings,
  }
}

export const accountsSeed = [
  createAccount({
    id: 1,
    owner: 'JR',
    accountName: 'JR Income Brokerage',
    institution: 'Fidelity',
    accountType: 'Brokerage',
    monthlyContribution: 2200,
    notes: 'Primary taxable income sleeve balancing amplified income, broad market exposure, and cash reserves.',
    holdings: [
      { id: 101, ticker: 'SPYI', holdingName: 'NEOS S&P 500 High Income ETF', shares: 1125, marketValue: 54000, annualYieldPercent: 12, category: 'Amplified Income' },
      { id: 102, ticker: 'DGRO', holdingName: 'iShares Core Dividend Growth ETF', shares: 579.18, marketValue: 33720, annualYieldPercent: 2.5, category: 'Anchor' },
      { id: 103, ticker: 'VTI', holdingName: 'Vanguard Total Stock Market ETF', shares: 287.14, marketValue: 75000, annualYieldPercent: 1.36, category: 'Growth' },
      { id: 104, ticker: 'CASH', holdingName: 'Treasury Sweep Cash', shares: 12000, marketValue: 12000, annualYieldPercent: 4.4, category: 'Cash' },
    ],
  }),
  createAccount({
    id: 2,
    owner: 'JR',
    accountName: 'JR FIRE 401k',
    institution: 'Empower',
    accountType: '401k',
    monthlyContribution: 1950,
    notes: 'Employer retirement plan emphasizing long-duration equity compounding with stable contribution pacing.',
    holdings: [
      { id: 201, ticker: 'VTI', holdingName: 'Vanguard Total Stock Market ETF', shares: 640.55, marketValue: 167200, annualYieldPercent: 0.7191387559808613, category: 'Growth' },
      { id: 202, ticker: 'DGRO', holdingName: 'iShares Core Dividend Growth ETF', shares: 911.13, marketValue: 53040, annualYieldPercent: 0.4581440422322771, category: 'Anchor' },
      { id: 203, ticker: 'CASH', holdingName: '401k Stable Value Sleeve', shares: 18000, marketValue: 18000, annualYieldPercent: 0, category: 'Cash' },
    ],
  }),
  createAccount({
    id: 3,
    owner: 'Lisa',
    accountName: 'Lisa Roth IRA',
    institution: 'Charles Schwab',
    accountType: 'Roth IRA',
    monthlyContribution: 583,
    notes: 'Tax-free compounder mixing high-quality growth, reliable dividends, and alternative income ballast.',
    holdings: [
      { id: 301, ticker: 'JEPI', holdingName: 'JPMorgan Equity Premium Income ETF', shares: 532.48, marketValue: 30000, annualYieldPercent: 7.2, category: 'Amplified Income' },
      { id: 302, ticker: 'DGRO', holdingName: 'iShares Core Dividend Growth ETF', shares: 515.85, marketValue: 30000, annualYieldPercent: 2.5, category: 'Anchor' },
      { id: 303, ticker: 'VTI', holdingName: 'Vanguard Total Stock Market ETF', shares: 333.3, marketValue: 87000, annualYieldPercent: 1.3, category: 'Growth' },
      { id: 304, ticker: 'JAAA', holdingName: 'Janus Henderson AAA CLO ETF', shares: 397.61, marketValue: 20000, annualYieldPercent: 5.79, category: 'Alternative Income' },
    ],
  }),
  createAccount({
    id: 4,
    owner: 'Lisa',
    accountName: 'Lisa Cash Reserve',
    institution: 'Ally Bank',
    accountType: 'Savings',
    monthlyContribution: 900,
    notes: 'Emergency liquidity and near-term opportunity fund optimized for stability and fast access.',
    holdings: [
      { id: 401, ticker: 'CASH', holdingName: 'High-Yield Savings', shares: 1, marketValue: 36000, annualYieldPercent: 1.8333333333333333, category: 'Cash' },
    ],
  }),
  createAccount({
    id: 5,
    owner: 'Joint',
    accountName: 'Joint Income Portfolio',
    institution: 'Vanguard',
    accountType: 'Brokerage',
    monthlyContribution: 2600,
    notes: 'Joint household income engine for lifestyle funding, FIRE progress, and flexible deployment.',
    holdings: [
      { id: 501, ticker: 'SPYI', holdingName: 'NEOS S&P 500 High Income ETF', shares: 1250, marketValue: 60000, annualYieldPercent: 12.4, category: 'Amplified Income' },
      { id: 502, ticker: 'VTI', holdingName: 'Vanguard Total Stock Market ETF', shares: 338.66, marketValue: 88500, annualYieldPercent: 1.2, category: 'Growth' },
      { id: 503, ticker: 'CASH', holdingName: 'Joint Treasury Ladder', shares: 1, marketValue: 43000, annualYieldPercent: 0, category: 'Cash' },
      { id: 504, ticker: 'PCRED', holdingName: 'Private Credit Income Fund', shares: 300, marketValue: 30000, annualYieldPercent: 5.82, category: 'Alternative Income' },
      { id: 505, ticker: 'PREF', holdingName: 'Preferred Income Basket', shares: 200, marketValue: 20000, annualYieldPercent: 2.868, category: 'Other' },
    ],
  }),
]

export const cashFlowSeed = {
  income: [
    { id: 1, label: 'JR Salary', amount: 9200, owner: 'JR', category: 'Salary' },
    { id: 2, label: 'Lisa Salary', amount: 7600, owner: 'Lisa', category: 'Salary' },
    { id: 3, label: 'Portfolio Income', amount: 2249.75, owner: 'Joint', category: 'Portfolio' },
    { id: 4, label: 'Side Venture', amount: 950, owner: 'JR', category: 'Side Hustle' },
  ],
  expenses: [
    { id: 101, label: 'Mortgage', amount: 3250, owner: 'Joint', category: 'Mortgage' },
    { id: 102, label: 'Utilities', amount: 540, owner: 'Joint', category: 'Utilities' },
    { id: 103, label: 'Insurance', amount: 710, owner: 'Joint', category: 'Insurance' },
    { id: 104, label: 'Groceries', amount: 1180, owner: 'Joint', category: 'Groceries' },
    { id: 105, label: 'Travel', amount: 650, owner: 'Joint', category: 'Travel' },
    { id: 106, label: 'Investments', amount: 2200, owner: 'Joint', category: 'Investments' },
    { id: 107, label: 'Childcare', amount: 850, owner: 'Joint', category: 'Childcare' },
  ],
}

export const plannerGoalsSeed = [
  { id: 1, title: 'Emergency Fund', targetAmount: 50000, currentAmount: 36000, monthlyContribution: 900 },
  { id: 2, title: 'Retirement', targetAmount: 2500000, currentAmount: 814460, monthlyContribution: 5333 },
  { id: 3, title: 'Bridge Account', targetAmount: 450000, currentAmount: 180500, monthlyContribution: 2600 },
  { id: 4, title: 'Travel / Lifestyle Fund', targetAmount: 24000, currentAmount: 12600, monthlyContribution: 650 },
]

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)
}

export function formatCurrencyPrecise(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)
}

export function formatPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`
}

export function calculateHoldingMonthlyIncome(holding) {
  return Number((((Number(holding.marketValue) * Number(holding.annualYieldPercent)) / 100) / 12).toFixed(2))
}

export function calculateHoldingAnnualIncome(holding) {
  return Number((Number(holding.estimatedMonthlyIncome ?? calculateHoldingMonthlyIncome(holding)) * 12).toFixed(2))
}

export function normalizeHolding(holding) {
  const estimatedMonthlyIncome = calculateHoldingMonthlyIncome(holding)

  return {
    ...holding,
    estimatedMonthlyIncome,
    estimatedAnnualIncome: calculateHoldingAnnualIncome({ estimatedMonthlyIncome }),
  }
}

export function normalizeAccount(account) {
  const holdings = (account.holdings ?? []).map(normalizeHolding)
  const holdingsMarketValue = holdings.reduce((sum, holding) => sum + Number(holding.marketValue), 0)

  return {
    ...account,
    balance: holdingsMarketValue || Number(account.balance) || 0,
    monthlyContribution: Number(account.monthlyContribution) || 0,
    holdings,
  }
}

export function calculateAccountMonthlyIncome(account) {
  return Number(
    (account.holdings ?? []).reduce(
      (sum, holding) => sum + Number(holding.estimatedMonthlyIncome ?? calculateHoldingMonthlyIncome(holding)),
      0,
    ).toFixed(2),
  )
}

export function calculateHouseholdMetrics(accounts) {
  const normalizedAccounts = accounts.map(normalizeAccount)
  const holdings = normalizedAccounts.flatMap((account) =>
    account.holdings.map((holding) => ({
      ...holding,
      owner: account.owner,
      accountName: account.accountName,
      accountId: account.id,
      accountType: account.accountType,
    })),
  )

  const totalHouseholdNetWorth = normalizedAccounts.reduce((sum, account) => sum + Number(account.balance), 0)
  const totalCashSavings = normalizedAccounts
    .filter((account) => ['Savings', 'Cash'].includes(account.accountType))
    .reduce((sum, account) => sum + Number(account.balance), 0)
  const totalInvestedAssets = totalHouseholdNetWorth - totalCashSavings
  const monthlyPortfolioIncome = Number(
    holdings.reduce((sum, holding) => sum + Number(holding.estimatedMonthlyIncome), 0).toFixed(2),
  )
  const annualPortfolioIncome = Number((monthlyPortfolioIncome * 12).toFixed(2))
  const holdingsMarketValue = holdings.reduce((sum, holding) => sum + Number(holding.marketValue), 0)
  const weightedPortfolioYield = holdingsMarketValue
    ? Number(((annualPortfolioIncome / holdingsMarketValue) * 100).toFixed(2))
    : 0
  const monthlyHouseholdContributions = normalizedAccounts.reduce(
    (sum, account) => sum + Number(account.monthlyContribution),
    0,
  )

  return {
    accounts: normalizedAccounts,
    holdings,
    totalHouseholdNetWorth,
    totalInvestedAssets,
    totalCashSavings,
    holdingsMarketValue,
    monthlyPortfolioIncome,
    annualPortfolioIncome,
    weightedPortfolioYield,
    monthlyHouseholdContributions,
    numberOfAccounts: normalizedAccounts.length,
  }
}

export function groupAccountsByOwner(accounts) {
  const metrics = calculateHouseholdMetrics(accounts)

  return accountOwners.map((owner) => {
    const ownerAccounts = metrics.accounts.filter((account) => account.owner === owner)
    return {
      owner,
      totalBalance: ownerAccounts.reduce((sum, account) => sum + Number(account.balance), 0),
      monthlyContributions: ownerAccounts.reduce((sum, account) => sum + Number(account.monthlyContribution), 0),
      monthlyIncome: Number(ownerAccounts.reduce((sum, account) => sum + calculateAccountMonthlyIncome(account), 0).toFixed(2)),
      annualIncome: Number(ownerAccounts.reduce((sum, account) => sum + calculateAccountMonthlyIncome(account) * 12, 0).toFixed(2)),
      accountCount: ownerAccounts.length,
      accounts: ownerAccounts,
    }
  })
}

export function groupAccountsByAccountType(accounts) {
  const metrics = calculateHouseholdMetrics(accounts)

  return accountTypes
    .map((accountType) => {
      const matchingAccounts = metrics.accounts.filter((account) => account.accountType === accountType)
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
  const metrics = calculateHouseholdMetrics(accounts)
  const map = new Map(displayCategories.map((category) => [category, 0]))

  metrics.holdings.forEach((holding) => {
    const normalizedCategory = displayCategories.includes(holding.category) ? holding.category : 'Other'
    map.set(normalizedCategory, Number(((map.get(normalizedCategory) ?? 0) + holding.estimatedMonthlyIncome).toFixed(2)))
  })

  return displayCategories.map((category) => {
    const monthlyIncome = map.get(category) ?? 0
    const annualIncome = Number((monthlyIncome * 12).toFixed(2))
    const portfolioShare = metrics.monthlyPortfolioIncome
      ? Number(((monthlyIncome / metrics.monthlyPortfolioIncome) * 100).toFixed(2))
      : 0

    return {
      category,
      monthlyIncome,
      annualIncome,
      portfolioShare,
    }
  })
}

export function groupIncomeByAccount(accounts) {
  const metrics = calculateHouseholdMetrics(accounts)

  return metrics.accounts
    .map((account) => {
      const monthlyIncome = calculateAccountMonthlyIncome(account)
      return {
        id: account.id,
        owner: account.owner,
        accountName: account.accountName,
        accountType: account.accountType,
        monthlyIncome,
        annualIncome: Number((monthlyIncome * 12).toFixed(2)),
      }
    })
    .sort((a, b) => b.monthlyIncome - a.monthlyIncome)
}

export function buildNetWorthProjection(accounts, months = 12) {
  const metrics = calculateHouseholdMetrics(accounts)
  return Array.from({ length: months }, (_, index) => ({
    label: index === 0 ? 'Now' : `+${index}m`,
    netWorth: metrics.totalHouseholdNetWorth + metrics.monthlyHouseholdContributions * index,
  }))
}

export function buildFireMetrics(accounts, monthlyTarget = FIRE_MONTHLY_TARGET) {
  const metrics = calculateHouseholdMetrics(accounts)
  const annualFireTarget = Number((monthlyTarget * 12).toFixed(2))
  const coverageRatio = monthlyTarget ? Number((metrics.monthlyPortfolioIncome / monthlyTarget).toFixed(4)) : 0
  const remainingIncomeGap = Math.max(Number((monthlyTarget - metrics.monthlyPortfolioIncome).toFixed(2)), 0)

  return {
    monthlyTarget,
    annualFireTarget,
    currentPassiveIncome: metrics.monthlyPortfolioIncome,
    coverageRatio,
    remainingIncomeGap,
    progressPercent: Math.min(coverageRatio * 100, 100),
  }
}

export function summarizeCashFlowRows(rows, key) {
  const map = new Map()
  rows.forEach((row) => {
    const bucket = row[key] || 'Unassigned'
    map.set(bucket, Number(((map.get(bucket) ?? 0) + Number(row.amount)).toFixed(2)))
  })
  return [...map.entries()]
    .map(([label, amount]) => ({ label, amount }))
    .sort((a, b) => b.amount - a.amount)
}

export function calculateGoalProgress(goal) {
  if (!goal.targetAmount) return 0
  return Math.min((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100, 100)
}
