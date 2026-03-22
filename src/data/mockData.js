export const summaryCards = [
  {
    title: 'Total Assets',
    value: '$1.84M',
    change: '+6.2% MoM',
    detail: 'Across brokerage, retirement, and cash accounts.',
  },
  {
    title: 'Portfolio Income',
    value: '$7,450',
    change: '+$620 this month',
    detail: 'Dividend, interest, and real estate distributions.',
  },
  {
    title: 'Contribution Tracker',
    value: '78%',
    change: '$18,720 / $24,000 target',
    detail: 'Annual tax-advantaged contribution progress.',
  },
]

export const accountsSeed = [
  {
    id: 1,
    name: 'Brokerage Account',
    institution: 'Fidelity',
    type: 'Taxable',
    holdings: [
      { id: 101, symbol: 'VTI', name: 'Vanguard Total Stock Market', shares: 128, value: 35120 },
      { id: 102, symbol: 'VXUS', name: 'Vanguard Total International', shares: 64, value: 4128 },
    ],
  },
  {
    id: 2,
    name: 'High Yield Savings',
    institution: 'Ally Bank',
    type: 'Cash',
    holdings: [
      { id: 201, symbol: 'USD', name: 'Cash Reserve', shares: 1, value: 42500 },
    ],
  },
]

export const cashFlowItems = [
  { label: 'Salary', amount: '$12,500', type: 'Inflow' },
  { label: 'Dividends', amount: '$1,280', type: 'Inflow' },
  { label: 'Housing', amount: '$3,600', type: 'Outflow' },
  { label: 'Investments', amount: '$4,200', type: 'Outflow' },
]

export const plannerMilestones = [
  { title: 'Emergency Fund', target: '100%', note: 'Fully funded with 12 months of expenses.' },
  { title: 'Retirement Goal', target: '64%', note: 'On pace for Coast FIRE by age 52.' },
  { title: 'Real Estate Fund', target: '41%', note: 'Down payment fund for next acquisition.' },
]
