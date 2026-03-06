export const TASK_STATUSES = [
  { v: 'pending',            l: 'Pending',             c: '#8892b0', bg: '#8892b015' },
  { v: 'data_not_received',  l: 'Data Not Received',   c: '#f59e0b', bg: '#f59e0b15' },
  { v: 'in_progress',        l: 'In Progress',         c: '#5b8dee', bg: '#5b8dee15' },
  { v: 'filed',              l: 'Filed ✓',             c: '#22c55e', bg: '#22c55e15' },
  { v: 'nil_filed',          l: 'Nil Filed',           c: '#34d399', bg: '#34d39915' },
  { v: 'payment_pending',    l: 'Payment Pending',     c: '#fb923c', bg: '#fb923c15' },
  { v: 'payment_done',       l: 'Payment Done ✓',      c: '#4ade80', bg: '#4ade8015' },
  { v: 'client_on_hold',     l: 'Client on Hold',      c: '#a78bfa', bg: '#a78bfa15' },
  { v: 'dropped',            l: 'Dropped',             c: '#4a5578', bg: '#4a557815' },
  { v: 'amendment_required', l: 'Amendment Required',  c: '#f43f5e', bg: '#f43f5e15' },
  { v: 'completed',          l: 'Completed ✓',         c: '#22c55e', bg: '#22c55e15' },
]

export const STATUS_MAP = Object.fromEntries(TASK_STATUSES.map(s => [s.v, s]))

export const DONE_STATUSES = ['filed', 'nil_filed', 'completed', 'payment_done', 'dropped']
export const HOLD_STATUSES = ['client_on_hold']

export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export const ROLES = {
  partner:      'Partner',
  hod:          'Head of Dept',
  team_leader:  'Team Leader',
  executive:    'Executive',
  intern:       'Intern',
}

export const ROLE_ORDER = { partner:0, hod:1, team_leader:2, executive:3, intern:4 }

export const ROLE_CLR = {
  partner:     '#f59e0b',
  hod:         '#7b6cf6',
  team_leader: '#34d399',
  executive:   '#5b8dee',
  intern:      '#8892b0',
}

export const CONSTITUTIONS = [
  'Private Limited',
  'LLP',
  'Public Limited',
  'Partnership Firm',
  'Proprietorship',
  'Trust / Section 8',
  'HUF',
]

export const KANBAN_COLS = [
  { key:'todo',    label:'To Do',           statuses:['pending','data_not_received'],                     color:'#8892b0' },
  { key:'wip',     label:'In Progress',     statuses:['in_progress'],                                     color:'#5b8dee' },
  { key:'filing',  label:'Filing / Payment',statuses:['filed','nil_filed','payment_pending','payment_done'],color:'#f59e0b' },
  { key:'done',    label:'Done',            statuses:['completed','dropped'],                              color:'#22c55e' },
  { key:'hold',    label:'On Hold',         statuses:['client_on_hold','amendment_required'],              color:'#a78bfa' },
]
