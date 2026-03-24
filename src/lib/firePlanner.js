export const FIRE_STORAGE_KEY = 'wealthos-state-v1'
export const FIRE_SIMULATION_COUNT = 1500
export const SAFE_WITHDRAWAL_RATE = 0.04

function randomNormal() {
  let u = 0
  let v = 0

  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()

  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export function calculatePercentile(values, percentile) {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = (sorted.length - 1) * percentile
  const lower = Math.floor(index)
  const upper = Math.ceil(index)

  if (lower === upper) return sorted[lower]

  const weight = index - lower
  return sorted[lower] * (1 - weight) + sorted[upper] * weight
}

export function createPlannerScenarios(metrics, cashFlow) {
  const monthlyPassiveIncome = Math.round(metrics.monthlyPortfolioIncome || cashFlow.income.find((row) => row.category === 'Portfolio')?.amount || 0)
  const annualContribution = Math.round((metrics.monthlyHouseholdContributions || 0) * 12)

  return [
    {
      id: 1,
      name: 'Base Case',
      startingPortfolio: Math.round(metrics.totalInvestedAssets || 0),
      annualContribution,
      monthlyPassiveIncome,
      targetFireIncome: 10000,
      expectedReturn: 7,
      volatility: 12,
      annualWithdrawalTarget: 120000,
      inflationAssumption: 2.5,
      timeHorizon: 30,
      currentAge: 36,
      retirementAge: 55,
      passiveIncomeGrowth: 3,
      contributionGrowth: 2,
      simulationCount: FIRE_SIMULATION_COUNT,
      incomeMode: 'reinvest',
    },
    {
      id: 2,
      name: 'Aggressive Contributions',
      startingPortfolio: Math.round(metrics.totalInvestedAssets || 0),
      annualContribution: Math.round(annualContribution * 1.3),
      monthlyPassiveIncome,
      targetFireIncome: 10000,
      expectedReturn: 7.5,
      volatility: 13,
      annualWithdrawalTarget: 120000,
      inflationAssumption: 2.5,
      timeHorizon: 30,
      currentAge: 36,
      retirementAge: 53,
      passiveIncomeGrowth: 3.5,
      contributionGrowth: 3,
      simulationCount: FIRE_SIMULATION_COUNT,
      incomeMode: 'reinvest',
    },
    {
      id: 3,
      name: 'Lower Spending',
      startingPortfolio: Math.round(metrics.totalInvestedAssets || 0),
      annualContribution,
      monthlyPassiveIncome,
      targetFireIncome: 8500,
      expectedReturn: 7,
      volatility: 11,
      annualWithdrawalTarget: 102000,
      inflationAssumption: 2.3,
      timeHorizon: 30,
      currentAge: 36,
      retirementAge: 54,
      passiveIncomeGrowth: 3,
      contributionGrowth: 2,
      simulationCount: FIRE_SIMULATION_COUNT,
      incomeMode: 'reinvest',
    },
    {
      id: 4,
      name: 'Early Retirement',
      startingPortfolio: Math.round(metrics.totalInvestedAssets || 0),
      annualContribution,
      monthlyPassiveIncome,
      targetFireIncome: 10000,
      expectedReturn: 6.5,
      volatility: 12.5,
      annualWithdrawalTarget: 120000,
      inflationAssumption: 2.5,
      timeHorizon: 30,
      currentAge: 36,
      retirementAge: 48,
      passiveIncomeGrowth: 3,
      contributionGrowth: 2,
      simulationCount: FIRE_SIMULATION_COUNT,
      incomeMode: 'harvest',
    },
    {
      id: 5,
      name: 'One Income Household',
      startingPortfolio: Math.round(metrics.totalInvestedAssets || 0),
      annualContribution: Math.round(annualContribution * 0.6),
      monthlyPassiveIncome,
      targetFireIncome: 9500,
      expectedReturn: 6.8,
      volatility: 11.5,
      annualWithdrawalTarget: 114000,
      inflationAssumption: 2.5,
      timeHorizon: 30,
      currentAge: 36,
      retirementAge: 57,
      passiveIncomeGrowth: 2.5,
      contributionGrowth: 1,
      simulationCount: FIRE_SIMULATION_COUNT,
      incomeMode: 'reinvest',
    },
    {
      id: 6,
      name: 'Higher Yield Strategy',
      startingPortfolio: Math.round(metrics.totalInvestedAssets || 0),
      annualContribution,
      monthlyPassiveIncome: Math.round(monthlyPassiveIncome * 1.25),
      targetFireIncome: 10000,
      expectedReturn: 6.7,
      volatility: 10.5,
      annualWithdrawalTarget: 120000,
      inflationAssumption: 2.5,
      timeHorizon: 30,
      currentAge: 36,
      retirementAge: 55,
      passiveIncomeGrowth: 4,
      contributionGrowth: 2,
      simulationCount: FIRE_SIMULATION_COUNT,
      incomeMode: 'harvest',
    },
  ]
}

export function runMonteCarloSimulation(scenario) {
  const horizon = Number(scenario.timeHorizon) || 30
  const simulationCount = Math.max(Number(scenario.simulationCount) || FIRE_SIMULATION_COUNT, 1000)
  const retirementYear = clamp((Number(scenario.retirementAge) || 55) - (Number(scenario.currentAge) || 35), 0, horizon)
  const expectedReturn = Number(scenario.expectedReturn || 0) / 100
  const volatility = Number(scenario.volatility || 0) / 100
  const inflation = Number(scenario.inflationAssumption || 0) / 100
  const passiveIncomeGrowth = Number(scenario.passiveIncomeGrowth || 0) / 100
  const contributionGrowth = Number(scenario.contributionGrowth || 0) / 100
  const annualWithdrawalTarget = Number(scenario.annualWithdrawalTarget || scenario.targetFireIncome * 12 || 0)
  const startingPassiveIncome = Number(scenario.monthlyPassiveIncome || 0) * 12
  const startingPortfolio = Number(scenario.startingPortfolio || 0)
  const startingContribution = Number(scenario.annualContribution || 0)
  const yearlyBuckets = Array.from({ length: horizon + 1 }, (_, year) => ({
    year,
    values: [],
    successCount: 0,
  }))
  const endingValues = []
  let totalSuccess = 0

  for (let run = 0; run < simulationCount; run += 1) {
    let portfolio = startingPortfolio
    let passiveIncome = startingPassiveIncome
    let annualContribution = startingContribution
    let survived = true

    yearlyBuckets[0].values.push(portfolio)
    yearlyBuckets[0].successCount += 1

    for (let year = 1; year <= horizon; year += 1) {
      const annualReturn = expectedReturn + volatility * randomNormal()
      const growthMultiplier = Math.max(0.05, 1 + annualReturn)
      const inRetirement = year > retirementYear
      const inflatedWithdrawalTarget = annualWithdrawalTarget * (1 + inflation) ** (year - 1)
      const passiveOffset = passiveIncome

      if (!inRetirement) {
        const cashAdded = scenario.incomeMode === 'reinvest' ? annualContribution + passiveOffset : annualContribution
        portfolio = portfolio * growthMultiplier + cashAdded
      } else {
        const requiredWithdrawal = Math.max(inflatedWithdrawalTarget - passiveOffset, 0)
        portfolio = portfolio * growthMultiplier - requiredWithdrawal
      }

      passiveIncome *= 1 + passiveIncomeGrowth
      annualContribution *= 1 + contributionGrowth

      if (portfolio <= 0) {
        portfolio = 0
        survived = false
      }

      yearlyBuckets[year].values.push(portfolio)
      if (survived) {
        yearlyBuckets[year].successCount += 1
      }
    }

    endingValues.push(portfolio)
    if (survived) totalSuccess += 1
  }

  const trajectory = yearlyBuckets.map((bucket) => ({
    year: bucket.year,
    median: calculatePercentile(bucket.values, 0.5),
    pessimistic: calculatePercentile(bucket.values, 0.1),
    optimistic: calculatePercentile(bucket.values, 0.9),
    successProbability: (bucket.successCount / simulationCount) * 100,
  }))

  return {
    simulationCount,
    retirementYear,
    successProbability: (totalSuccess / simulationCount) * 100,
    medianEndingValue: calculatePercentile(endingValues, 0.5),
    pessimisticEndingValue: calculatePercentile(endingValues, 0.1),
    optimisticEndingValue: calculatePercentile(endingValues, 0.9),
    trajectory,
  }
}

export function calculateFireMetrics({ scenario, metrics }) {
  const annualPassiveIncome = Number(scenario.monthlyPassiveIncome || 0) * 12
  const annualTargetIncome = Number(scenario.targetFireIncome || 0) * 12
  const incomeGap = Math.max(annualTargetIncome - annualPassiveIncome, 0)
  const fireTarget = incomeGap / SAFE_WITHDRAWAL_RATE
  const yearsToRetirement = Math.max((Number(scenario.retirementAge) || 55) - (Number(scenario.currentAge) || 35), 0)
  const realReturn = Math.max((Number(scenario.expectedReturn || 0) - Number(scenario.inflationAssumption || 0)) / 100, 0.01)
  const coastFireNumber = fireTarget / (1 + realReturn) ** Math.max(yearsToRetirement, 1)
  const currentInvestedAssets = Number(scenario.startingPortfolio || metrics.totalInvestedAssets || 0)
  const safeWithdrawalEstimate = currentInvestedAssets * SAFE_WITHDRAWAL_RATE
  const fullFireProgress = fireTarget ? (currentInvestedAssets / fireTarget) * 100 : 0
  const coastFireProgress = coastFireNumber ? (currentInvestedAssets / coastFireNumber) * 100 : 0

  let simulatedYearsToFi = null
  let portfolio = currentInvestedAssets
  let contribution = Number(scenario.annualContribution || 0)
  let passiveIncome = annualPassiveIncome

  for (let year = 0; year <= 50; year += 1) {
    const currentIncomeGap = Math.max(annualTargetIncome * (1 + Number(scenario.inflationAssumption || 0) / 100) ** year - passiveIncome, 0)
    if (portfolio * SAFE_WITHDRAWAL_RATE >= currentIncomeGap) {
      simulatedYearsToFi = year
      break
    }

    const annualAdd = scenario.incomeMode === 'reinvest' ? contribution + passiveIncome : contribution
    portfolio = portfolio * (1 + Number(scenario.expectedReturn || 0) / 100) + annualAdd
    contribution *= 1 + Number(scenario.contributionGrowth || 0) / 100
    passiveIncome *= 1 + Number(scenario.passiveIncomeGrowth || 0) / 100
  }

  return {
    currentInvestedAssets,
    annualPassiveIncome,
    annualTargetIncome,
    incomeGap,
    fireTarget,
    coastFireNumber,
    coastFireProgress,
    fullFireProgress,
    yearsToFi: simulatedYearsToFi,
    safeWithdrawalEstimate,
  }
}

export function calculateRetirementDistribution(scenario, simulation) {
  const annualPassiveIncome = Number(scenario.monthlyPassiveIncome || 0) * 12 * (1 + Number(scenario.passiveIncomeGrowth || 0) / 100) ** simulation.retirementYear
  const annualWithdrawalNeed = Math.max(Number(scenario.annualWithdrawalTarget || 0) - annualPassiveIncome, 0)
  const coverageRatio = Number(scenario.annualWithdrawalTarget || 0)
    ? (annualPassiveIncome / Number(scenario.annualWithdrawalTarget || 0)) * 100
    : 0
  const medianPortfolioAtRetirement = simulation.trajectory[simulation.retirementYear]?.median ?? Number(scenario.startingPortfolio || 0)
  const drawBurden = medianPortfolioAtRetirement ? (annualWithdrawalNeed / medianPortfolioAtRetirement) * 100 : 0

  return {
    expectedMonthlyPassiveIncome: annualPassiveIncome / 12,
    annualWithdrawalNeed,
    coverageRatio,
    shortfallOrSurplus: annualPassiveIncome - Number(scenario.annualWithdrawalTarget || 0),
    drawBurden,
  }
}
