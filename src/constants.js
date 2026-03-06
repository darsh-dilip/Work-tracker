// ─────────────────────────────────────────────────────────────
// ROLES
// ─────────────────────────────────────────────────────────────
export const ROLES = {
  partner:     'Partner',
  hod:         'Head of Dept',
  team_leader: 'Team Leader',
  executive:   'Executive',
  intern:      'Intern',
}
export const ROLE_ORDER = { partner:0, hod:1, team_leader:2, executive:3, intern:4 }
export const ROLE_CLR   = {
  partner:     '#f59e0b',
  hod:         '#7b6cf6',
  team_leader: '#34d399',
  executive:   '#5b8dee',
  intern:      '#8892b0',
}

// ─────────────────────────────────────────────────────────────
// CLIENT-LEVEL STATUS (overlays on all tasks of that client)
// ─────────────────────────────────────────────────────────────
export const CLIENT_STATUS = {
  active:       { l:'Active',       badge:null },
  on_hold:      { l:'On Hold',      badge:'ON HOLD',      badgeColor:'#f59e0b', badgeBg:'#f59e0b20', badgeBorder:'#f59e0b50' },
  discontinued: { l:'Discontinued', badge:'STOP SERVICE', badgeColor:'#f43f5e', badgeBg:'#f43f5e20', badgeBorder:'#f43f5e50' },
}

// ─────────────────────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────────────────────
const mkS = (v, l, c, extra = {}) => ({ v, l, c, bg: `${c}18`, ...extra })

// ─────────────────────────────────────────────────────────────
// GSTR-1 STATUSES  (col 1 from Excel)
// ─────────────────────────────────────────────────────────────
const GSTR1_STATUSES = [
  mkS('pending',          'Pending',             '#8892b0'),
  mkS('filed',            'Filed',               '#22c55e', { done:true, requiresArn:true }),
  mkS('nil_filed',        'Nil Filed',           '#34d399', { done:true, requiresArn:true }),
  mkS('data_pending',     'Data Pending',        '#f59e0b'),
  mkS('not_responding',   'Not Responding',      '#f43f5e'),
  mkS('data_received',    'Data Received',       '#38bdf8'),
  mkS('unregistered',     'Unregistered',        '#818cf8', { done:true }),
  mkS('not_in_compliance','Not in Compliance',   '#f97316'),
  mkS('delayed_filing',   'Delayed Filing',      '#fb923c', { done:true, requiresArn:true }),
  mkS('suspended',        'Suspended',           '#a78bfa'),
  mkS('cancelled',        'Cancelled / Surrendered', '#4a5578', { done:true }),
  mkS('on_hold',          'On Hold',             '#f59e0b'),
  mkS('iff_filed',        'IFF Filed',           '#4ade80', { done:true, requiresArn:true }),
  mkS('no_iff',           'No IFF',              '#8892b0', { done:true }),
]

// ─────────────────────────────────────────────────────────────
// GSTR-3B STATUSES  (col 2 from Excel)
// ─────────────────────────────────────────────────────────────
const GSTR3B_STATUSES = [
  mkS('pending',          'Pending',             '#8892b0'),
  mkS('filed',            'Filed',               '#22c55e', { done:true, requiresArn:true }),
  mkS('nil_filed',        'Nil Filed',           '#34d399', { done:true, requiresArn:true }),
  mkS('data_pending',     'Data Pending',        '#f59e0b'),
  mkS('not_responding',   'Not Responding',      '#f43f5e'),
  mkS('data_received',    'Data Received',       '#38bdf8'),
  mkS('unregistered',     'Unregistered',        '#818cf8', { done:true }),
  mkS('not_in_compliance','Not in Compliance',   '#f97316'),
  mkS('delayed_filing',   'Delayed Filing',      '#fb923c', { done:true, requiresArn:true }),
  mkS('suspended',        'Suspended',           '#a78bfa'),
  mkS('cancelled',        'Cancelled / Surrendered', '#4a5578', { done:true }),
  mkS('on_hold',          'On Hold',             '#f59e0b'),
  mkS('iff_filed',        'IFF Filed',           '#4ade80', { done:true, requiresArn:true }),
  mkS('no_iff',           'No IFF',              '#8892b0', { done:true }),
  mkS('payment_pending',  'Payment Pending',     '#fb923c'),
]

