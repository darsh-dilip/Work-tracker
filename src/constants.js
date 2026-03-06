// ── ROLES ────────────────────────────────────────────────────
export const ROLES = {
  partner:     'Partner',
  hod:         'Head of Dept',
  team_leader: 'Team Leader',
  executive:   'Executive',
  intern:      'Intern',
}
export const ROLE_ORDER = { partner:0, hod:1, team_leader:2, executive:3, intern:4 }
export const ROLE_CLR   = {
  partner:'#f59e0b', hod:'#7b6cf6', team_leader:'#34d399',
  executive:'#5b8dee', intern:'#8892b0',
}

// ── CLIENT-LEVEL STATUS ──────────────────────────────────────
export const CLIENT_STATUS = {
  active:       { l:'Active',       badge:null },
  on_hold:      { l:'On Hold',      badge:'ON HOLD',      badgeColor:'#f59e0b', badgeBg:'#f59e0b22', badgeBorder:'#f59e0b55' },
  discontinued: { l:'Discontinued', badge:'STOP SERVICE', badgeColor:'#f43f5e', badgeBg:'#f43f5e22', badgeBorder:'#f43f5e55' },
}

// ── STATUS BUILDER ───────────────────────────────────────────
const s = (v, l, c, extra) => ({ v, l, c, bg:`${c}18`, ...extra })

// ── GSTR-1 ───────────────────────────────────────────────────
const GSTR1 = [
  s('pending',          'Pending',                '#8892b0'),
  s('filed',            'Filed',                  '#22c55e', { done:true, requiresArn:true }),
  s('nil_filed',        'Nil Filed',              '#34d399', { done:true, requiresArn:true }),
  s('data_pending',     'Data Pending',           '#f59e0b'),
  s('not_responding',   'Not Responding',         '#f43f5e'),
  s('data_received',    'Data Received',          '#38bdf8'),
  s('unregistered',     'Unregistered',           '#818cf8', { done:true }),
  s('not_in_compliance','Not in Compliance',      '#f97316'),
  s('delayed_filing',   'Delayed Filing',         '#fb923c', { done:true, requiresArn:true }),
  s('suspended',        'Suspended',              '#a78bfa'),
  s('cancelled',        'Cancelled / Surrendered','#4a5578', { done:true }),
  s('on_hold',          'On Hold',                '#f59e0b'),
  s('iff_filed',        'IFF Filed',              '#4ade80', { done:true, requiresArn:true }),
  s('no_iff',           'No IFF',                 '#8892b0', { done:true }),
]

// ── GSTR-3B ──────────────────────────────────────────────────
const GSTR3B = [
  s('pending',          'Pending',                '#8892b0'),
  s('filed',            'Filed',                  '#22c55e', { done:true, requiresArn:true }),
  s('nil_filed',        'Nil Filed',              '#34d399', { done:true, requiresArn:true }),
  s('data_pending',     'Data Pending',           '#f59e0b'),
  s('not_responding',   'Not Responding',         '#f43f5e'),
  s('data_received',    'Data Received',          '#38bdf8'),
  s('unregistered',     'Unregistered',           '#818cf8', { done:true }),
  s('not_in_compliance','Not in Compliance',      '#f97316'),
  s('delayed_filing',   'Delayed Filing',         '#fb923c', { done:true, requiresArn:true }),
  s('suspended',        'Suspended',              '#a78bfa'),
  s('cancelled',        'Cancelled / Surrendered','#4a5578', { done:true }),
  s('on_hold',          'On Hold',                '#f59e0b'),
  s('iff_filed',        'IFF Filed',              '#4ade80', { done:true, requiresArn:true }),
  s('no_iff',           'No IFF',                 '#8892b0', { done:true }),
  s('payment_pending',  'Payment Pending',        '#fb923c'),
]

// ── GSTR-2B Reconciliation ───────────────────────────────────
const GSTR2B = [
  s('pending',              'Pending',                    '#8892b0'),
  s('2b_not_available',     '2B Not Yet Available',       '#f59e0b'),
  s('in_progress',          'Reconciliation in Progress', '#5b8dee'),
  s('differences_found',    'Differences Found',          '#f43f5e'),
  s('differences_resolved', 'Differences Resolved',      '#fb923c'),
  s('completed',            'Completed',                  '#22c55e', { done:true }),
  s('on_hold',              'On Hold',                    '#a78bfa'),
  s('data_pending',         'Data Pending',               '#f59e0b'),
  s('not_responding',       'Not Responding',             '#f43f5e'),
]

