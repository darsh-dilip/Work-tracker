import { useState } from 'react'
import { ROLES, DONE_STATUSES } from '../constants.js'
import { getBucket, fmtDate } from '../utils/dates.js'
import { Avatar, StatCard, BucketSection, Label, Modal, Alert } from '../components/UI.jsx'
import { bulkReassignClientTasks } from '../hooks/useFirestore.js'

/* ── Client Row ── */
const ClientRow = ({ client, users, tasks, onClick }) => {
  const assignee = users.find(u => u.id === client.assignedTo)
  const ct       = tasks.filter(t => t.clientId === client.id)
  const overdue  = ct.filter(t => getBucket(t) === 'overdue').length
  const active   = ct.filter(t => !DONE_STATUSES.includes(t.status) && t.status !== 'dropped').length
  const done     = ct.filter(t => DONE_STATUSES.includes(t.status)).length

  const compliance = [
    client.gstApplicable    && `GST (${client.gstFreq === 'monthly' ? 'M' : 'Q'})`,
    client.tdsApplicable    && 'TDS',
    client.ptMH             && 'PT-MH',
    client.ptKA             && 'PT-KA',
    client.itApplicable     && 'IT',
    client.advanceTax       && 'Adv Tax',
    client.accounting       && 'Accounting',
  ].filter(Boolean)

  return (
    <div onClick={onClick} className="hover-lift" style={{
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
      padding: '14px 18px', cursor: 'pointer',
      display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto',
      alignItems: 'center', gap: 16,
    }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{client.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{client.constitution} · GSTIN: {client.gstin || '—'}</div>
        <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap' }}>
          {compliance.map((c, i) => (
            <span key={i} className="chip" style={{ background: '#5b8dee15', color: '#5b8dee', border: '1px solid #5b8dee25' }}>{c}</span>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {assignee && <Avatar name={assignee.name} init={assignee.init} role={assignee.role} sz={28} />}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{assignee?.name || 'Unassigned'}</div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>{assignee && ROLES[assignee.role]}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        {[{ v: overdue, l: 'Overdue', c: 'var(--danger)' }, { v: active, l: 'Active', c: 'var(--warn)' }, { v: done, l: 'Done', c: 'var(--success)' }].map(s => (
          <div key={s.l} style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, color: s.c, fontSize: 16 }}>{s.v}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)' }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ color: 'var(--text3)' }}>›</div>
    </div>
  )
}

/* ── Client Detail ── */
const ClientDetail = ({ client, tasks, users, onTask, onBack }) => {
  const [reassigning,  setReassigning]  = useState(false)
  const [newAssignee,  setNewAssignee]  = useState(client.assignedTo)
  const [saving,       setSaving]       = useState(false)

  const ct      = tasks.filter(t => t.clientId === client.id)
  const overdue = ct.filter(t => getBucket(t) === 'overdue')
  const today   = ct.filter(t => getBucket(t) === 'today')
  const upcoming = ct.filter(t => ['soon3','soon7','others'].includes(getBucket(t)))
  const done    = ct.filter(t => getBucket(t) === 'done')
  const hold    = ct.filter(t => ['hold','dropped'].includes(getBucket(t)))

  const doReassign = async () => {
    setSaving(true)
    await bulkReassignClientTasks(client.id, newAssignee, tasks)
    setSaving(false); setReassigning(false)
  }

  return (
    <div className="fade-up" style={{ padding: '24px 28px', maxWidth: 1000 }}>
      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: 16 }}>← Back to Clients</button>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>{client.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>
            {client.constitution} · GSTIN: {client.gstin || '—'} · PAN: {client.pan || '—'} · TAN: {client.tan || '—'}
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setReassigning(!reassigning)}>↔ Reassign All Pending</button>
      </div>

      {reassigning && (
        <div className="card" style={{ padding: 14, marginBottom: 16 }}>
          <Label>Reassign ALL pending tasks of this client to:</Label>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <select value={newAssignee} onChange={e => setNewAssignee(e.target.value)} style={{ flex: 1 }}>
              {users.filter(u => u.role !== 'partner').map(u => (
                <option key={u.id} value={u.id}>{u.name} ({ROLES[u.role]})</option>
              ))}
            </select>
            <button className="btn btn-primary" onClick={doReassign} disabled={saving}>
              {saving ? 'Saving…' : 'Confirm Reassign'}
            </button>
          </div>
        </div>
      )}

      <div className="grid-4" style={{ marginBottom: 20 }}>
        <StatCard label="Overdue"  value={overdue.length}  color="var(--danger)"  />
        <StatCard label="Due Today" value={today.length}   color="var(--warn)"    />
        <StatCard label="Upcoming" value={upcoming.length} color="var(--accent)"  />
        <StatCard label="Completed"value={done.length}     color="var(--success)" />
      </div>

      <BucketSection label="🔴 Overdue"   tasks={overdue}   color="#f43f5e" users={users} onTask={onTask} />
      <BucketSection label="🟠 Due Today" tasks={today}     color="#fb923c" users={users} onTask={onTask} />
      <BucketSection label="📋 Upcoming"  tasks={upcoming}  color="#5b8dee" users={users} onTask={onTask} />
      <BucketSection label="⏸ Hold / Dropped" tasks={hold} color="#a78bfa" users={users} onTask={onTask} defaultOpen={false} />
      <BucketSection label="✅ Completed" tasks={done}      color="#22c55e" users={users} onTask={onTask} defaultOpen={false} />
    </div>
  )
}

/* ── Main ClientsPage ── */
export const ClientsPage = ({ clients, users, tasks, onAdd, onTask }) => {
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState(null)

  if (selected) return <ClientDetail client={selected} tasks={tasks} users={users} onTask={onTask} onBack={() => setSelected(null)} />

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.gstin || '').includes(search) ||
    (c.pan   || '').includes(search)
  )

  return (
    <div className="fade-up" style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', flex: 1 }}>Clients</div>
        <button className="btn btn-primary" onClick={onAdd}>+ Onboard New Client</button>
      </div>

      <input
        placeholder="🔍  Search by name, GSTIN, or PAN…"
        value={search} onChange={e => setSearch(e.target.value)}
        style={{ maxWidth: 380, marginBottom: 14 }}
      />
      <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>{filtered.length} clients</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.map(c => (
          <ClientRow key={c.id} client={c} users={users} tasks={tasks} onClick={() => setSelected(c)} />
        ))}
        {!filtered.length && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>
            {search ? 'No clients match your search.' : 'No clients yet. Onboard your first client!'}
          </div>
        )}
      </div>
    </div>
  )
}