// ─────────────────────────────────────────────────────────────
// GSTR-2B RECONCILIATION
// ─────────────────────────────────────────────────────────────
const GSTR2B_STATUSES = [
  mkS('pending',              'Pending',                    '#8892b0'),
  mkS('2b_not_available',     '2B Not Yet Available',       '#f59e0b'),
  mkS('in_progress',          'Reconciliation in Progress', '#5b8dee'),
  mkS('differences_found',    'Differences Found',          '#f43f5e'),
  mkS('differences_resolved', 'Differences Resolved',       '#fb923c'),
  mkS('completed',            'Completed',                  '#22c55e', { done:true }),
  mkS('on_hold',              'On Hold',                    '#a78bfa'),
  mkS('data_pending',         'Data Pending',               '#f59e0b'),
  mkS('not_responding',       'Not Responding',             '#f43f5e'),
]

// ─────────────────────────────────────────────────────────────
// ACCOUNTS & ITR STATUS  (col 3 from Excel)
// ─────────────────────────────────────────────────────────────
const ACCOUNTS_ITR_STATUSES = [
  mkS('pending',          'Pending',              '#8892b0'),
  mkS('data_pending',     'Data Pending',         '#f59e0b'),
  mkS('data_received',    'Data Received',        '#38bdf8'),
  mkS('accounting_done',  'Accounting Done',      '#818cf8'),
  mkS('checkers_query',   'Checker\'s Query',     '#f59e0b'),
  mkS('audited',          'Audited',              '#a78bfa'),
  mkS('fs_sent',          'FS Sent to Client',    '#5b8dee'),
  mkS('confirmed',        'Confirmed by Client',  '#4ade80'),
  mkS('genius_prepared',  'Genius Prepared',      '#38bdf8'),
  mkS('payment_pending',  'Payment Pending',      '#fb923c'),
  mkS('payment_made',     'Payment Made',         '#4ade80'),
  mkS('itr_filed',        'ITR Filed',            '#22c55e', { done:true, requiresArn:true }),
  mkS('revision_required','Revision Required',    '#f43f5e'),
  mkS('not_to_be_filed',  'Not to be Filed',      '#4a5578', { done:true }),
  mkS('customer_refused', 'Customer Refused',     '#f43f5e'),
  mkS('not_responding',   'Not Responding',       '#f43f5e'),
  mkS('on_hold',          'On Hold',              '#f59e0b'),
]

// ─────────────────────────────────────────────────────────────
// PTEC FILING  (col 4 — Professional Tax Enrollment Certificate)
// ─────────────────────────────────────────────────────────────
const PTEC_STATUSES = [
  mkS('pending',    'Pending',       '#8892b0'),
  mkS('paid',       'Paid',          '#22c55e', { done:true, requiresRef:true, refLabel:'Challan / Reference No.' }),
  mkS('nil_filed',  'Nil Filed',     '#34d399', { done:true }),
  mkS('no_employee','No Employees',  '#4a5578', { done:true }),
  mkS('no_response','No Response',   '#f43f5e'),
  mkS('on_hold',    'On Hold',       '#f59e0b'),
  mkS('state_issue','State Issue',   '#f97316'),
]

// ─────────────────────────────────────────────────────────────
// PTRC STATUS  (col 5 — Professional Tax Registration Certificate, monthly)
// ─────────────────────────────────────────────────────────────
const PTRC_STATUSES = [
  mkS('pending',    'Pending',       '#8892b0'),
  mkS('paid_apr',   'Apr — Paid',    '#22c55e', { done:true }),
  mkS('paid_may',   'May — Paid',    '#22c55e', { done:true }),
  mkS('paid_jun',   'Jun — Paid',    '#22c55e', { done:true }),
  mkS('paid_jul',   'Jul — Paid',    '#22c55e', { done:true }),
  mkS('paid_aug',   'Aug — Paid',    '#22c55e', { done:true }),
  mkS('paid_sep',   'Sep — Paid',    '#22c55e', { done:true }),
  mkS('paid_oct',   'Oct — Paid',    '#22c55e', { done:true }),
  mkS('paid_nov',   'Nov — Paid',    '#22c55e', { done:true }),
  mkS('paid_dec',   'Dec — Paid',    '#22c55e', { done:true }),
  mkS('paid_jan',   'Jan — Paid',    '#22c55e', { done:true }),
  mkS('paid_feb',   'Feb — Paid',    '#22c55e', { done:true }),
  mkS('paid_mar',   'Mar — Paid',    '#22c55e', { done:true }),
  mkS('na',         'N/A',           '#4a5578', { done:true }),
  mkS('no_employee','No Employees',  '#4a5578', { done:true }),
  mkS('on_hold',    'On Hold',       '#f59e0b'),
  mkS('state_issue','State Issue',   '#f97316'),
]