// ── Accounts & ITR ───────────────────────────────────────────
const ACCTS_ITR = [
  s('pending',          'Pending',              '#8892b0'),
  s('data_pending',     'Data Pending',         '#f59e0b'),
  s('data_received',    'Data Received',        '#38bdf8'),
  s('accounting_done',  'Accounting Done',      '#818cf8'),
  s('checkers_query',   "Checker's Query",      '#f59e0b'),
  s('audited',          'Audited',              '#a78bfa'),
  s('fs_sent',          'FS Sent to Client',    '#5b8dee'),
  s('confirmed',        'Confirmed by Client',  '#4ade80'),
  s('genius_prepared',  'Genius Prepared',      '#38bdf8'),
  s('payment_pending',  'Payment Pending',      '#fb923c'),
  s('payment_made',     'Payment Made',         '#4ade80'),
  s('itr_filed',        'ITR Filed',            '#22c55e', { done:true, requiresArn:true }),
  s('revision_required','Revision Required',    '#f43f5e'),
  s('not_to_be_filed',  'Not to be Filed',      '#4a5578', { done:true }),
  s('customer_refused', 'Customer Refused',     '#f43f5e'),
  s('not_responding',   'Not Responding',       '#f43f5e'),
  s('on_hold',          'On Hold',              '#f59e0b'),
]

// ── PTEC Filing ──────────────────────────────────────────────
const PTEC = [
  s('pending',    'Pending',        '#8892b0'),
  s('paid',       'Paid',           '#22c55e', { done:true, requiresRef:true, refLabel:'Challan / Ref No.' }),
  s('nil_filed',  'Nil Filed',      '#34d399', { done:true }),
  s('no_employee','No Employees',   '#4a5578', { done:true }),
  s('no_response','No Response',    '#f43f5e'),
  s('on_hold',    'On Hold',        '#f59e0b'),
  s('state_issue','State Issue',    '#f97316'),
]

// ── PT Monthly (PTRC / Maharashtra) ─────────────────────────
const PT_MONTHLY = [
  s('pending',    'Pending',        '#8892b0'),
  s('paid',       'Paid',           '#22c55e', { done:true, requiresRef:true, refLabel:'Challan / Ref No.' }),
  s('no_employee','No Employees',   '#4a5578', { done:true }),
  s('on_hold',    'On Hold',        '#f59e0b'),
  s('state_issue','State Issue',    '#f97316'),
  s('no_response','No Response',    '#f43f5e'),
]

// ── Advance Tax ──────────────────────────────────────────────
const ADV_TAX = [
  s('pending',    'Pending',        '#8892b0'),
  s('denied',     'Denied',         '#f43f5e'),
  s('no_profits', 'No Profits',     '#4a5578', { done:true }),
  s('paid',       'Paid',           '#22c55e', { done:true, requiresRef:true, refLabel:'BSR Code & Challan No.' }),
  s('no_response','No Response',    '#f43f5e'),
  s('on_hold',    'On Hold',        '#f59e0b'),
]

// ── TDS Payment ──────────────────────────────────────────────
const TDS_PMT = [
  s('pending',    'Pending',        '#8892b0'),
  s('paid',       'Paid',           '#22c55e', { done:true, requiresRef:true, refLabel:'BSR Code & Challan No.' }),
  s('na',         'N/A (No TDS)',   '#4a5578', { done:true }),
  s('on_hold',    'On Hold',        '#f59e0b'),
  s('late',       'Paid Late',      '#f97316', { done:true }),
]

// ── TDS Filing / Return ──────────────────────────────────────
const TDS_RETURN = [
  s('pending',    'Pending',        '#8892b0'),
  s('nil',        'Nil',            '#34d399', { done:true, requiresArn:true }),
  s('filed',      'Filed',          '#22c55e', { done:true, requiresArn:true }),
  s('on_hold',    'Hold',           '#f59e0b'),
]

