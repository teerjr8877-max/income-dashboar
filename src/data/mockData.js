export const accountOwners = ['JR', 'Lisa', 'Joint']
export const accountTypes = ['Brokerage', 'Roth IRA', '401k', 'Savings', 'Cash', 'HSA']
export const holdingCategories = ['Amplified Income', 'Alternative Income', 'Anchor', 'Growth', 'Cash', 'Other']
export const cashFlowCategories = {
  income: ['Salary', 'Portfolio', 'Rental', 'Side Hustle', 'Other'],
  expenses: ['Mortgage', 'Utilities', 'Insurance', 'Groceries', 'Travel', 'Investments', 'Childcare', 'Other'],
}

export const plannerGoalOrder = ['Emergency Fund', 'Retirement', 'Real Estate / Down Payment', 'Travel / Sinking Fund']
export const strategyOrder = ['Amplified Income', 'Alternative Income', 'Anchor', 'Growth', 'Cash', 'Other']
export const distributionPatterns = {
  monthly: Array(12).fill(1 / 12),
  quarterlyEnd: [0, 0, 0.25, 0, 0, 0.25, 0, 0, 0.25, 0, 0, 0.25],
  quarterlyStart: [0.25, 0, 0, 0.25, 0, 0, 0.25, 0, 0, 0.25, 0, 0],
  quarterlyMid: [0, 0.25, 0, 0, 0.25, 0, 0, 0.25, 0, 0, 0.25, 0],
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeDistribution(pattern) {
  if (!Array.isArray(pattern) || pattern.length !== 12) {
    return [...distributionPatterns.monthly]
  }

  const normalized = pattern.map((value) => Math.max(toNumber(value, 0), 0))
  const total = normalized.reduce((sum, value) => sum + value, 0)

  if (!total) {
    return [...distributionPatterns.monthly]
  }

  return normalized.map((value) => Number((value / total).toFixed(6)))
}

function calculateHoldingAnnualIncomeFromYield(holding) {
  return Number((((toNumber(holding.marketValue) * toNumber(holding.annualYieldPercent)) / 100)).toFixed(2))
}

function createHolding({
  id,
  ticker,
  holdingName,
  shares,
  marketValue,
  costBasis,
  annualYieldPercent,
  estimatedMonthlyIncome,
  category,
  monthlyDistribution,
}) {
  const normalizedMarketValue = toNumber(marketValue)
  const normalizedYield = toNumber(annualYieldPercent)
  const monthlyIncome = Number(
    (estimatedMonthlyIncome ?? calculateHoldingAnnualIncomeFromYield({ marketValue: normalizedMarketValue, annualYieldPercent: normalizedYield }) / 12).toFixed(2),
  )

  return {
    id,
    ticker,
    holdingName,
    shares: toNumber(shares),
    marketValue: normalizedMarketValue,
    costBasis: toNumber(costBasis, normalizedMarketValue),
    annualYieldPercent: normalizedYield,
    estimatedMonthlyIncome: monthlyIncome,
    category,
    monthlyDistribution: normalizeDistribution(monthlyDistribution ?? distributionPatterns.monthly),
  }
}

function createAccount({
  id,
  owner,
  accountName,
  institution,
  accountType,
  balance,
  monthlyContribution,
  notes,
  holdings,
}) {
  const normalizedHoldings = (holdings ?? []).map((holding) => createHolding(holding))
  const holdingsMarketValue = normalizedHoldings.reduce((sum, holding) => sum + toNumber(holding.marketValue), 0)

  return {
    id,
    owner,
    accountName,
    institution,
    accountType,
    balance: holdingsMarketValue || toNumber(balance),
    monthlyContribution: toNumber(monthlyContribution),
    notes: notes ?? '',
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
    balance: 143900,
    monthlyContribution: 1800,
    notes: 'Primary taxable income portfolio blending high-income ETFs, quality dividend growers, and liquidity for opportunistic deployment.',
    holdings: [
      { id: 101, ticker: 'SPYI', holdingName: 'NEOS S&P 500 High Income ETF', shares: 910.2, marketValue: 45400, costBasis: 42180, annualYieldPercent: 12.1, category: 'Amplified Income', monthlyDistribution: distributionPatterns.monthly },
      { id: 102, ticker: 'JEPI', holdingName: 'JPMorgan Equity Premium Income ETF', shares: 286.4, marketValue: 16520, costBasis: 14980, annualYieldPercent: 7.8, category: 'Amplified Income', monthlyDistribution: distributionPatterns.monthly },
      { id: 103, ticker: 'DGRO', holdingName: 'iShares Core Dividend Growth ETF', shares: 208.6, marketValue: 12940, costBasis: 10120, annualYieldPercent: 2.4, category: 'Anchor', monthlyDistribution: distributionPatterns.quarterlyEnd },
      { id: 104, ticker: 'VTI', holdingName: 'Vanguard Total Stock Market ETF', shares: 141.7, marketValue: 39450, costBasis: 28110, annualYieldPercent: 1.3, category: 'Growth', monthlyDistribution: distributionPatterns.quarterlyEnd },
      { id: 105, ticker: 'QQQI', holdingName: 'NEOS Nasdaq 100 High Income ETF', shares: 148.2, marketValue: 9110, costBasis: 8240, annualYieldPercent: 13.4, category: 'Alternative Income', monthlyDistribution: distributionPatterns.monthly },
      { id: 106, ticker: 'CASH', holdingName: 'Brokerage Cash Position', shares: 1, marketValue: 20480, costBasis: 20480, annualYieldPercent: 4.2, category: 'Cash', monthlyDistribution: distributionPatterns.monthly },
    ],
  }),
  createAccount({
    id: 2,
    owner: 'JR',
    accountName: 'JR Roth IRA',
    institution: 'Fidelity',
    accountType: 'Roth IRA',
    balance: 161400,
    monthlyContribution: 583,
    notes: 'Tax-free retirement sleeve prioritizing dividend growth, cash flow durability, and broad market compounding.',
    holdings: [
      { id: 201, ticker: 'DGRO', holdingName: 'iShares Core Dividend Growth ETF', shares: 395.5, marketValue: 24520, costBasis: 18840, annualYieldPercent: 2.4, category: 'Anchor', monthlyDistribution: distributionPatterns.quarterlyEnd },
      { id: 202, ticker: 'VTI', holdingName: 'Vanguard Total Stock Market ETF', shares: 188.1, marketValue: 52380, costBasis: 36910, annualYieldPercent: 1.3, category: 'Growth', monthlyDistribution: distributionPatterns.quarterlyEnd },
      { id: 203, ticker: 'JEPI', holdingName: 'JPMorgan Equity Premium Income ETF', shares: 268.9, marketValue: 15530, costBasis: 13660, annualYieldPercent: 7.8, category: 'Amplified Income', monthlyDistribution: distributionPatterns.monthly },
      { id: 204, ticker: 'SCHD', holdingName: 'Schwab U.S. Dividend Equity ETF', shares: 230.6, marketValue: 41010, costBasis: 31320, annualYieldPercent: 3.5, category: 'Anchor', monthlyDistribution: distributionPatterns.quarterlyEnd },
      { id: 205, ticker: 'CASH', holdingName: 'Roth Cash Sweep', shares: 1, marketValue: 27960, costBasis: 27960, annualYieldPercent: 4.1, category: 'Cash', monthlyDistribution: distributionPatterns.monthly },
    ],
  }),
  createAccount({
    id: 3,
    owner: 'JR',
    accountName: 'JR 401k',
    institution: 'Empower',
    accountType: '401k',
    balance: 240300,
    monthlyContribution: 1950,
    notes: 'Employer retirement plan focused on total market growth with a stabilizing income and cash reserve sleeve.',
    holdings: [
      { id: 301, ticker: 'VTI', holdingName: 'Vanguard Total Stock Market ETF', shares: 362.4, marketValue: 100820, costBasis: 72450, annualYieldPercent: 1.3, category: 'Growth', monthlyDistribution: distributionPatterns.quarterlyEnd },
      { id: 302, ticker: 'FXAIX', holdingName: 'Fidelity 500 Index Fund', shares: 318.1, marketValue: 68740, costBasis: 48510, annualYieldPercent: 1.4, category: 'Growth', monthlyDistribution: distributionPatterns.quarterlyEnd },
      { id: 303, ticker: 'TR2055', holdingName: 'Target Retirement 2055 Fund', shares: 1650.2, marketValue: 51840, costBasis: 42600, annualYieldPercent: 2, category: 'Anchor', monthlyDistribution: distributionPatterns.quarterlyMid },
      { id: 304, ticker: 'STBL', holdingName: 'Stable Value Fund', shares: 1, marketValue: 18900, costBasis: 18240, annualYieldPercent: 3.1, category: 'Cash', monthlyDistribution: distributionPatterns.monthly },
    ],
  }),
  createAccount({
    id: 4,
    owner: 'Lisa',
    accountName: 'Lisa Roth IRA',
    institution: 'Charles Schwab',
    accountType: 'Roth IRA',
    balance: 142100,
    monthlyContribution: 583,
    notes: "Lisa's tax-free compounding sleeve balancing broad growth, dividend growth, and a measured income overlay.",
    holdings: [
      { id: 401, ticker: 'VTI', holdingName: 'Vanguard Total Stock Market ETF', shares: 176.8, marketValue: 49210, costBasis: 34220, annualYieldPercent: 1.3, category: 'Growth', monthlyDistribution: distributionPatterns.quarterlyEnd },
      { id: 402, ticker: 'DGRO', holdingName: 'iShares Core Dividend Growth ETF', shares: 222.1, marketValue: 13780, costBasis: 10580, annualYieldPercent: 2.4, category: 'Anchor', monthlyDistribution: distributionPatterns.quarterlyEnd },
      { id: 403, ticker: 'JEPI', holdingName: 'JPMorgan Equity Premium Income ETF', shares: 194.4, marketValue: 11220, costBasis: 10190, annualYieldPercent: 7.8, category: 'Amplified Income', monthlyDistribution: distributionPatterns.monthly },
      { id: 404, ticker: 'SCHG', holdingName: 'Schwab U.S. Large-Cap Growth ETF', shares: 295.3, marketValue: 65650, costBasis: 43820, annualYieldPercent: 0.4, category: 'Growth', monthlyDistribution: distributionPatterns.quarterlyEnd },
      { id: 405, ticker: 'CASH', holdingName: 'Roth Cash Sweep', shares: 1, marketValue: 22240, costBasis: 22240, annualYieldPercent: 4.1, category: 'Cash', monthlyDistribution: distributionPatterns.monthly },
    ],
  }),
  createAccount({
    id: 5,
    owner: 'Lisa',
    accountName: 'Lisa 401k',
    institution: 'Vanguard',
    accountType: '401k',
    balance: 279800,
    monthlyContribution: 1750,
    notes: 'Core retirement engine with global equities, target-date ballast, and a cash sleeve supporting income resiliency.',
    holdings: [
      { id: 501, ticker: 'VIIIX', holdingName: 'Vanguard Institutional Index Fund', shares: 192.6, marketValue: 62850, costBasis: 45800, annualYieldPercent: 1.4, category: 'Growth', monthlyDistribution: distributionPatterns.quarterlyEnd },
      { id: 502, ticker: 'VTIAX', holdingName: 'Vanguard Total International Stock Index Fund', shares: 820.5, marketValue: 30240, costBasis: 24860, annualYieldPercent: 3, category: 'Growth', monthlyDistribution: distributionPatterns.quarterlyMid },
      { id: 503, ticker: 'TR2055', holdingName: 'Target Retirement 2055 Fund', shares: 2541.8, marketValue: 129840, costBasis: 99820, annualYieldPercent: 2, category: 'Anchor', monthlyDistribution: distributionPatterns.quarterlyMid },
      { id: 504, ticker: 'VBTIX', holdingName: 'Vanguard Total Bond Market Index Fund', shares: 2320.4, marketValue: 28190, costBasis: 30140, annualYieldPercent: 3.2, category: 'Anchor', monthlyDistribution: distributionPatterns.monthly },
      { id: 505, ticker: 'CASH', holdingName: 'Plan Settlement Cash', shares: 1, marketValue: 28680, costBasis: 28680, annualYieldPercent: 3.8, category: 'Cash', monthlyDistribution: distributionPatterns.monthly },
    ],
  }),
  createAccount({
    id: 6,
    owner: 'Joint',
    accountName: 'Joint Savings',
    institution: 'Ally Bank',
    accountType: 'Savings',
    balance: 49200,
    monthlyContribution: 1400,
    notes: 'Emergency reserve and sinking fund capital producing dependable interest while staying liquid.',
    holdings: [
      { id: 601, ticker: 'HYSA', holdingName: 'High-Yield Savings', shares: 1, marketValue: 33800, costBasis: 33800, annualYieldPercent: 4.3, category: 'Cash', monthlyDistribution: distributionPatterns.monthly },
      { id: 602, ticker: 'MMF', holdingName: 'Money Market Bucket', shares: 1, marketValue: 15400, costBasis: 15400, annualYieldPercent: 4.7, category: 'Cash', monthlyDistribution: distributionPatterns.monthly },
    ],
  }),
  createAccount({
    id: 7,
    owner: 'Joint',
    accountName: 'Joint Income Portfolio',
    institution: 'M1 Finance',
    accountType: 'Brokerage',
    balance: 94800,
    monthlyContribution: 900,
    notes: 'Joint taxable sleeve intentionally built for household passive income and reinvestment snowballing.',
    holdings: [
      { id: 701, ticker: 'SPYI', holdingName: 'NEOS S&P 500 High Income ETF', shares: 318.4, marketValue: 15890, costBasis: 14640, annualYieldPercent: 12.1, category: 'Amplified Income', monthlyDistribution: distributionPatterns.monthly },
      { id: 702, ticker: 'UTG', holdingName: 'Reaves Utility Income Fund', shares: 462.2, marketValue: 14680, costBasis: 13920, annualYieldPercent: 7.4, category: 'Alternative Income', monthlyDistribution: distributionPatterns.monthly },
      { id: 703, ticker: 'SCHD', holdingName: 'Schwab U.S. Dividend Equity ETF', shares: 145.1, marketValue: 25840, costBasis: 19110, annualYieldPercent: 3.5, category: 'Anchor', monthlyDistribution: distributionPatterns.quarterlyEnd },
      { id: 704, ticker: 'VTI', holdingName: 'Vanguard Total Stock Market ETF', shares: 91.2, marketValue: 25320, costBasis: 17890, annualYieldPercent: 1.3, category: 'Growth', monthlyDistribution: distributionPatterns.quarterlyEnd },
      { id: 705, ticker: 'CASH', holdingName: 'Treasury Sweep', shares: 1, marketValue: 13070, costBasis: 13070, annualYieldPercent: 4.8, category: 'Cash', monthlyDistribution: distributionPatterns.monthly },
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
  { id: 1, title: 'Emergency Fund', targetAmount: 50000, currentAmount: 49200, monthlyContribution: 1400 },
  { id: 2, title: 'Retirement', targetAmount: 2000000, currentAmount: 823600, monthlyContribution: 4866 },
  { id: 3, title: 'Real Estate / Down Payment', targetAmount: 150000, currentAmount: 42000, monthlyContribution: 900 },
  { id: 4, title: 'Travel / Sinking Fund', targetAmount: 24000, currentAmount: 12600, monthlyContribution: 650 },
]

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(toNumber(value))
}

export function formatCurrencyPrecise(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toNumber(value))
}

export function formatPercent(value) {
  return `${toNumber(value).toFixed(1)}%`
}

export function formatMultiple(value) {
  return `${toNumber(value).toFixed(2)}x`
}

export function calculateHoldingAnnualIncome(holding) {
  if (holding?.estimatedMonthlyIncome !== undefined && holding?.estimatedMonthlyIncome !== null) {
    return Number((toNumber(holding.estimatedMonthlyIncome) * 12).toFixed(2))
  }

  return calculateHoldingAnnualIncomeFromYield(holding ?? {})
}

export function calculateHoldingMonthlyIncome(holding) {
  if (holding?.estimatedMonthlyIncome !== undefined && holding?.estimatedMonthlyIncome !== null) {
    return Number(toNumber(holding.estimatedMonthlyIncome).toFixed(2))
  }

  return Number((calculateHoldingAnnualIncomeFromYield(holding ?? {}) / 12).toFixed(2))
}

export function calculateHoldingMonthlySchedule(holding) {
  const annualIncome = calculateHoldingAnnualIncome(holding)
  const weights = normalizeDistribution(holding?.monthlyDistribution)
  return weights.map((weight) => Number((annualIncome * weight).toFixed(2)))
}

export function normalizeHolding(holding = {}) {
  const normalized = createHolding({
    id: holding.id ?? Date.now(),
    ticker: String(holding.ticker ?? '').trim().toUpperCase(),
    holdingName: String(holding.holdingName ?? '').trim(),
    shares: holding.shares,
    marketValue: holding.marketValue,
    costBasis: holding.costBasis,
    annualYieldPercent: holding.annualYieldPercent,
    estimatedMonthlyIncome: holding.estimatedMonthlyIncome,
    category: holdingCategories.includes(holding.category) ? holding.category : 'Other',
    monthlyDistribution: holding.monthlyDistribution,
  })

  return {
    ...normalized,
    estimatedAnnualIncome: calculateHoldingAnnualIncome(normalized),
  }
}

export function normalizeAccount(account = {}) {
  const holdings = Array.isArray(account.holdings) ? account.holdings.map(normalizeHolding) : []
  const holdingsMarketValue = holdings.reduce((sum, holding) => sum + toNumber(holding.marketValue), 0)

  return {
    id: account.id ?? Date.now(),
    owner: accountOwners.includes(account.owner) ? account.owner : 'Joint',
    accountName: String(account.accountName ?? '').trim(),
    institution: String(account.institution ?? '').trim(),
    accountType: accountTypes.includes(account.accountType) ? account.accountType : 'Brokerage',
    balance: Number((holdingsMarketValue || toNumber(account.balance)).toFixed(2)),
    monthlyContribution: Number(toNumber(account.monthlyContribution).toFixed(2)),
    notes: String(account.notes ?? '').trim(),
    holdings,
  }
}

export function calculateAccountMonthlyIncome(account = {}) {
  return Number(
    ((Array.isArray(account.holdings) ? account.holdings : []).reduce(
      (sum, holding) => sum + calculateHoldingMonthlyIncome(holding),
      0,
    )).toFixed(2),
  )
}

function normalizeAccounts(accounts) {
  return (Array.isArray(accounts) ? accounts : []).map(normalizeAccount)
}

export function flattenHoldings(accounts) {
  return normalizeAccounts(accounts).flatMap((account) =>
    account.holdings.map((holding) => {
      const annualIncome = calculateHoldingAnnualIncome(holding)
      const monthlyIncome = calculateHoldingMonthlyIncome(holding)
      const marketValue = toNumber(holding.marketValue)
      const costBasis = toNumber(holding.costBasis)

      return {
        ...holding,
        owner: account.owner,
        accountName: account.accountName,
        accountId: account.id,
        institution: account.institution,
        accountType: account.accountType,
        annualIncome,
        monthlyIncome,
        currentYieldPercent: marketValue ? (annualIncome / marketValue) * 100 : 0,
        yieldOnCostPercent: costBasis ? (annualIncome / costBasis) * 100 : 0,
      }
    }),
  )
}

export function calculateHouseholdMetrics(accounts, cashFlow = { expenses: [] }) {
  const normalizedAccounts = normalizeAccounts(accounts)
  const holdings = flattenHoldings(normalizedAccounts)
  const totalHouseholdNetWorth = normalizedAccounts.reduce((sum, account) => sum + toNumber(account.balance), 0)
  const totalCashSavings = normalizedAccounts
    .filter((account) => ['Savings', 'Cash'].includes(account.accountType))
    .reduce((sum, account) => sum + toNumber(account.balance), 0)
  const totalInvestedAssets = totalHouseholdNetWorth - totalCashSavings
  const portfolioMarketValue = holdings.reduce((sum, holding) => sum + toNumber(holding.marketValue), 0)
  const totalCostBasis = holdings.reduce((sum, holding) => sum + toNumber(holding.costBasis), 0)
  const monthlyPortfolioIncome = holdings.reduce((sum, holding) => sum + toNumber(holding.monthlyIncome), 0)
  const annualPortfolioIncome = holdings.reduce((sum, holding) => sum + toNumber(holding.annualIncome), 0)
  const monthlyHouseholdContributions = normalizedAccounts.reduce((sum, account) => sum + toNumber(account.monthlyContribution), 0)
  const monthlyHouseholdExpenses = (Array.isArray(cashFlow?.expenses) ? cashFlow.expenses : []).reduce((sum, row) => sum + toNumber(row.amount), 0)
  const weightedPortfolioYield = portfolioMarketValue ? (annualPortfolioIncome / portfolioMarketValue) * 100 : 0
  const yieldOnCost = totalCostBasis ? (annualPortfolioIncome / totalCostBasis) * 100 : 0
  const incomeCoverageRatio = monthlyHouseholdExpenses ? monthlyPortfolioIncome / monthlyHouseholdExpenses : 0
  const contributionToIncomeConversion = (1000 * weightedPortfolioYield) / 100

  return {
    accounts: normalizedAccounts,
    holdings,
    totalHouseholdNetWorth: Number(totalHouseholdNetWorth.toFixed(2)),
    totalInvestedAssets: Number(totalInvestedAssets.toFixed(2)),
    totalCashSavings: Number(totalCashSavings.toFixed(2)),
    portfolioMarketValue: Number(portfolioMarketValue.toFixed(2)),
    totalCostBasis: Number(totalCostBasis.toFixed(2)),
    monthlyPortfolioIncome: Number(monthlyPortfolioIncome.toFixed(2)),
    annualPortfolioIncome: Number(annualPortfolioIncome.toFixed(2)),
    weightedPortfolioYield,
    monthlyHouseholdContributions: Number(monthlyHouseholdContributions.toFixed(2)),
    monthlyHouseholdExpenses: Number(monthlyHouseholdExpenses.toFixed(2)),
    yieldOnCost,
    incomeCoverageRatio,
    contributionToIncomeConversion: Number(contributionToIncomeConversion.toFixed(2)),
    numberOfAccounts: normalizedAccounts.length,
    holdingsCount: holdings.length,
  }
}

export function groupAccountsByOwner(accounts) {
  const metrics = calculateHouseholdMetrics(accounts)

  return accountOwners.map((owner) => {
    const ownerAccounts = metrics.accounts.filter((account) => account.owner === owner)
    return {
      owner,
      totalBalance: ownerAccounts.reduce((sum, account) => sum + toNumber(account.balance), 0),
      monthlyContributions: ownerAccounts.reduce((sum, account) => sum + toNumber(account.monthlyContribution), 0),
      monthlyIncome: ownerAccounts.reduce((sum, account) => sum + calculateAccountMonthlyIncome(account), 0),
      annualIncome: ownerAccounts.reduce((sum, account) => sum + calculateAccountMonthlyIncome(account) * 12, 0),
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
        totalBalance: matchingAccounts.reduce((sum, account) => sum + toNumber(account.balance), 0),
        accountCount: matchingAccounts.length,
      }
    })
    .filter((group) => group.accountCount > 0)
}

export function groupIncomeByCategory(accounts) {
  const holdings = flattenHoldings(accounts)

  return strategyOrder.map((category) => {
    const categoryHoldings = holdings.filter((holding) => (strategyOrder.includes(holding.category) ? holding.category : 'Other') === category)
    const marketValue = categoryHoldings.reduce((sum, holding) => sum + toNumber(holding.marketValue), 0)
    const annualIncome = categoryHoldings.reduce((sum, holding) => sum + toNumber(holding.annualIncome), 0)
    const monthlyIncome = categoryHoldings.reduce((sum, holding) => sum + toNumber(holding.monthlyIncome), 0)

    return {
      category,
      marketValue: Number(marketValue.toFixed(2)),
      monthlyIncome: Number(monthlyIncome.toFixed(2)),
      annualIncome: Number(annualIncome.toFixed(2)),
      weightedYield: marketValue ? (annualIncome / marketValue) * 100 : 0,
    }
  })
}

export function groupIncomeByOwner(accounts) {
  const holdings = flattenHoldings(accounts)
  const totalAnnualIncome = holdings.reduce((sum, holding) => sum + toNumber(holding.annualIncome), 0)

  return accountOwners.map((owner) => {
    const ownerHoldings = holdings.filter((holding) => holding.owner === owner)
    const annualIncome = ownerHoldings.reduce((sum, holding) => sum + toNumber(holding.annualIncome), 0)
    const monthlyIncome = ownerHoldings.reduce((sum, holding) => sum + toNumber(holding.monthlyIncome), 0)

    return {
      owner,
      monthlyIncome: Number(monthlyIncome.toFixed(2)),
      annualIncome: Number(annualIncome.toFixed(2)),
      passiveIncomeShare: totalAnnualIncome ? (annualIncome / totalAnnualIncome) * 100 : 0,
    }
  })
}

export function groupIncomeByAccount(accounts) {
  return normalizeAccounts(accounts).map((account) => {
    const annualIncome = account.holdings.reduce((sum, holding) => sum + calculateHoldingAnnualIncome(holding), 0)
    const monthlyIncome = annualIncome / 12

    return {
      id: account.id,
      accountName: account.accountName,
      owner: account.owner,
      accountType: account.accountType,
      currentBalance: account.balance,
      monthlyIncome: Number(monthlyIncome.toFixed(2)),
      annualIncome: Number(annualIncome.toFixed(2)),
      weightedYield: account.balance ? (annualIncome / toNumber(account.balance)) * 100 : 0,
    }
  })
}

export function buildNetWorthProjection(accounts, months = 12) {
  const metrics = calculateHouseholdMetrics(accounts)

  return Array.from({ length: months }, (_, index) => ({
    label: index === 0 ? 'Now' : `+${index}m`,
    netWorth: Number((metrics.totalHouseholdNetWorth + metrics.monthlyHouseholdContributions * index).toFixed(2)),
  }))
}

export function buildForwardIncomeProjection(accounts, months = 12) {
  const holdings = flattenHoldings(accounts)
  const schedules = holdings.map((holding) => calculateHoldingMonthlySchedule(holding))
  const labels = Array.from({ length: months }, (_, index) => {
    const date = new Date()
    date.setMonth(date.getMonth() + index)
    return date.toLocaleString('en-US', { month: 'short' })
  })

  const points = labels.map((label, index) => {
    const total = schedules.reduce((sum, schedule) => sum + toNumber(schedule[index % 12]), 0)
    return { label, total: Number(total.toFixed(2)) }
  })

  return {
    points,
    annualTotal: Number(points.reduce((sum, point) => sum + point.total, 0).toFixed(2)),
  }
}

export function buildContributionImpact(metrics, contributionLevels = [100, 500, 1000]) {
  return contributionLevels.map((amount) => ({
    amount,
    annualIncomeIncrease: Number((((amount * 12) * toNumber(metrics.weightedPortfolioYield)) / 100).toFixed(2)),
    monthlyIncomeIncrease: Number((((amount * 12) * toNumber(metrics.weightedPortfolioYield)) / 100 / 12).toFixed(2)),
  }))
}

export function buildIncomeSnowball(metrics, years = [1, 3, 5]) {
  const monthlyYieldRate = toNumber(metrics.weightedPortfolioYield) / 100 / 12

  return years.map((yearsOut) => {
    let principal = toNumber(metrics.portfolioMarketValue)

    for (let month = 0; month < yearsOut * 12; month += 1) {
      const monthlyIncome = principal * monthlyYieldRate
      principal += toNumber(metrics.monthlyHouseholdContributions) + monthlyIncome
    }

    const annualIncome = principal * (toNumber(metrics.weightedPortfolioYield) / 100)

    return {
      years: yearsOut,
      portfolioValue: Number(principal.toFixed(2)),
      annualIncome: Number(annualIncome.toFixed(2)),
    }
  })
}

export function buildFireMetrics(accounts, monthlyTarget = 10000) {
  const metrics = calculateHouseholdMetrics(accounts)
  const currentPassiveIncome = metrics.monthlyPortfolioIncome
  const remainingIncomeGap = Math.max(monthlyTarget - currentPassiveIncome, 0)
  const coverageRatio = monthlyTarget ? currentPassiveIncome / monthlyTarget : 0

  return {
    monthlyTarget,
    annualFireTarget: monthlyTarget * 12,
    currentPassiveIncome,
    remainingIncomeGap: Number(remainingIncomeGap.toFixed(2)),
    coverageRatio,
  }
}

function createSeededRandom(seed) {
  let state = Math.floor(toNumber(seed, Date.now())) % 2147483647
  if (state <= 0) state += 2147483646

  return () => {
    state = (state * 16807) % 2147483647
    return (state - 1) / 2147483646
  }
}

function sampleNormal(random) {
  const u1 = Math.max(random(), Number.EPSILON)
  const u2 = Math.max(random(), Number.EPSILON)
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

export function buildFireMonteCarloSimulation(accounts, options = {}) {
  const metrics = calculateHouseholdMetrics(accounts)
  const years = Math.max(Math.floor(toNumber(options.years, 15)), 1)
  const simulations = Math.max(Math.floor(toNumber(options.simulations, 400)), 50)
  const monthlyTarget = Math.max(toNumber(options.monthlyTarget, 10000), 0)
  const expectedAnnualReturn = toNumber(options.expectedAnnualReturn, 0.07)
  const annualVolatility = Math.max(toNumber(options.annualVolatility, 0.12), 0)
  const incomeYieldPercent = Math.max(toNumber(options.incomeYieldPercent, metrics.weightedPortfolioYield / 100), 0)
  const monthlyContribution = Math.max(toNumber(options.monthlyContribution, metrics.monthlyHouseholdContributions), 0)
  const startingBalance = Math.max(toNumber(options.startingBalance, metrics.portfolioMarketValue), 0)
  const random = createSeededRandom(options.seed ?? 42)
  const monthCount = years * 12
  const terminalMonthlyIncome = []
  const hitTargetMonths = []

  for (let run = 0; run < simulations; run += 1) {
    let balance = startingBalance
    let firstHitMonth = null

    for (let month = 1; month <= monthCount; month += 1) {
      const monthlyReturnDrift = expectedAnnualReturn / 12
      const monthlyVolatility = annualVolatility / Math.sqrt(12)
      const randomShock = sampleNormal(random)
      const growthRate = Math.max(monthlyReturnDrift + randomShock * monthlyVolatility, -0.95)
      const incomeCashFlow = balance * (incomeYieldPercent / 12)

      balance = Math.max(balance * (1 + growthRate) + monthlyContribution + incomeCashFlow, 0)

      const projectedMonthlyIncome = balance * (incomeYieldPercent / 12)
      if (firstHitMonth === null && projectedMonthlyIncome >= monthlyTarget) {
        firstHitMonth = month
      }
    }

    terminalMonthlyIncome.push(balance * (incomeYieldPercent / 12))
    hitTargetMonths.push(firstHitMonth)
  }

  const sortedTerminalIncome = [...terminalMonthlyIncome].sort((a, b) => a - b)
  const percentileAt = (ratio) => {
    const clamped = Math.min(Math.max(ratio, 0), 1)
    const index = Math.min(Math.floor(clamped * (sortedTerminalIncome.length - 1)), sortedTerminalIncome.length - 1)
    return Number(toNumber(sortedTerminalIncome[index]).toFixed(2))
  }
  const successfulRuns = hitTargetMonths.filter((month) => month !== null).length
  const averageHitMonth = hitTargetMonths.reduce((sum, month) => sum + (month ?? monthCount + 1), 0) / simulations

  return {
    years,
    simulations,
    monthlyTarget: Number(monthlyTarget.toFixed(2)),
    successRate: Number((successfulRuns / simulations).toFixed(4)),
    percentile10Income: percentileAt(0.1),
    percentile50Income: percentileAt(0.5),
    percentile90Income: percentileAt(0.9),
    averageTerminalIncome: Number((terminalMonthlyIncome.reduce((sum, value) => sum + value, 0) / simulations).toFixed(2)),
    averageHitMonth: Number(averageHitMonth.toFixed(1)),
  }
}

export function summarizeCashFlowRows(rows, key) {
  const map = new Map()

  ;(Array.isArray(rows) ? rows : []).forEach((row) => {
    const bucket = row?.[key] || 'Unassigned'
    map.set(bucket, Number(((map.get(bucket) ?? 0) + toNumber(row?.amount)).toFixed(2)))
  })

  return [...map.entries()]
    .map(([label, amount]) => ({ label, amount }))
    .sort((a, b) => b.amount - a.amount)
}

export function calculateGoalProgress(goal) {
  const targetAmount = toNumber(goal?.targetAmount)
  if (!targetAmount) return 0
  return Math.min((toNumber(goal?.currentAmount) / targetAmount) * 100, 100)
}
