import { useState } from 'react'
import { TASK_STATUSES, ROLES } from '../constants.js'
import { fmtDate } from '../utils/dates.js'
import { Modal, Label, StatusBadge, Avatar, Divider, Alert } from './UI.jsx'
import { updateTask } from '../hooks/useFirestore.js'
import { arrayUnion, serverTimestamp } from 'firebase/firestore'

const ARN_STATUSES = ['filed', 'nil_filed', 'completed']

export const TaskModal = ({ task, users, onClose, onReassign, currentUser }) => {
  const [status,     setStatus]     = useState(task.status)
  const [note,       setNote]       = useState(task.statusNote || '')
  const [arn,        setArn]        = useState(task.arn || '')
  const [comment,    setComment]    = useState('')
  const [reassigning, setReassigning] = useState(false)
  const [newAssignee, setNewAssignee] = useState(task.assignedTo)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')

  const assignee = users.find(u => u.id === task.assignedTo)
  const needsArn = ARN_STATUSES.includes(status)

  const save = async () => {
    setSaving(true)
    try {
      await updateTask(task.id, {
        status, statusNote: note, arn,
        history: arrayUnion({
          action: `Status → ${TASK_STATUSES.find(s => s.v === status)?.l || status}`,
          by: currentUser.id,
          byName: currentUser.name,
          at: new Date().toISOString(),
        }),
      })
      onClose()
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  const addComment = async () => {
    if (!comment.trim()) return
    await updateTask(task.id, {
      comments: arrayUnion({ text: comment, at: new Date().toISOString(), by: currentUser.id, byName: currentUser.name }),
    })
    setComment('')
  }

  const doReassign = async () => {
    await updateTask(task.id, {
      assignedTo: newAssignee,
      history: arrayUnion({ action: `Reassigned to ${users.find(u=>u.id===newAssignee)?.name}`, by: currentUser.id, byName: currentUser.name, at: new Date().toISOString() }),
    })
    if (onReassign) onReassign()
    setReassigning(false)
  }

  return (
    <Modal open onClose={onClose} title={`${task.service} — ${task.period}`} width={560}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Info grid */}
        <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div><Label>Client</Label><div style={{ color: 'var(--text)', fontWeight: 600, fontSize: 13 }}>{task.clientName}</div></div>
          <div><Label>Due Date</Label><div style={{ color: 'var(--text)', fontSize: 13 }}>{fmtDate(task.dueDate)}</div></div>
          <div>
            <Label>Assigned To</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {assignee && <Avatar name={assignee.name} init={assignee.init} role={assignee.role} sz={22} />}
              <span style={{ color: 'var(--text)', fontSize: 13 }}>{assignee?.name || 'Unassigned'}</span>
            </div>
          </div>
          <div><Label>FY</Label><div style={{ color: 'var(--text)', fontSize: 13 }}>{task.fy}</div></div>
          {task.arn && <div style={{ gridColumn: '1/-1' }}><Label>ARN / Ack No.</Label><div style={{ color: 'var(--success)', fontSize: 13, fontFamily: 'var(--mono)' }}>{task.arn}</div></div>}
        </div>

        {/* Status */}
        <div>
          <Label>Update Status</Label>
          <select value={status} onChange={e => setStatus(e.target.value)}>
            {TASK_STATUSES.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
          </select>
        </div>

        {needsArn && (
          <div>
            <Label>Acknowledgement / ARN Number</Label>
            <input placeholder="Enter ARN or Ack. No." value={arn} onChange={e => setArn(e.target.value)} />
          </div>
        )}

        <div>
          <Label>Status Note / Internal Remark</Label>
          <textarea placeholder="Add an internal note (optional)…" value={note} onChange={e => setNote(e.target.value)} rows={2} style={{ resize: 'vertical' }} />
        </div>

        {error && <Alert message={error} />}

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save Status Update'}
          </button>
          <button className="btn btn-ghost" onClick={() => setReassigning(!reassigning)}>↔ Reassign</button>
        </div>

        {reassigning && (
          <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: 12 }}>
            <Label>Reassign This Task To</Label>
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={newAssignee} onChange={e => setNewAssignee(e.target.value)} style={{ flex: 1 }}>
                {users.filter(u => u.role !== 'partner').map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({ROLES[u.role]})</option>
                ))}
              </select>
              <button className="btn btn-primary" onClick={doReassign}>Confirm</button>
            </div>
          </div>
        )}

        <Divider />

        {/* Comments */}
        <div>
          <Label>Comments &amp; Notes</Label>
          {!(task.comments?.length) && <div style={{ color: 'var(--text3)', fontSize: 12, marginBottom: 8 }}>No comments yet.</div>}
          {(task.comments || []).map((c, i) => {
            const u = users.find(x => x.id === c.by)
            return (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <Avatar name={u?.name || c.byName} init={u?.init} role={u?.role} sz={26} />
                <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '7px 10px', flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 3 }}>
                    {u?.name || c.byName || '?'} · {new Date(c.at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text)' }}>{c.text}</div>
                </div>
              </div>
            )
          })}
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <input placeholder="Add a comment…" value={comment} onChange={e => setComment(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addComment()} style={{ flex: 1 }} />
            <button className="btn btn-ghost btn-sm" onClick={addComment}>Add</button>
          </div>
        </div>

        {/* History */}
        {(task.history?.length > 0) && (
          <div>
            <Label>History</Label>
            {[...(task.history || [])].reverse().slice(0, 5).map((h, i) => (
              <div key={i} style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 3 }}>
                • {h.action} by {h.byName || '?'} · {new Date(h.at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}
