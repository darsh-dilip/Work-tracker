import { useState, useMemo } from 'react'
import { MONTHS, DONE_STATUSES, getStatusObj } from '../constants.js'
import { getBucket } from '../utils/dates.js'

// GST services to show in the matrix
const GST_SERVICES = ['GSTR-1','GSTR-1 (Quarterly)','GSTR-2B Reconciliation','GSTR-3B','GSTR-3B (Quarterly)']
const GST_SERVICES_SHORT = { 'GSTR-1':'G1', 'GSTR-1 (Quarterly)':'G1Q', 'GSTR-2B Reconciliation':'2B', 'GSTR-3B':'3B', 'GSTR-3B (Quarterly)':'3BQ' }

// Map a period string to a month index (0=Jan...11=Dec)
const periodToMonthIdx = period => {
  const m = period.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i)
  if (!m) return null
  return MONTHS.indexOf(m[0].slice(0,1).toUpperCase()+m[0].slice(1,3).toLowerCase())
}

const StatusCell = ({ task, onClick }) => {
  if (!task) return <div style={{ height:28, borderRadius:4, background:'var(--surface3)', opacity:0.3 }}/>
  const st  = getStatusObj(task.service, task.status)
  const bkt = getBucket(task)
  const pulse = bkt === 'overdue'
  return (
    <div onClick={()=>onClick(task)} title={`${task.service} — ${st.l}`} style={{
      height:28, borderRadius:4, background:st.bg, border:`1px solid ${st.c}40`,
      cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:9, fontWeight:700, color:st.c, letterSpacing:'0.03em',
      outline: pulse ? `2px solid #f43f5e` : 'none',
      transition:'transform 0.1s',
    }}
    onMouseEnter={e=>e.currentTarget.style.transform='scale(1.05)'}
    onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
    >
      {st.l.length > 10 ? st.l.slice(0,8)+'…' : st.l}
    </div>
  )
}