// ── SERVICE → STATUS MAP ─────────────────────────────────────
export const SERVICE_STATUSES = {
  'GSTR-1':                   GSTR1,
  'GSTR-1 (Quarterly)':       GSTR1,
  'GSTR-2B Reconciliation':   GSTR2B,
  'GSTR-3B':                  GSTR3B,
  'GSTR-3B (Quarterly)':      GSTR3B,
  'GSTR-9 Annual Return':     ACCTS_ITR,
  'Income Tax Filing':        ACCTS_ITR,
  'Accounting':               ACCTS_ITR,
  'CA Certificate':           ACCTS_ITR,
  'PT Payment (Maharashtra)': PT_MONTHLY,
  'PT Return (Maharashtra)':  PTEC,
  'PT Payment (Karnataka)':   PTEC,
  'PT Return (Karnataka)':    PTEC,
  'Advance Tax':              ADV_TAX,
  'TDS Payment':              TDS_PMT,
  'TDS Return':               TDS_RETURN,
}

const FALLBACK_STATUSES = [
  s('pending',    'Pending',     '#8892b0'),
  s('in_progress','In Progress', '#5b8dee'),
  s('completed',  'Completed',   '#22c55e', { done:true }),
  s('on_hold',    'On Hold',     '#f59e0b'),
]

export const getServiceStatuses = service =>
  SERVICE_STATUSES[service] || FALLBACK_STATUSES

export const getStatusObj = (service, statusV) => {
  const list = getServiceStatuses(service)
  return list.find(x => x.v === statusV) || { v:statusV, l:statusV, c:'#8892b0', bg:'#8892b015' }
}

// ── COMMENT STATUS LIST (from Excel col 10) ──────────────────
export const COMMENT_STATUSES = [
  'Bank Statement Pending','Client Unresponsive','Tally, not Zoho','Closure',
  'Payment Due','No Sales','NIL ITR to be filed','Change Email ID',
  'DND / Discontinued','Zoho Deleted','Only Bank Received','Part Data Received',
  'Genius Prepared','Genius Queries','ITR Email Sent','Half Bank St. Received',
  'Bank A/c Not Opened','Genius Ongoing','Genius Checked','Login to be created',
  'DSC Expired','NIL - Revision','Not Responding - Penalty',
]

// ── DONE STATUS LIST (for bucket logic) ─────────────────────
export const DONE_STATUSES = [
  'filed','nil_filed','completed','payment_done','paid','itr_filed',
  'accounting_done','iff_filed','no_iff','unregistered','cancelled',
  'not_to_be_filed','no_profits','na','no_employee','nil','delayed_filing',
  'differences_resolved','confirmed','customer_refused','late','paid_apr',
  'paid_may','paid_jun','paid_jul','paid_aug','paid_sep','paid_oct',
  'paid_nov','paid_dec','paid_jan','paid_feb','paid_mar',
]
export const HOLD_STATUSES = ['on_hold','client_on_hold']

// ── MISC ─────────────────────────────────────────────────────
export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
export const CONSTITUTIONS = [
  'Private Limited','LLP','Public Limited','Partnership Firm',
  'Proprietorship','Trust / Section 8','HUF',
]

export const KANBAN_COLS = [
  { key:'todo',   label:'To Do',               statuses:['pending','data_pending'],                                    color:'#8892b0' },
  { key:'wip',    label:'In Progress',         statuses:['in_progress','data_received','accounting_done','checkers_query','genius_prepared','fs_sent','2b_not_available'], color:'#5b8dee' },
  { key:'review', label:'Approval / Payment',  statuses:['payment_pending','confirmed','audited','revision_required','differences_found'], color:'#f59e0b' },
  { key:'done',   label:'Done',                statuses:DONE_STATUSES,                                                 color:'#22c55e' },
  { key:'issue',  label:'Issues / Hold',       statuses:['on_hold','not_responding','not_in_compliance','suspended','state_issue','no_response','denied'], color:'#f43f5e' },
]

export const LOG_ACTIONS = {
  CLIENT_ONBOARDED:      'client_onboarded',
  CLIENT_STATUS_CHANGED: 'client_status_changed',
  CLIENT_REASSIGNED:     'client_reassigned',
  TASK_STATUS_CHANGED:   'task_status_changed',
  TASK_REASSIGNED:       'task_reassigned',
  COMMENT_ADDED:         'comment_added',
  USER_CREATED:          'user_created',
}
