import { useState, useMemo } from 'react'
import { ROLES, ROLE_CLR, ROLE_ORDER, DONE_STATUSES } from '../constants.js'
import { getBucket } from '../utils/dates.js'
import { getSubordinates } from '../utils/hierarchy.js'
import { Avatar, StatCard, BucketSection } from '../components/UI.jsx'

const MemberCard = ({ member, tasks, users, onClick }) => {
  const mt      = tasks.filter(t => t.assignedTo === member.id)
  const overdue = mt.filter(t => getBucket(t) === 'overdue').length
  const today   = mt.filter(t => getBucket(t) === 'today').length
  const active  = mt.filter(t => !DONE_STATUSES.includes(t.status) && t.status !== 'dropped').length
  const done    = mt.filter(t => DONE_STATUSES.includes(t.status)).length
  const mgr     = users.find(u => u.id === member.reportsTo)

  return (
    <div onClick={onClick} className="hover-lift" style={{
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
      padding: '14px 18px', cursor: 'pointer',
      display: 'grid', gridTemplateColumns: 'auto 1fr 80px 80px 80px 80px 24px',
      alignItems: 'center', gap: 16,
    }}>
      <Avatar name={member.name} init={member.init} role={member.role} sz={36} />
      <div>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{member.name}</div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 3 }}>
          <span style={{ fontSize: 11, color: ROLE_CLR[member.role], fontWeight: 600 }}>{ROLES[member.role]}</span>
          {mgr && <span style={{ fontSize: 11, color: 'var(--text3)' }}>· Reports to {mgr.name.split(' ')[0]}</span>}
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>· {member.dept}</span>
        </div>
      </div>
      {[
        { v: overdue, c: 'var(--danger)', l: 'Overdue' },
        { v: today,   c: 'var(--warn)',   l: 'Today'   },
        { v: active,  c: 'var(--accent)', l: 'Active'  },
        { v: done,    c: 'var(--success)',l: 'Done'    },
      ].map(s => (
        <div key={s.l} style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, color: s.c, fontSize: 18 }}>{s.v}</div>
          <div style={{ fontSize: 10, color: 'var(--text3)' }}>{s.l}</div>
        </div>
      ))}
      <div style={{ color: 'var(--text3)' }}>›</div>
    </div>
  )
}

const MemberDetail = ({ member, tasks, users, onTask, onBack }) => {
  const mt      = tasks.filter(t => t.assignedTo === member.id)
  const overdue = mt.filter(t => getBucket(t) === 'overdue')
  const today   = mt.filter(t => getBucket(t) === 'today')
  const upcoming= mt.filter(t => ['soon3','soon7','others'].includes(getBucket(t)))
  const done    = mt.filter(t => getBucket(t) === 'done')
  const hold    = mt.filter(t => ['hold','dropped'].includes(getBucket(t)))

  return (
    <div className="fade-up" style={{ padding: '24px 28px', maxWidth: 1000 }}>
      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: 16 }}>← Back to Team</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <Avatar name={member.name} init={member.init} role={member.role} sz={44} />
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{member.name}</div>
          <div style={{ fontSize: 12, color: ROLE_CLR[member.role], fontWeight: 600 }}>
            {ROLES[member.role]} · {member.dept}
          </div>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        <StatCard label="Overdue"  value={overdue.length}  color="var(--danger)"  />
        <StatCard label="Due Today"value={today.length}    color="var(--warn)"    />
        <StatCard label="Upcoming" value={upcoming.length} color="var(--accent)"  />
        <StatCard label="Completed"value={done.length}     color="var(--success)" />
      </div>

      <BucketSection label="🔴 Overdue"   tasks={overdue}   color="#f43f5e" users={users} onTask={onTask} />
      <BucketSection label="🟠 Due Today" tasks={today}     color="#fb923c" users={users} onTask={onTask} />
      <BucketSection label="📋 Upcoming"  tasks={upcoming}  color="#5b8dee" users={users} onTask={onTask} />
      <BucketSection label="⏸ On Hold"   tasks={hold}      color="#a78bfa" users={users} onTask={onTask} defaultOpen={false} />
      <BucketSection label="✅ Completed" tasks={done}      color="#22c55e" users={users} onTask={onTask} defaultOpen={false} />
    </div>
  )
}

export const TeamPage = ({ users, tasks, user, onTask }) => {
  const [selected, setSelected] = useState(null)

  const team = useMemo(() => {
    if (user.role === 'partner') return users.filter(u => u.id !== user.id)
    const subs = getSubordinates(user.id, users)
    return users.filter(u => subs.includes(u.id))
  }, [users, user])

  const sorted = [...team].sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role])

  if (selected) return <MemberDetail member={selected} tasks={tasks} users={users} onTask={onTask} onBack={() => setSelected(null)} />

  return (
    <div className="fade-up" style={{ padding: '24px 28px' }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 20 }}>Team Overview</div>

      {/* Summary stats */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { label:'Total Members', value: team.length,                                                                              color:'var(--accent)'  },
          { label:'Team Overdue',  value: tasks.filter(t=>team.some(m=>m.id===t.assignedTo)&&getBucket(t)==='overdue').length,      color:'var(--danger)'  },
          { label:'Due Today',     value: tasks.filter(t=>team.some(m=>m.id===t.assignedTo)&&getBucket(t)==='today').length,        color:'var(--warn)'    },
          { label:'Completed',     value: tasks.filter(t=>team.some(m=>m.id===t.assignedTo)&&DONE_STATUSES.includes(t.status)).length, color:'var(--success)' },
        ].map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {sorted.map(m => (
          <MemberCard key={m.id} member={m} tasks={tasks} users={users} onClick={() => setSelected(m)} />
        ))}
      </div>
    </div>
  )
}
