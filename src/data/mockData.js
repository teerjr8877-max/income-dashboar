export const accountOwners = ['JR', 'Lisa', 'Joint']
export const accountTypes = ['Roth', 'Brokerage', '401k', 'Savings', 'Cash']
export const holdingCategories = ['Amplified Income', 'Alternative Income', 'Anchor/Defensive', 'Growth', 'Crypto', 'Cash', 'Other']

const createHolding = ({
  id,
  ticker,
  holdingName,
  shares,
  marketValue,
  annualYieldPercent,
  category,
}) => ({
  id,
  ticker,
  holdingName,
  shares,
  marketValue,
  annualYieldPercent,
  estimatedMonthlyIncome: Number(((marketValue * annualYieldPercent) / 100 / 12).toFixed(2)),
  category,
})

export const accountsSeed = [
  {
    id: 1,
    accountName: 'JR Roth',
    owner: 'JR',
    institution: 'Fidelity',
    type: 'Roth',
    currentBalance: 148250,
    monthlyContribution: 583,
    notes: 'Core tax-free dividend and growth sleeve with automated monthly ETF buys.',
    holdings: [
      createHolding({ id: 101, ticker: 'SCHD', holdingName: 'Schwab U.S. Dividend Equity ETF', shares: 220.14, marketValue: 61200, annualYieldPercent: 3.6, category: 'Amplified Income' }),
      createHolding({ id: 102, ticker: 'DGRO', holdingName: 'iShares Core Dividend Growth ETF', shares: 180.5, marketValue: 34150, annualYieldPercent: 2.4, category: 'Anchor/Defensive' }),
      createHolding({ id: 103, ticker: 'VUG', holdingName: 'Vanguard Growth ETF', shares: 52.4, marketValue: 52900, annualYieldPercent: 0.5, category: 'Growth' }),
    ],
  },
  {
    id: 2,
    accountName: 'JR Brokerage',
    owner: 'JR',
    institution: 'M1 Finance',
    type: 'Brokerage',
    currentBalance: 96540,
    monthlyContribution: 1200,
    notes: 'Taxable cash-flow portfolio focused on covered call income and alternative yield.',
    holdings: [
      createHolding({ id: 201, ticker: 'JEPI', holdingName: 'JPMorgan Equity Premium Income ETF', shares: 310.8, marketValue: 17780, annualYieldPercent: 7.8, category: 'Amplified Income' }),
      createHolding({ id: 202, ticker: 'JEPQ', holdingName: 'JPMorgan Nasdaq Equity Premium Income ETF', shares: 248.6, marketValue: 13410, annualYieldPercent: 9.1, category: 'Amplified Income' }),
      createHolding({ id: 203, ticker: 'MAIN', holdingName: 'Main Street Capital', shares: 182.4, marketValue: 10150, annualYieldPercent: 5.7, category: 'Alternative Income' }),
      createHolding({ id: 204, ticker: 'O', holdingName: 'Realty Income', shares: 141.2, marketValue: 7750, annualYieldPercent: 5.8, category: 'Anchor/Defensive' }),
      createHolding({ id: 205, ticker: 'BTC', holdingName: 'Bitcoin', shares: 0.42, marketValue: 31700, annualYieldPercent: 0, category: 'Crypto' }),
      createHolding({ id: 206, ticker: 'CASH', holdingName: 'Brokerage Settlement Cash', shares: 1, marketValue: 15750, annualYieldPercent: 4.2, category: 'Cash' }),
    ],
  },
  {
    id: 3,
    accountName: 'Lisa Roth',
    owner: 'Lisa',
    institution: 'Charles Schwab',
    type: 'Roth',
    currentBalance: 132880,
    monthlyContribution: 583,
    notes: 'Long-term Roth focused on broad market growth with an income ballast.',
    holdings: [
      createHolding({ id: 301, ticker: 'VTI', holdingName: 'Vanguard Total Stock Market ETF', shares: 160.3, marketValue: 45220, annualYieldPercent: 1.3, category: 'Growth' }),
      createHolding({ id: 302, ticker: 'VXUS', holdingName: 'Vanguard Total International Stock ETF', shares: 178.9, marketValue: 10980, annualYieldPercent: 3.1, category: 'Growth' }),
      createHolding({ id: 303, ticker: 'DIVO', holdingName: 'Amplify CWP Enhanced Dividend Income ETF', shares: 296.5, marketValue: 12180, annualYieldPercent: 4.8, category: 'Amplified Income' }),
      createHolding({ id: 304, ticker: 'SCHG', holdingName: 'Schwab U.S. Large-Cap Growth ETF', shares: 290.1, marketValue: 64500, annualYieldPercent: 0.4, category: 'Growth' }),
    ],
  },
  {
    id: 4,
    accountName: 'Lisa 401k',
    owner: 'Lisa',
    institution: 'Vanguard',
    type: '401k',
    currentBalance: 224630,
    monthlyContribution: 1650,
    notes: 'Employer plan with target-date and bond exposure for tax-deferred retirement growth.',
    holdings: [
      createHolding({ id: 401, ticker: 'VFFVX', holdingName: 'Vanguard Target Retirement 2055 Fund', shares: 1840.7, marketValue: 152300, annualYieldPercent: 2.1, category: 'Anchor/Defensive' }),
      createHolding({ id: 402, ticker: 'VIIIX', holdingName: 'Vanguard Institutional Index Fund', shares: 149.1, marketValue: 48600, annualYieldPercent: 1.4, category: 'Growth' }),
      createHolding({ id: 403, ticker: 'VBTIX', holdingName: 'Vanguard Total Bond Market Index Fund', shares: 1880.2, marketValue: 23730, annualYieldPercent: 3.2, category: 'Anchor/Defensive' }),
    ],
  },
  {
    id: 5,
    accountName: 'Joint Savings',
    owner: 'Joint',
    institution: 'Ally Bank',
    type: 'Savings',
    currentBalance: 58240,
    monthlyContribution: 850,
    notes: 'Shared emergency reserve and sinking funds for travel, home projects, and insurance deductibles.',
    holdings: [
      createHolding({ id: 501, ticker: 'HYSA', holdingName: 'High-Yield Savings Reserve', shares: 1, marketValue: 40240, annualYieldPercent: 4.3, category: 'Cash' }),
      createHolding({ id: 502, ticker: 'MMF', holdingName: 'Money Market Sinking Fund', shares: 1, marketValue: 18000, annualYieldPercent: 4.6, category: 'Cash' }),
    ],
  },
]