// For monthly PT tasks, use a simpler status
const PT_MONTHLY_STATUSES = [
  mkS('pending',    'Pending',       '#8892b0'),
  mkS('paid',       'Paid',          '#22c55e', { done:true, requiresRef:true, refLabel:'Challan / Reference No.' }),
  mkS('no_employee','No Employees',  '#4a5578', { done:true }),
  mkS('on_hold',    'On Hold',       '#f59e0b'),
  mkS('state_issue','State Issue',   '#f97316'),
  mkS('no_response','No Response',   '#f43f5e'),
]

// ─────────────────────────────────────────────────────────────
// ADVANCE TAX STATUS  (col 6 from Excel)
// ─────────────────────────────────────────────────────────────
const ADVANCE_TAX_STATUSES = [
  mkS('pending',    'Pending',       '#8892b0'),
  mkS('denied',     'Denied',        '#f43f5e'),
  mkS('no_profits', 'No Profits',    '#4a5578', { done:true }),
  mkS('paid',       'Paid',          '#22c55e', { done:true, requiresRef:true, refLabel:'BSR Code & Challan No.' }),
  mkS('no_response','No Response',   '#f43f5e'),
  mkS('on_hold',    'On Hold',       '#f59e0b'),
]

// ─────────────────────────────────────────────────────────────
// TDS PAYMENT  (col 8 from Excel — months indicate which month paid)
// ─────────────────────────────────────────────────────────────
const TDS_PAYMENT_STATUSES = [
  mkS('pending',    'Pending',       '#8892b0'),
  mkS('paid',       'Paid',          '#22c55e', { done:true, requiresRef:true, refLabel:'BSR Code & Challan No.' }),
  mkS('na',         'N/A (No TDS)',  '#4a5578', { done:true }),
  mkS('on_hold',    'On Hold',       '#f59e0b'),
  mkS('late',       'Paid Late',     '#f97316', { done:true }),
]

// ─────────────────────────────────────────────────────────────
// TDS FILING / RETURN  (col 9 from Excel)
// ─────────────────────────────────────────────────────────────
const TDS_RETURN_STATUSES = [
  mkS('pending',    'Pending',       '#8892b0'),
  mkS('nil',        'Nil',           '#34d399', { done:true, requiresArn:true }),
  mkS('filed',      'Filed',         '#22c55e', { done:true, requiresArn:true }),
  mkS('on_hold',    'Hold',          '#f59e0b'),
]

// ─────────────────────────────────────────────────────────────
// COMMENT STATUS  (col 10 from Excel)
// ─────────────────────────────────────────────────────────────
export const COMMENT_STATUSES = [
  'Bank Statement Pending',
  'Client Unresponsive',
  'Tally, not Zoho',
  'Closure',
  'Payment Due',
  'No Sales',
  'NIL ITR to be filed',
  'Change Email ID',
  'DND / Discontinued',
  'Zoho Deleted',
  'Only Bank Received',
  'Part Data Received',
  'Genius Prepared',
  'Genius Queries',
  'ITR Email Sent',
  'Half Bank St. Received',
  'Bank A/c Not Opened',
  'Genius Ongoing',
  'Genius Checked',
  'Login to be created',
  'DSC Expired',
  'NIL - Revision',
  'Not Responding - Penalty',
]

