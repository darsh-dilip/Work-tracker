import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore'
import { db } from '../firebase.js'
import { LOG_ACTIONS } from '../constants.js'

/**
 * Write one log entry to the `logs` Firestore collection.
 * All mutations in the app should call this.
 *
 * @param {object} p
 * @param {string} p.action        — one of LOG_ACTIONS values
 * @param {object} p.by            — { id, name } of the user performing the action
 * @param {string} p.entityId      — Firestore doc ID of the subject (task or client)
 * @param {string} p.entityName    — human-readable name (client name / service name)
 * @param {string} [p.clientId]    — parent client ID (always populate if known)
 * @param {string} [p.clientName]  — parent client name
 * @param {any}    [p.oldValue]    — previous value (for changes)
 * @param {any}    [p.newValue]    — new value
 * @param {string} [p.note]        — any free-text note
 */
export const writeLog = async ({
  action,
  by,
  entityId   = '',
  entityName = '',
  clientId   = '',
  clientName = '',
  oldValue   = null,
  newValue   = null,
  note       = '',
}) => {
  try {
    await addDoc(collection(db, 'logs'), {
      action,
      by:         { id: by.id, name: by.name },
      entityId,
      entityName,
      clientId,
      clientName,
      oldValue,
      newValue,
      note,
      createdAt:  serverTimestamp(),
      // ISO string for display (serverTimestamp is async)
      createdAtISO: new Date().toISOString(),
    })
  } catch (e) {
    // Never crash the app over a log failure
    console.warn('Audit log write failed:', e.message)
  }
}

// ─── Pre-built log helpers ───────────────────────────────────

export const logClientOnboarded = (client, by) =>
  writeLog({
    action:     LOG_ACTIONS.CLIENT_ONBOARDED,
    by,
    entityId:   client.id,
    entityName: client.name,
    clientId:   client.id,
    clientName: client.name,
    newValue:   client.constitution,
    note:       `Onboarded with FY ${client.fy}`,
  })

export const logClientStatusChanged = (client, oldStatus, newStatus, by) =>
  writeLog({
    action:     LOG_ACTIONS.CLIENT_STATUS_CHANGED,
    by,
    entityId:   client.id,
    entityName: client.name,
    clientId:   client.id,
    clientName: client.name,
    oldValue:   oldStatus,
    newValue:   newStatus,
  })

export const logTaskStatusChanged = (task, oldStatus, newStatus, by, arn = '') =>
  writeLog({
    action:     LOG_ACTIONS.TASK_STATUS_CHANGED,
    by,
    entityId:   task.id,
    entityName: `${task.service} — ${task.period}`,
    clientId:   task.clientId,
    clientName: task.clientName,
    oldValue:   oldStatus,
    newValue:   newStatus,
    note:       arn ? `ARN/Ref: ${arn}` : '',
  })

export const logTaskReassigned = (task, oldAssigneeName, newAssigneeName, by) =>
  writeLog({
    action:     LOG_ACTIONS.TASK_REASSIGNED,
    by,
    entityId:   task.id,
    entityName: `${task.service} — ${task.period}`,
    clientId:   task.clientId,
    clientName: task.clientName,
    oldValue:   oldAssigneeName,
    newValue:   newAssigneeName,
  })

export const logClientReassigned = (client, oldAssigneeName, newAssigneeName, by) =>
  writeLog({
    action:     LOG_ACTIONS.CLIENT_REASSIGNED,
    by,
    entityId:   client.id,
    entityName: client.name,
    clientId:   client.id,
    clientName: client.name,
    oldValue:   oldAssigneeName,
    newValue:   newAssigneeName,
  })

export const logCommentAdded = (task, commentText, by) =>
  writeLog({
    action:     LOG_ACTIONS.COMMENT_ADDED,
    by,
    entityId:   task.id,
    entityName: `${task.service} — ${task.period}`,
    clientId:   task.clientId,
    clientName: task.clientName,
    note:       commentText,
  })

export const logUserCreated = (newUser, by) =>
  writeLog({
    action:     LOG_ACTIONS.USER_CREATED,
    by,
    entityId:   newUser.id || '',
    entityName: newUser.name,
    newValue:   newUser.role,
  })

// ─── Real-time log listener ──────────────────────────────────

/**
 * Listen to recent logs. Returns unsubscribe fn.
 * @param {function} onData  - receives array of log docs
 * @param {number}   count   - how many to fetch (default 200)
 * @param {string}   [filterClientId] - optional filter
 */
export const subscribeLogs = (onData, count = 200, filterClientId = null) => {
  let q = query(
    collection(db, 'logs'),
    orderBy('createdAt', 'desc'),
    limit(count)
  )
  if (filterClientId) {
    q = query(
      collection(db, 'logs'),
      where('clientId', '==', filterClientId),
      orderBy('createdAt', 'desc'),
      limit(count)
    )
  }
  return onSnapshot(q, snap => {
    onData(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}
