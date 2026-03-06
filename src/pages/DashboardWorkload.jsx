import { useState, useMemo } from 'react'
import { ROLES, ROLE_CLR, ROLE_ORDER, DONE_STATUSES } from '../constants.js'
import { getBucket } from '../utils/dates.js'
import { getSubordinates } from '../utils/hierarchy.js'
import { Avatar, StatCard, BucketSection } from '../components/UI.jsx'

const Bar = ({ value, max, color }) => (
  <div style={{ height:6,background:'var(--surface3)',borderRadius:3,overflow:'hidden',flex:1 }}>
    <div style={{ height:'100%',width:`${max?Math.round((value/max)*100):0}%`,background:color,borderRadius:3,transition:'width 0.4s ease' }}/>
  </div>
)

const MemberCard = ({ member, tasks, users, onClick }) => {
  const mt      = tasks.filter(t => t.assignedTo === member.id)
  const overdue = mt.filter(t => getBucket(t) === 'overdue').length
  const today   = mt.filter(t => getBucket(t) === 'today').length
  const soon    = mt.filter(t => ['soon3','soon7'].includes(getBucket(t))).length
  const done    = mt.filter(t => DONE_STATUSES.includes(t.status)).length
  const active  = mt.filter(t => !DONE_STATUSES.includes(t.status) && t.status !== 'dropped').length
  const total   = mt.length
  const pct     = total ? Math.round((done / total) * 100) : 0
  const mgr     = users.find(u => u.id === member.reportsTo)

  return (
    <div onClick={onClick} className="hover-lift card" style={{ padding:'16px 18px', cursor:'pointer' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
        <Avatar name={member.name} init={member.init} role={member.role} sz={38}/>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:14, color:'var(--text)' }}>{member.name}</div>
          <div style={{ fontSize:11, color:ROLE_CLR[member.role], fontWeight:600 }}>
            {ROLES[member.role]}{mgr ? ` · Reports to ${mgr.name.split(' ')[0]}` : ''}
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:22, fontWeight:800, color:'var(--text)' }}>{active}</div>
          <div style={{ fontSize:10, color:'var(--text3)' }}>active</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
        <Bar value={done} max={total} color='#22c55e'/>
        <span style={{ fontSize:11, color:'var(--text3)', whiteSpace:'nowrap' }}>{pct}% done</span>
      </div>

      {/* Stat row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
        {[
          { v:overdue, l:'Overdue', c:'#f43f5e' },
          { v:today,   l:'Today',   c:'#fb923c' },
          { v:soon,    l:'This Week',c:'#f59e0b' },
          { v:done,    l:'Done',    c:'#22c55e' },
        ].map(s => (
          <div key={s.l} style={{ background:'var(--surface2)', borderRadius:8, padding:'8px', textAlign:'center' }}>
            <div style={{ fontWeight:700, color:s.c, fontSize:16 }}>{s.v}</div>
            <div style={{ fontSize:10, color:'var(--text3)' }}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const MemberDrill = ({ member, tasks, users, clients, onTask, onBack }) => {
  const mt      = tasks.filter(t => t.assignedTo === member.id)
  const overdue = mt.filter(t => getBucket(t) === 'overdue')
  const today   = mt.filter(t => getBucket(t) === 'today')
  const upcoming= mt.filter(t => ['soon3','soon7','others'].includes(getBucket(t)))
  const done    = mt.filter(t => DONE_STATUSES.includes(t.status))
  const hold    = mt.filter(t => ['hold','dropped'].includes(getBucket(t)))

  // Service breakdown
  const services = [...new Set(mt.map(t=>t.service))].sort()
  const svcStats = services.map(svc => {
    const st = mt.filter(t=>t.service===svc)
    return { svc, total:st.length, done:st.filter(t=>DONE_STATUSES.includes(t.status)).length, overdue:st.filter(t=>getBucket(t)==='overdue').length }
  })

  return (
    <div className="fade-up" style={{ padding:'24px 28px', maxWidth:1000 }}>
      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom:16 }}>← Back to Team</button>
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
        <Avatar name={member.name} init={member.init} role={member.role} sz={44}/>
        <div>
          <div style={{ fontSize:20, fontWeight:800, color:'var(--text)' }}>{member.name}</div>
          <div style={{ fontSize:12, color:ROLE_CLR[member.role], fontWeight:600 }}>{ROLES[member.role]} · {member.dept}</div>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom:20 }}>
        <StatCard label="Overdue"  value={overdue.length}  color="var(--danger)"/>
        <StatCard label="Due Today"value={today.length}    color="var(--warn)"/>
        <StatCard label="Upcoming" value={upcoming.length} color="var(--accent)"/>
        <StatCard label="Completed"value={done.length}     color="var(--success)"/>
      </div>

      {/* Service breakdown table */}
      <div className="card" style={{ padding:'14px 18px', marginBottom:20 }}>
        <div style={{ fontWeight:700, fontSize:13, color:'var(--text)', marginBottom:12 }}>Workload by Service</div>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 3fr', gap:8, padding:'6px 0', borderBottom:'1px solid var(--border)', marginBottom:8 }}>
          {['Service','Total','Done','Overdue','Progress'].map(h=><div key={h} style={{ fontSize:11,fontWeight:600,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.04em' }}>{h}</div>)}
        </div>
        {svcStats.map(s=>(
          <div key={s.svc} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 3fr', gap:8, padding:'6px 0', borderBottom:'1px solid var(--border)', alignItems:'center' }}>
            <div style={{ fontSize:13, color:'var(--text)' }}>{s.svc}</div>
            <div style={{ fontSize:13, color:'var(--text2)' }}>{s.total}</div>
            <div style={{ fontSize:13, color:'var(--success)' }}>{s.done}</div>
            <div style={{ fontSize:13, color: s.overdue>0?'var(--danger)':'var(--text3)' }}>{s.overdue}</div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Bar value={s.done} max={s.total} color='#22c55e'/>
              <span style={{ fontSize:11, color:'var(--text3)', width:34 }}>{s.total?Math.round((s.done/s.total)*100):0}%</span>
            </div>
          </div>
        ))}
      </div>

      <BucketSection label="🔴 Overdue"   tasks={overdue}  color="#f43f5e" users={users} clients={clients} onTask={onTask}/>
      <BucketSection label="🟠 Due Today" tasks={today}    color="#fb923c" users={users} clients={clients} onTask={onTask}/>
      <BucketSection label="📋 Upcoming"  tasks={upcoming} color="#5b8dee" users={users} clients={clients} onTask={onTask}/>
      <BucketSection label="⏸ On Hold"   tasks={hold}     color="#a78bfa" users={users} clients={clients} onTask={onTask} defaultOpen={false}/>
      <BucketSection label="✅ Completed" tasks={done}     color="#22c55e" users={users} clients={clients} onTask={onTask} defaultOpen={false}/>
    </div>
  )
}

export const DashboardWorkload = ({ users, tasks, clients, user, onTask }) => {
  const [selected, setSelected] = useState(null)

  const team = useMemo(() => {
    if (user.role === 'partner') return users.filter(u => u.id !== user.id)
    const subs = getSubordinates(user.id, users)
    return users.filter(u => subs.includes(u.id))
  }, [users, user])

  const sorted = [...team].sort((a,b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role])

  if (selected) return <MemberDrill member={selected} tasks={tasks} users={users} clients={clients} onTask={onTask} onBack={()=>setSelected(null)}/>

  const teamTasks = tasks.filter(t => team.some(m => m.id === t.assignedTo))

  return (
    <div className="fade-up" style={{ padding:'24px 28px' }}>
      <div style={{ fontSize:20, fontWeight:800, color:'var(--text)', marginBottom:6 }}>Team Workload</div>
      <div style={{ fontSize:13, color:'var(--text2)', marginBottom:20 }}>Click any team member to drill into their tasks.</div>

      <div className="grid-4" style={{ marginBottom:24 }}>
        <StatCard label="Team Members"  value={team.length}                                                                            color="var(--accent)"/>
        <StatCard label="Total Overdue" value={teamTasks.filter(t=>getBucket(t)==='overdue').length}                                   color="var(--danger)"/>
        <StatCard label="Due Today"     value={teamTasks.filter(t=>getBucket(t)==='today').length}                                     color="var(--warn)"/>
        <StatCard label="Done This FY"  value={teamTasks.filter(t=>DONE_STATUSES.includes(t.status)).length}                           color="var(--success)"/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:12 }}>
        {sorted.map(m => (
          <MemberCard key={m.id} member={m} tasks={tasks} users={users} onClick={()=>setSelected(m)}/>
        ))}
      </div>
    </div>
  )
}
