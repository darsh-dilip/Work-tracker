import { useState } from 'react'
import { ROLES, DONE_STATUSES, CLIENT_STATUS } from '../constants.js'
import { getBucket, fmtDate } from '../utils/dates.js'
import { Avatar, StatCard, BucketSection, Label, Modal, Alert } from '../components/UI.jsx'
import { bulkReassignClientTasks, setClientStatus } from '../hooks/useFirestore.js'
import { logClientStatusChanged, logClientReassigned } from '../utils/auditLog.js'

/* ── Client Status Control ── */
const ClientStatusControl = ({ client, currentUser, onChanged }) => {
  const [saving, setSaving] = useState(false)
  const current = client.clientStatus || 'active'

  const change = async newStatus => {
    if (newStatus === current) return
    setSaving(true)
    await setClientStatus(client.id, newStatus)
    await logClientStatusChanged(client, current, newStatus, currentUser)
    setSaving(false)
    if (onChanged) onChanged()
  }

  const opts = [
    { v:'active',       l:'Active',       c:'#22c55e', bg:'#22c55e15' },
    { v:'on_hold',      l:'On Hold',      c:'#f59e0b', bg:'#f59e0b15' },
    { v:'discontinued', l:'Discontinued', c:'#f43f5e', bg:'#f43f5e15' },
  ]

  return (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <span style={{ fontSize:11, color:'var(--text3)', marginRight:2 }}>Client Status:</span>
      {opts.map(o => (
        <button key={o.v} onClick={() => change(o.v)} disabled={saving} style={{
          padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:700, cursor:'pointer',
          border:`1px solid ${o.c}50`, transition:'all 0.15s',
          background: current===o.v ? o.bg   : 'transparent',
          color:      current===o.v ? o.c    : 'var(--text3)',
          outline: current===o.v ? `1px solid ${o.c}` : 'none',
        }}>{o.l}</button>
      ))}
    </div>
  )
}

/* ── Client-level overlay badge (shown on tasks) ── */
export const ClientOverlayBadge = ({ clientStatus }) => {
  const st = CLIENT_STATUS[clientStatus]
  if (!st?.badge) return null
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', padding:'2px 8px',
      borderRadius:4, fontSize:10, fontWeight:800, letterSpacing:'0.07em',
      background: st.badgeBg, color: st.badgeColor, border:`1px solid ${st.badgeBorder}`,
    }}>{st.badge}</span>
  )
}

