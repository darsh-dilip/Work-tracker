import { DONE_STATUSES, HOLD_STATUSES } from '../constants.js'

export const TODAY = (() => { const d = new Date(); d.setHours(0,0,0,0); return d })()

export const parseDt = s => { if (!s) return null; const d = new Date(s); d.setHours(0,0,0,0); return d }
export const daysDiff = s => { const d = parseDt(s); return d ? Math.ceil((d - TODAY) / 864e5) : null }
export const fmtDate  = s => { if (!s) return '—'; return parseDt(s).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) }
export const fmtDateTime = s => {
  if (!s) return '—'
  const d = s.toDate ? s.toDate() : new Date(s)
  return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
}

export const getBucket = (t, clientStatus) => {
  // Client-level overrides take visual priority but bucket stays for sorting
  if (t.status === 'dropped')              return 'dropped'
  if (HOLD_STATUSES.includes(t.status))   return 'hold'
  if (DONE_STATUSES.includes(t.status))   return 'done'
  const d = daysDiff(t.dueDate)
  if (d === null) return 'others'
  if (d < 0)      return 'overdue'
  if (d === 0)    return 'today'
  if (d <= 3)     return 'soon3'
  if (d <= 7)     return 'soon7'
  return 'others'
}