export const DashboardGST = ({ clients, tasks, users, onTask }) => {
  const [filterUser,   setFilterUser]   = useState('')
  const [filterFreq,   setFilterFreq]   = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [search,       setSearch]       = useState('')
  const [view,         setView]         = useState('matrix') // 'matrix' | 'list'

  // FY months in order: Apr=3 … Mar=2 next year
  const FY_MONTHS = useMemo(() => {
    const base = [3,4,5,6,7,8,9,10,11,0,1,2]
    return base.map(m => ({ idx:m, label:MONTHS[m] }))
  }, [])

  const gstClients = useMemo(() =>
    clients.filter(c => c.gstApplicable && (c.clientStatus||'active') !== 'discontinued')
  , [clients])

  const filtered = useMemo(() => {
    let list = gstClients
    if (filterFreq)   list = list.filter(c => c.gstFreq === filterFreq)
    if (filterUser)   list = list.filter(c => c.assignedTo === filterUser)
    if (search)       list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    return list
  }, [gstClients, filterFreq, filterUser, search])

  // Build task lookup: clientId → service → monthIdx → task
  const taskMap = useMemo(() => {
    const map = {}
    tasks.filter(t => GST_SERVICES.includes(t.service)).forEach(t => {
      if (!map[t.clientId]) map[t.clientId] = {}
      if (!map[t.clientId][t.service]) map[t.clientId][t.service] = {}
      const mi = periodToMonthIdx(t.period)
      if (mi !== null) map[t.clientId][t.service][mi] = t
    })
    return map
  }, [tasks])

  // Summary stats
  const gstTasks  = tasks.filter(t => GST_SERVICES.includes(t.service))
  const totalFiled   = gstTasks.filter(t => ['filed','nil_filed','iff_filed','no_iff','delayed_filing'].includes(t.status)).length
  const totalPending = gstTasks.filter(t => !DONE_STATUSES.includes(t.status)).length
  const totalOverdue = gstTasks.filter(t => getBucket(t) === 'overdue').length
  const totalNotResp = gstTasks.filter(t => t.status === 'not_responding').length

  const assignees = [...new Map(gstClients.map(c => {
    const u = users.find(x => x.id === c.assignedTo)
    return u ? [u.id, u] : null
  }).filter(Boolean)).values()]

  return (
    <div className="fade-up" style={{ padding:'24px 28px' }}>
      <div style={{ fontSize:20, fontWeight:800, color:'var(--text)', marginBottom:4 }}>GST Dashboard</div>
      <div style={{ fontSize:13, color:'var(--text2)', marginBottom:20 }}>GSTR-1 · GSTR-2B Reconciliation · GSTR-3B — all clients, all months</div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom:20 }}>
        <div className="card" style={{ padding:'14px 16px' }}>
          <div style={{ fontSize:24, fontWeight:800, color:'#22c55e' }}>{totalFiled}</div>
          <div style={{ fontSize:12, fontWeight:600, color:'var(--text)', marginTop:2 }}>Filed / Done</div>
        </div>
        <div className="card" style={{ padding:'14px 16px' }}>
          <div style={{ fontSize:24, fontWeight:800, color:'var(--accent)' }}>{totalPending}</div>
          <div style={{ fontSize:12, fontWeight:600, color:'var(--text)', marginTop:2 }}>Pending</div>
        </div>
        <div className="card" style={{ padding:'14px 16px' }}>
          <div style={{ fontSize:24, fontWeight:800, color:'var(--danger)' }}>{totalOverdue}</div>
          <div style={{ fontSize:12, fontWeight:600, color:'var(--text)', marginTop:2 }}>Overdue</div>
        </div>
        <div className="card" style={{ padding:'14px 16px' }}>
          <div style={{ fontSize:24, fontWeight:800, color:'#f59e0b' }}>{totalNotResp}</div>
          <div style={{ fontSize:12, fontWeight:600, color:'var(--text)', marginTop:2 }}>Not Responding</div>
        </div>
      </div>

      {/* Filters + view toggle */}
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
        <input placeholder="🔍 Search client…" value={search} onChange={e=>setSearch(e.target.value)} style={{ width:200 }}/>
        <select value={filterFreq} onChange={e=>setFilterFreq(e.target.value)} style={{ width:160 }}>
          <option value="">Monthly + Quarterly</option>
          <option value="monthly">Monthly only</option>
          <option value="quarterly">Quarterly only</option>
        </select>
        <select value={filterUser} onChange={e=>setFilterUser(e.target.value)} style={{ width:180 }}>
          <option value="">All Team Members</option>
          {assignees.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <div style={{ marginLeft:'auto', display:'flex', gap:4 }}>
          {[['matrix','⊞ Matrix'],['list','≡ List']].map(([v,l])=>(
            <button key={v} onClick={()=>setView(v)} style={{
              padding:'6px 12px', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer',
              background:view===v?'var(--surface3)':'transparent', color:view===v?'var(--text)':'var(--text3)',
              border:view===v?'1px solid var(--border2)':'1px solid transparent',
            }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ fontSize:12, color:'var(--text3)', marginBottom:12 }}>{filtered.length} GST clients</div>

      {/* MATRIX VIEW */}
      {view === 'matrix' && (
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'separate', borderSpacing:'0 4px', fontSize:12 }}>
            <thead>
              <tr>
                <th style={{ padding:'8px 12px', textAlign:'left', color:'var(--text3)', fontWeight:600, fontSize:11, textTransform:'uppercase', position:'sticky', left:0, background:'var(--bg)', zIndex:2, minWidth:180 }}>Client</th>
                <th style={{ padding:'8px 6px', color:'var(--text3)', fontWeight:600, fontSize:10, minWidth:40 }}>Freq</th>
                {FY_MONTHS.map(m=>(
                  <th key={m.idx} style={{ padding:'6px 4px', color:'var(--text3)', fontWeight:600, fontSize:10, textAlign:'center', minWidth:90 }} colSpan={3}>
                    {m.label}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:2, marginTop:4 }}>
                      {['G1','2B','3B'].map(s=><div key={s} style={{ fontSize:8, color:'var(--text3)', textAlign:'center' }}>{s}</div>)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(client => {
                const cm = taskMap[client.id] || {}
                const assignee = users.find(u=>u.id===client.assignedTo)
                const svcG1 = client.gstFreq==='monthly' ? 'GSTR-1' : 'GSTR-1 (Quarterly)'
                const svcG3 = client.gstFreq==='monthly' ? 'GSTR-3B' : 'GSTR-3B (Quarterly)'
                return (
                  <tr key={client.id}>
                    <td style={{ padding:'6px 12px', position:'sticky', left:0, background:'var(--bg)', zIndex:1 }}>
                      <div style={{ fontWeight:600, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:160 }}>{client.name}</div>
                      <div style={{ fontSize:10, color:'var(--text3)' }}>{assignee?.name?.split(' ')[0]}</div>
                    </td>
                    <td style={{ padding:'6px 4px', textAlign:'center' }}>
                      <span style={{ fontSize:9, color:client.gstFreq==='monthly'?'#38bdf8':'#a78bfa', fontWeight:700 }}>
                        {client.gstFreq==='monthly'?'M':'Q'}
                      </span>
                    </td>
                    {FY_MONTHS.map(m=>(
                      [svcG1, 'GSTR-2B Reconciliation', svcG3].map(svc=>(
                        <td key={`${m.idx}-${svc}`} style={{ padding:'3px 2px' }}>
                          <StatusCell task={cm[svc]?.[m.idx]} onClick={onTask}/>
                        </td>
                      ))
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Legend */}
          <div style={{ display:'flex', gap:12, marginTop:16, flexWrap:'wrap', padding:'12px 0' }}>
            <div style={{ fontSize:11, color:'var(--text3)', fontWeight:600 }}>LEGEND:</div>
            {[
              {l:'Filed/Done',c:'#22c55e'},{l:'Nil Filed',c:'#34d399'},{l:'Delayed Filing',c:'#fb923c'},
              {l:'Pending',c:'#8892b0'},{l:'Data Pending',c:'#f59e0b'},{l:'Not Responding',c:'#f43f5e'},
              {l:'Payment Pending',c:'#fb923c'},{l:'Suspended',c:'#a78bfa'},
            ].map(s=>(
              <div key={s.l} style={{ display:'flex', alignItems:'center', gap:4 }}>
                <div style={{ width:10, height:10, borderRadius:2, background:`${s.c}30`, border:`1px solid ${s.c}` }}/>
                <span style={{ fontSize:10, color:'var(--text3)' }}>{s.l}</span>
              </div>
            ))}
            <div style={{ fontSize:10, color:'var(--text3)', marginLeft:8 }}>| G1=GSTR-1 · 2B=GSTR-2B Recon · 3B=GSTR-3B</div>
          </div>
        </div>
      )}

      {/* LIST VIEW — grouped by status */}
      {view === 'list' && (
        <div>
          {[
            { label:'🔴 Overdue', filter: t=>getBucket(t)==='overdue', color:'#f43f5e' },
            { label:'🟠 Due Today', filter: t=>getBucket(t)==='today', color:'#fb923c' },
            { label:'⚠️ Not Responding', filter: t=>t.status==='not_responding', color:'#f43f5e' },
            { label:'💰 Payment Pending', filter: t=>t.status==='payment_pending', color:'#fb923c' },
            { label:'📋 Data Pending', filter: t=>t.status==='data_pending', color:'#f59e0b' },
            { label:'✅ Filed / Done', filter: t=>DONE_STATUSES.includes(t.status), color:'#22c55e' },
          ].map(grp => {
            const grpTasks = gstTasks.filter(t =>
              grp.filter(t) && filtered.some(c=>c.id===t.clientId)
            )
            if (!grpTasks.length) return null
            return (
              <div key={grp.label} style={{ marginBottom:20 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                  <div style={{ width:3, height:16, borderRadius:2, background:grp.color }}/>
                  <span style={{ fontWeight:700, fontSize:14, color:'var(--text)' }}>{grp.label}</span>
                  <span className="chip" style={{ background:`${grp.color}20`, color:grp.color, border:`1px solid ${grp.color}30` }}>{grpTasks.length}</span>
                </div>
                {grpTasks.slice(0,50).map(t => {
                  const st = getStatusObj(t.service, t.status)
                  return (
                    <div key={t.id} onClick={()=>onTask(t)} className="hover-lift" style={{
                      display:'grid', gridTemplateColumns:'2fr 1.5fr 120px 100px', gap:12,
                      padding:'10px 14px', background:'var(--surface2)', borderRadius:8,
                      border:'1px solid var(--border)', cursor:'pointer', marginBottom:4, alignItems:'center',
                    }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:13, color:'var(--text)' }}>{t.clientName}</div>
                        <div style={{ fontSize:11, color:'var(--text2)' }}>{t.service} · {t.period}</div>
                      </div>
                      <div style={{ fontSize:12, color:'var(--text2)' }}>{users.find(u=>u.id===t.assignedTo)?.name||'—'}</div>
                      <span className="chip" style={{ background:st.bg, color:st.c, border:`1px solid ${st.c}35` }}>{st.l}</span>
                      <div style={{ fontSize:12, color:'var(--text3)' }}>{t.dueDate||'—'}</div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