/* ── Client Row ── */
const ClientRow = ({ client, users, tasks, onClick }) => {
  const assignee   = users.find(u => u.id === client.assignedTo)
  const ct         = tasks.filter(t => t.clientId === client.id)
  const overdue    = ct.filter(t => getBucket(t) === 'overdue').length
  const active     = ct.filter(t => !DONE_STATUSES.includes(t.status) && t.status !== 'dropped').length
  const done       = ct.filter(t => DONE_STATUSES.includes(t.status)).length
  const clientSt   = client.clientStatus || 'active'
  const badge      = CLIENT_STATUS[clientSt]

  const compliance = [
    client.gstApplicable && `GST (${client.gstFreq === 'monthly' ? 'M' : 'Q'})`,
    client.tdsApplicable && 'TDS', client.ptMH && 'PT-MH', client.ptKA && 'PT-KA',
    client.itApplicable  && 'IT',  client.advanceTax && 'Adv Tax', client.accounting && 'Accts',
  ].filter(Boolean)

  return (
    <div onClick={onClick} className="hover-lift" style={{
      background:'var(--surface)', borderRadius:12, cursor:'pointer',
      border:`1px solid ${clientSt === 'discontinued' ? '#f43f5e40' : clientSt === 'on_hold' ? '#f59e0b40' : 'var(--border)'}`,
      padding:'14px 18px', display:'grid', gridTemplateColumns:'2fr 1fr auto auto', alignItems:'center', gap:16,
      opacity: clientSt === 'discontinued' ? 0.7 : 1,
    }}>
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
          <div style={{ fontWeight:700, fontSize:14, color:'var(--text)' }}>{client.name}</div>
          {badge?.badge && <ClientOverlayBadge clientStatus={clientSt}/>}
        </div>
        <div style={{ fontSize:11, color:'var(--text3)', marginBottom:6 }}>{client.constitution} · {client.gstin || '—'}</div>
        <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
          {compliance.map((c,i) => <span key={i} className="chip" style={{ background:'#5b8dee15', color:'#5b8dee', border:'1px solid #5b8dee25' }}>{c}</span>)}
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        {assignee && <Avatar name={assignee.name} init={assignee.init} role={assignee.role} sz={28}/>}
        <div>
          <div style={{ fontSize:12, fontWeight:600, color:'var(--text)' }}>{assignee?.name || 'Unassigned'}</div>
          <div style={{ fontSize:11, color:'var(--text3)' }}>{assignee && ROLES[assignee.role]}</div>
        </div>
      </div>
      <div style={{ display:'flex', gap:16 }}>
        {[{v:overdue,l:'Overdue',c:'var(--danger)'},{v:active,l:'Active',c:'var(--warn)'},{v:done,l:'Done',c:'var(--success)'}].map(s=>(
          <div key={s.l} style={{ textAlign:'center' }}>
            <div style={{ fontWeight:700, color:s.c, fontSize:16 }}>{s.v}</div>
            <div style={{ fontSize:10, color:'var(--text3)' }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ color:'var(--text3)' }}>›</div>
    </div>
  )
}

/* ── Client Detail ── */
const ClientDetail = ({ client, tasks, users, currentUser, onTask, onBack }) => {
  const [reassigning, setReassigning] = useState(false)
  const [newAssignee, setNewAssignee] = useState(client.assignedTo)
  const [saving,      setSaving]      = useState(false)

  const ct      = tasks.filter(t => t.clientId === client.id)
  const overdue = ct.filter(t => getBucket(t) === 'overdue')
  const today   = ct.filter(t => getBucket(t) === 'today')
  const upcoming= ct.filter(t => ['soon3','soon7','others'].includes(getBucket(t)))
  const done    = ct.filter(t => getBucket(t) === 'done')
  const hold    = ct.filter(t => ['hold','dropped'].includes(getBucket(t)))
  const clientSt = client.clientStatus || 'active'
  const badge    = CLIENT_STATUS[clientSt]

  const doReassign = async () => {
    setSaving(true)
    const oldName = users.find(u=>u.id===client.assignedTo)?.name || 'Unknown'
    const newName = users.find(u=>u.id===newAssignee)?.name || 'Unknown'
    await bulkReassignClientTasks(client.id, newAssignee, tasks)
    await logClientReassigned(client, oldName, newName, currentUser)
    setSaving(false); setReassigning(false)
  }

  return (
    <div className="fade-up" style={{ padding:'24px 28px', maxWidth:1000 }}>
      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom:16 }}>← Back to Clients</button>

      <div style={{ display:'flex', alignItems:'flex-start', gap:16, marginBottom:12 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
            <div style={{ fontSize:22, fontWeight:800, color:'var(--text)' }}>{client.name}</div>
            {badge?.badge && <ClientOverlayBadge clientStatus={clientSt}/>}
          </div>
          <div style={{ fontSize:13, color:'var(--text2)' }}>
            {client.constitution} · GSTIN: {client.gstin||'—'} · PAN: {client.pan||'—'} · TAN: {client.tan||'—'}
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setReassigning(!reassigning)}>↔ Reassign All Pending</button>
      </div>

      {/* Client Status Control */}
      <div className="card" style={{ padding:'12px 16px', marginBottom:16 }}>
        <ClientStatusControl client={client} currentUser={currentUser}/>
        {clientSt !== 'active' && (
          <div style={{ marginTop:8, fontSize:12, color: clientSt==='discontinued' ? 'var(--danger)' : 'var(--warn)' }}>
            {clientSt === 'on_hold'
              ? '⚠️ All tasks for this client are showing an ON HOLD badge. Internal task statuses are preserved.'
              : '🛑 All tasks for this client are showing a STOP SERVICE badge. This client has been discontinued.'}
          </div>
        )}
      </div>

      {reassigning && (
        <div className="card" style={{ padding:14, marginBottom:16 }}>
          <Label>Reassign ALL pending tasks of this client to:</Label>
          <div style={{ display:'flex', gap:8, marginTop:8 }}>
            <select value={newAssignee} onChange={e=>setNewAssignee(e.target.value)} style={{ flex:1 }}>
              {users.filter(u=>u.role!=='partner').map(u=>(
                <option key={u.id} value={u.id}>{u.name} ({ROLES[u.role]})</option>
              ))}
            </select>
            <button className="btn btn-primary" onClick={doReassign} disabled={saving}>{saving?'Saving…':'Confirm'}</button>
          </div>
        </div>
      )}

      <div className="grid-4" style={{ marginBottom:20 }}>
        <StatCard label="Overdue"   value={overdue.length}  color="var(--danger)"  />
        <StatCard label="Due Today" value={today.length}    color="var(--warn)"    />
        <StatCard label="Upcoming"  value={upcoming.length} color="var(--accent)"  />
        <StatCard label="Completed" value={done.length}     color="var(--success)" />
      </div>

      <BucketSection label="🔴 Overdue"        tasks={overdue}   color="#f43f5e" users={users} clients={[client]} onTask={onTask} />
      <BucketSection label="🟠 Due Today"      tasks={today}     color="#fb923c" users={users} clients={[client]} onTask={onTask} />
      <BucketSection label="📋 Upcoming"       tasks={upcoming}  color="#5b8dee" users={users} clients={[client]} onTask={onTask} />
      <BucketSection label="⏸ Hold / Dropped" tasks={hold}      color="#a78bfa" users={users} clients={[client]} onTask={onTask} defaultOpen={false}/>
      <BucketSection label="✅ Completed"      tasks={done}      color="#22c55e" users={users} clients={[client]} onTask={onTask} defaultOpen={false}/>
    </div>
  )
}

/* ── Main ClientsPage ── */
export const ClientsPage = ({ clients, users, tasks, currentUser, onAdd, onTask }) => {
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState(null)
  const [filter,   setFilter]   = useState('all')

  // Sync selected client with live data
  const liveSelected = selected ? clients.find(c => c.id === selected.id) || selected : null

  if (liveSelected) return (
    <ClientDetail
      client={liveSelected} tasks={tasks} users={users} currentUser={currentUser}
      onTask={onTask} onBack={() => setSelected(null)}
    />
  )

  const filtered = clients
    .filter(c => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.gstin||'').includes(search) || (c.pan||'').includes(search)
      const matchFilter = filter === 'all' || (c.clientStatus||'active') === filter
      return matchSearch && matchFilter
    })

  const counts = {
    all:          clients.length,
    active:       clients.filter(c=>(c.clientStatus||'active')==='active').length,
    on_hold:      clients.filter(c=>c.clientStatus==='on_hold').length,
    discontinued: clients.filter(c=>c.clientStatus==='discontinued').length,
  }

  return (
    <div className="fade-up" style={{ padding:'24px 28px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <div style={{ fontSize:20, fontWeight:800, color:'var(--text)', flex:1 }}>Clients</div>
        <button className="btn btn-primary" onClick={onAdd}>+ Onboard New Client</button>
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
        <input placeholder="🔍  Search by name, GSTIN, or PAN…" value={search} onChange={e=>setSearch(e.target.value)} style={{ maxWidth:300 }}/>
        <div style={{ display:'flex', gap:4 }}>
          {[['all','All'],['active','Active'],['on_hold','On Hold'],['discontinued','Discontinued']].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)} style={{
              padding:'6px 12px', borderRadius:20, fontSize:12, fontWeight:600, cursor:'pointer', border:'1px solid var(--border2)',
              background: filter===v ? 'var(--surface3)' : 'transparent',
              color:      filter===v ? 'var(--text)'     : 'var(--text3)',
            }}>{l} <span style={{ opacity:0.6 }}>({counts[v]})</span></button>
          ))}
        </div>
      </div>

      <div style={{ fontSize:12, color:'var(--text3)', marginBottom:12 }}>{filtered.length} clients</div>

      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {filtered.map(c => (
          <ClientRow key={c.id} client={c} users={users} tasks={tasks} onClick={() => setSelected(c)}/>
        ))}
        {!filtered.length && (
          <div style={{ textAlign:'center', padding:40, color:'var(--text3)' }}>
            {search ? 'No clients match your search.' : 'No clients yet. Onboard your first client!'}
          </div>
        )}
      </div>
    </div>
  )
}
