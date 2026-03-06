import { useState, useMemo } from 'react'
import { getServiceStatuses, KANBAN_COLS, DONE_STATUSES, getStatusObj } from '../constants.js'
import { getBucket, fmtDate } from '../utils/dates.js'
import { getVisibleUserIds } from '../utils/hierarchy.js'
import { TaskRow, DueBadge } from '../components/UI.jsx'

export const TasksPage = ({ tasks, user, users, clients, onTask }) => {
  const [view,        setView]        = useState('list')
  const [fClient,     setFClient]     = useState('')
  const [fService,    setFService]    = useState('')
  const [fStatus,     setFStatus]     = useState('')
  const [fAssignee,   setFAssignee]   = useState('')
  const [search,      setSearch]      = useState('')

  const visible = useMemo(()=>{
    const ids = getVisibleUserIds(user,users)
    let t = tasks.filter(t=>ids.includes(t.assignedTo))
    if (fClient)   t = t.filter(x=>x.clientId===fClient)
    if (fService)  t = t.filter(x=>x.service===fService)
    if (fStatus)   t = t.filter(x=>x.status===fStatus)
    if (fAssignee) t = t.filter(x=>x.assignedTo===fAssignee)
    if (search)    t = t.filter(x=>`${x.service} ${x.clientName} ${x.period}`.toLowerCase().includes(search.toLowerCase()))
    return t.sort((a,b)=>new Date(a.dueDate)-new Date(b.dueDate))
  },[tasks,user,users,fClient,fService,fStatus,fAssignee,search])

  const services     = [...new Set(tasks.map(t=>t.service))].sort()
  const visibleUsers = users.filter(u=>getVisibleUserIds(user,users).includes(u.id))
  const hasFilters   = fClient||fService||fStatus||fAssignee||search

  const statusesForService = fService ? getServiceStatuses(fService) : []

  return (
    <div className="fade-up" style={{ padding:'24px 28px' }}>
      <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:20 }}>
        <div style={{ fontSize:20,fontWeight:800,color:'var(--text)',flex:1 }}>All Tasks</div>
        <div style={{ display:'flex',gap:4,background:'var(--surface2)',borderRadius:8,padding:3,border:'1px solid var(--border)' }}>
          {[['list','≡ List'],['kanban','⊞ Kanban']].map(([v,l])=>(
            <button key={v} onClick={()=>setView(v)} style={{ padding:'6px 14px',borderRadius:6,fontSize:13,fontWeight:500,cursor:'pointer',border:view===v?'1px solid var(--border2)':'none',background:view===v?'var(--surface3)':'transparent',color:view===v?'var(--text)':'var(--text2)' }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'1.5fr 1fr 1fr 1fr 1fr',gap:8,marginBottom:8 }}>
        <input placeholder="🔍  Search tasks, clients…" value={search} onChange={e=>setSearch(e.target.value)}/>
        <select value={fClient} onChange={e=>setFClient(e.target.value)}>
          <option value="">All Clients</option>
          {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={fService} onChange={e=>{setFService(e.target.value);setFStatus('')}}>
          <option value="">All Services</option>
          {services.map(x=><option key={x} value={x}>{x}</option>)}
        </select>
        <select value={fStatus} onChange={e=>setFStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {(fService ? statusesForService : []).map(x=><option key={x.v} value={x.v}>{x.l}</option>)}
        </select>
        <select value={fAssignee} onChange={e=>setFAssignee(e.target.value)}>
          <option value="">All Members</option>
          {visibleUsers.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>

      <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:16 }}>
        <div style={{ fontSize:12,color:'var(--text3)' }}>{visible.length} tasks</div>
        {hasFilters && <button className="btn btn-ghost btn-sm" onClick={()=>{setFClient('');setFService('');setFStatus('');setFAssignee('');setSearch('')}}>✕ Clear</button>}
      </div>

      {view==='list' && (
        <>
          <div style={{ display:'grid',gridTemplateColumns:'2fr 1.2fr 1fr 150px 110px 20px',gap:12,padding:'4px 16px 8px' }}>
            {['Task / Client','Due Date','Assigned To','Status','Urgency',''].map((h,i)=>(
              <div key={i} style={{ fontSize:11,fontWeight:600,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.05em' }}>{h}</div>
            ))}
          </div>
          {visible.map(t=><TaskRow key={t.id} task={t} users={users} clients={clients} onClick={()=>onTask(t)}/>)}
          {!visible.length && <div style={{ textAlign:'center',padding:40,color:'var(--text3)' }}>No tasks match your filters.</div>}
        </>
      )}

      {view==='kanban' && (
        <div style={{ display:'flex',gap:12,overflowX:'auto',paddingBottom:12 }}>
          {KANBAN_COLS.map(col=>{
            const colTasks = visible.filter(t=>col.statuses.includes(t.status))
            return (
              <div key={col.key} style={{ minWidth:260,flex:'0 0 260px',background:'var(--surface2)',borderRadius:12,border:'1px solid var(--border)' }}>
                <div style={{ padding:'12px 14px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:8 }}>
                  <div style={{ width:8,height:8,borderRadius:'50%',background:col.color }}/>
                  <span style={{ fontWeight:700,fontSize:13,color:'var(--text)' }}>{col.label}</span>
                  <span className="chip" style={{ background:`${col.color}20`,color:col.color,marginLeft:'auto' }}>{colTasks.length}</span>
                </div>
                <div style={{ padding:'10px',display:'flex',flexDirection:'column',gap:6,maxHeight:600,overflow:'auto' }}>
                  {colTasks.map(t=>{
                    const st = getStatusObj(t.service,t.status)
                    return (
                      <div key={t.id} onClick={()=>onTask(t)} className="hover-lift" style={{ background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,padding:'10px 12px',cursor:'pointer' }}>
                        <div style={{ fontWeight:600,fontSize:12,color:'var(--text)',marginBottom:3 }}>{t.service}</div>
                        <div style={{ fontSize:11,color:'var(--text2)',marginBottom:3 }}>{t.clientName}</div>
                        <div style={{ fontSize:11,color:'var(--text3)',marginBottom:6 }}>{t.period}</div>
                        <span className="chip" style={{ background:st.bg,color:st.c,border:`1px solid ${st.c}35`,fontSize:10 }}>{st.l}</span>
                      </div>
                    )
                  })}
                  {!colTasks.length && <div style={{ fontSize:12,color:'var(--text3)',textAlign:'center',padding:'16px 0' }}>Empty</div>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
