import { MONTHS } from '../constants.js'

const mkDate = (y, m, d) => {
  const dt = new Date(y, m, Math.min(d, new Date(y, m + 1, 0).getDate()))
  return dt.toISOString().split('T')[0]
}

const nextMonth = (m, y) => ({ m: (m + 1) % 12, y: m === 11 ? y + 1 : y })

// FY month helper: i=0→April, i=11→March
const fyMon = (i, fyS) => {
  const m = (3 + i) % 12
  const y = i < 9 ? fyS : fyS + 1
  return { m, y }
}

/**
 * Generate all compliance tasks for a client for a given FY.
 * @param {object} client  - client document from Firestore
 * @param {string} assignedTo - uid of assigned team member
 * @param {string} fy      - e.g. "2025-26"
 * @returns {Array} task objects (without Firestore IDs — caller adds those)
 */
export const generateTasks = (client, assignedTo, fy = '2025-26') => {
  const tasks = []
  const fyS   = parseInt(fy)    // e.g. 2025
  const fyE   = fyS + 1         // e.g. 2026

  const now = new Date().toISOString()

  const task = (service, period, dueDate) => ({
    clientId:   client.id,
    clientName: client.name,
    service,
    period,
    dueDate,
    assignedTo,
    status:     'pending',
    statusNote: '',
    arn:        '',
    comments:   [],
    history:    [],
    fy,
    createdAt:  now,
    updatedAt:  now,
  })

  /* ── GST ─────────────────────────────────────── */
  if (client.gstApplicable) {
    if (client.gstFreq === 'monthly') {
      for (let i = 0; i < 12; i++) {
        const { m, y } = fyMon(i, fyS)
        const nm       = nextMonth(m, y)
        const period   = `${MONTHS[m]} ${y}`
        tasks.push(task('GSTR-1',              period, mkDate(nm.y, nm.m, 11)))
        tasks.push(task('GSTR-2B Reconciliation', period, mkDate(nm.y, nm.m, 15)))
        tasks.push(task('GSTR-3B',             period, mkDate(nm.y, nm.m, 20)))
      }
    } else {
      // Quarterly (QRMP)
      const quarters = [
        { p: 'Q1 (Apr–Jun)', dm: 6, dy: fyS  },
        { p: 'Q2 (Jul–Sep)', dm: 9, dy: fyS  },
        { p: 'Q3 (Oct–Dec)', dm: 0, dy: fyE  },
        { p: 'Q4 (Jan–Mar)', dm: 3, dy: fyE  },
      ]
      quarters.forEach(q => {
        tasks.push(task('GSTR-1 (Quarterly)',       q.p, mkDate(q.dy, q.dm, 13)))
        tasks.push(task('GSTR-2B Reconciliation',   q.p, mkDate(q.dy, q.dm, 15)))
        tasks.push(task('GSTR-3B (Quarterly)',      q.p, mkDate(q.dy, q.dm, 22)))
      })
    }
    // Annual return
    tasks.push(task('GSTR-9 Annual Return', `FY ${fy}`, mkDate(fyE, 11, 31)))
  }

  /* ── TDS ─────────────────────────────────────── */
  if (client.tdsApplicable) {
    for (let i = 0; i < 12; i++) {
      const { m, y } = fyMon(i, fyS)
      const nm        = nextMonth(m, y)
      // March payment special: due April 30
      const due = m === 2 ? mkDate(fyE, 3, 30) : mkDate(nm.y, nm.m, 7)
      tasks.push(task('TDS Payment', `${MONTHS[m]} ${y}`, due))
    }
    const tdsReturns = [
      { p: 'Q1 (Apr–Jun)', d: mkDate(fyS, 6, 31)  },
      { p: 'Q2 (Jul–Sep)', d: mkDate(fyS, 9, 31)  },
      { p: 'Q3 (Oct–Dec)', d: mkDate(fyE, 0, 31)  },
      { p: 'Q4 (Jan–Mar)', d: mkDate(fyE, 4, 31)  },
    ]
    tdsReturns.forEach(r => tasks.push(task('TDS Return', r.p, r.d)))
  }

  /* ── PT Maharashtra ──────────────────────────── */
  if (client.ptMH) {
    for (let i = 0; i < 12; i++) {
      const { m, y } = fyMon(i, fyS)
      tasks.push(task('PT Payment (Maharashtra)', `${MONTHS[m]} ${y}`, mkDate(y, m, 31)))
    }
    tasks.push(task('PT Return (Maharashtra)', `FY ${fy}`, mkDate(fyE, 2, 31)))
  }

  /* ── PT Karnataka ────────────────────────────── */
  if (client.ptKA) {
    tasks.push(task('PT Payment (Karnataka)', `FY ${fy}`, mkDate(fyS, 3, 30)))
    tasks.push(task('PT Return (Karnataka)',  `FY ${fy}`, mkDate(fyS, 3, 30)))
  }

  /* ── Income Tax ──────────────────────────────── */
  if (client.itApplicable) {
    const due = client.auditCase ? mkDate(fyE, 9, 31) : mkDate(fyE, 6, 31)
    tasks.push(task('Income Tax Filing', `AY ${fyE}-${String(fyE + 1).slice(2)}`, due))
  }

  /* ── Advance Tax ─────────────────────────────── */
  if (client.advanceTax) {
    const instalments = [
      { p: '1st Instalment (15%)',  d: mkDate(fyS, 5,  15) },
      { p: '2nd Instalment (45%)',  d: mkDate(fyS, 8,  15) },
      { p: '3rd Instalment (75%)',  d: mkDate(fyS, 11, 15) },
      { p: '4th Instalment (100%)', d: mkDate(fyE, 2,  15) },
    ]
    instalments.forEach(a => tasks.push(task('Advance Tax', a.p, a.d)))
  }

  /* ── Accounting ──────────────────────────────── */
  if (client.accounting) {
    for (let i = 0; i < 12; i++) {
      const { m, y } = fyMon(i, fyS)
      const nm        = nextMonth(m, y)
      tasks.push(task('Accounting', `${MONTHS[m]} ${y}`, mkDate(nm.y, nm.m, 28)))
    }
  }

  /* ── CA Certificates (ad-hoc placeholder) ────── */
  if (client.caCertificates) {
    tasks.push(task('CA Certificate', `FY ${fy}`, mkDate(fyE, 2, 31)))
  }

  return tasks
}

/**
 * When a client switches GST frequency (monthly ↔ quarterly),
 * remove existing pending GST tasks and regenerate.
 */
export const getGstTaskFilter = (clientId, newFreq) => {
  const gstServices = [
    'GSTR-1', 'GSTR-2B Reconciliation', 'GSTR-3B',
    'GSTR-1 (Quarterly)', 'GSTR-3B (Quarterly)',
  ]
  return gstServices
}