// ─────────────────────────────────────────────────────────────
// SERVICE → STATUS MAP
// ─────────────────────────────────────────────────────────────
export const SERVICE_STATUSES = {
  'GSTR-1':                   GSTR1_STATUSES,
  'GSTR-1 (Quarterly)':       GSTR1_STATUSES,
  'GSTR-2B Reconciliation':   GSTR2B_STATUSES,
  'GSTR-3B':                  GSTR3B_STATUSES,
  'GSTR-3B (Quarterly)':      GSTR3B_STATUSES,
  'GSTR-9 Annual Return':     ACCOUNTS_ITR_STATUSES,
  'Income Tax Filing':        ACCOUNTS_ITR_STATUSES,
  'Accounting':               ACCOUNTS_ITR_STATUSES,
  'CA Certificate':           ACCOUNTS_ITR_STATUSES,
  'PT Payment (Maharashtra)': PT_MONTHLY_STATUSES,
  'PT Return (Maharashtra)':  PTEC_STATUSES,
  'PT Payment (Karnataka)':   PTEC_STATUSES,
  'PT Return (Karnataka)':    PTEC_STATUSES,
  'Advance Tax':              ADVANCE_TAX_STATUSES,
  'TDS Payment':              TDS_PAYMENT_STATUSES,
  'TDS Return':               TDS_RETURN_STATUSES,
}

export const getServiceStatuses = service =>
  SERVICE_STATUSES[service] || [
    mkS('pending',    'Pending',     '#8892b0'),
    mkS('in_progress','In Progress', '#5b8dee'),
    mkS('completed',  'Completed',   '#22c55e', { done:true }),
    mkS('on_hold',    'On Hold',     '#f59e0b'),
  ]

// ─────────────────────────────────────────────────────────────
// STATUS HELPERS
// ─────────────────────────────────────────────────────────────
export const getStatusObj = (service, statusV) => {
  const list = getServiceStatuses(service)
  return list.find(s => s.v === statusV) || { v: statusV, l: statusV, c: '#8892b0', bg: '#8892b015' }
}

export const isDoneStatus    = (service, statusV) => getStatusObj(service, statusV).done    || false
export const isHoldStatus    = (service, statusV) => statusV === 'on_hold'
export const isDroppedStatus = (service, statusV) => statusV === 'dropped'

// Legacy compat (used in task bucket logic)
export const DONE_STATUSES = ['filed','nil_filed','completed','payment_done','paid',
  'itr_filed','accounting_done','iff_filed','no_iff','unregistered','cancelled',
  'not_to_be_filed','no_profits','na','no_employee','nil','delayed_filing','paid_apr',
  'paid_may','paid_jun','paid_jul','paid_aug','paid_sep','paid_oct','paid_nov',
  'paid_dec','paid_jan','paid_feb','paid_mar','refund_expected','differences_resolved',
  'confirmed','customer_refused','late','issued']
export const HOLD_STATUSES  = ['on_hold','client_on_hold']

// ─────────────────────────────────────────────────────────────
// MISC
// ─────────────────────────────────────────────────────────────
export const MONTHS       = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
export const CONSTITUTIONS = [
  'Private Limited','LLP','Public Limited',
  'Partnership Firm','Proprietorship','Trust / Section 8','HUF',
]

export const KANBAN_COLS = [
  { key:'todo',   label:'To Do',          statuses:['pending','data_pending','2b_not_available','computation_pending'], color:'#8892b0' },
  { key:'wip',    label:'In Progress',    statuses:['in_progress','data_received','accounting_done','checkers_query','genius_prepared','fs_sent','challan_generated','client_informed','differences_found','differences_resolved'], color:'#5b8dee' },
  { key:'review', label:'Approval / Payment', statuses:['payment_pending','confirmed','audited','revision_required','client_approval'], color:'#f59e0b' },
  { key:'done',   label:'Done ✓',         statuses:DONE_STATUSES, color:'#22c55e' },
  { key:'issue',  label:'Issues / Hold',  statuses:['on_hold','not_responding','not_in_compliance','suspended','state_issue','no_response','denied','defaults_pending'], color:'#f43f5e' },
]

// ─────────────────────────────────────────────────────────────
// AUDIT LOG ACTION TYPES
// ─────────────────────────────────────────────────────────────
export const LOG_ACTIONS = {
  CLIENT_ONBOARDED:      'client_onboarded',
  CLIENT_STATUS_CHANGED: 'client_status_changed',
  CLIENT_REASSIGNED:     'client_reassigned',
  TASK_STATUS_CHANGED:   'task_status_changed',
  TASK_REASSIGNED:       'task_reassigned',
  ARN_UPDATED:           'arn_updated',
  REF_UPDATED:           'ref_updated',
  COMMENT_ADDED:         'comment_added',
  USER_CREATED:          'user_created',
  TASKS_REGENERATED:     'tasks_regenerated',
}