export const cashFlowSeed = {
  income: [
    { id: 1, label: 'JR salary', amount: 7850 },
    { id: 2, label: 'Lisa salary', amount: 6900 },
    { id: 3, label: 'Rental cash flow', amount: 850 },
    { id: 4, label: 'Portfolio income', amount: 1115 },
  ],
  expenses: [
    { id: 101, label: 'Mortgage + escrow', amount: 3125 },
    { id: 102, label: 'Utilities + internet', amount: 540 },
    { id: 103, label: 'Groceries + dining', amount: 1325 },
    { id: 104, label: 'Insurance', amount: 680 },
    { id: 105, label: 'Travel / sinking funds', amount: 900 },
    { id: 106, label: 'Childcare + activities', amount: 1450 },
  ],
}

export const plannerTargets = {
  emergencyFundTarget: 50000,
  retirementTarget: 1500000,
  sinkingFundTarget: 80000,
  projectionAnnualReturn: 0.05,
}

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

export function calculateAccountMonthlyIncome(account) {
  return account.holdings.reduce((sum, holding) => sum + holding.estimatedMonthlyIncome, 0)
}

export function calculateHouseholdMetrics(accounts) {
  const totalHouseholdNetWorth = accounts.reduce((sum, account) => sum + account.currentBalance, 0)
  const monthlyPortfolioIncome = accounts.reduce((sum, account) => sum + calculateAccountMonthlyIncome(account), 0)
  const monthlyContributions = accounts.reduce((sum, account) => sum + account.monthlyContribution, 0)
  const annualPortfolioIncome = monthlyPortfolioIncome * 12

  return {
    totalHouseholdNetWorth,
    monthlyPortfolioIncome,
    annualPortfolioIncome,
    monthlyContributions,
    numberOfAccounts: accounts.length,
  }
}

export function groupAccountsByOwner(accounts) {
  return accountOwners.map((owner) => {
    const ownerAccounts = accounts.filter((account) => account.owner === owner)
    return {
      owner,
      totalBalance: ownerAccounts.reduce((sum, account) => sum + account.currentBalance, 0),
      monthlyContributions: ownerAccounts.reduce((sum, account) => sum + account.monthlyContribution, 0),
      accountCount: ownerAccounts.length,
      accounts: ownerAccounts,
    }
  })
}
