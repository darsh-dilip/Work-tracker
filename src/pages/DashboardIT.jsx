import { useState, useMemo } from 'react'
import { getStatusObj, DONE_STATUSES } from '../constants.js'
import { getBucket, fmtDate } from '../utils/dates.js'

const IT_SERVICES = ['Income Tax Filing','Accounting','CA Certificate','GSTR-9 Annual Return','Advance Tax']

const STAGE_ORDER = [
  'pending','data_pending','data_not_received','documents_received','data_received',
  'accounting_done','checkers_query','audited','genius_prepared','fs_sent',
  'payment_pending','client_approval','tax_payment_pending','tax_payment_done',
  'confirmed','payment_made','itr_filed','filed','refund_expected','filed_late',
  'revision_required','not_to_be_filed','not_responding','on_hold','customer_refused',
]

const funnelStages = [
  { label:'Data Pending',      statuses:['pending','data_pending','data_not_received'],           color:'#f59e0b' },
  { label:'Data Received',     statuses:['documents_received','data_received'],                   color:'#38bdf8' },
  { label:'In Progress',       statuses:['accounting_done','checkers_query','audited','genius_prepared','fs_sent','in_progress'], color:'#5b8dee' },
  { label:'Awaiting Approval', statuses:['confirmed','client_approval'],                         color:'#818cf8' },
  { label:'Payment / Tax Due', statuses:['payment_pending','tax_payment_pending'],               color:'#fb923c' },
  { label:'Filed ✓',           statuses:['itr_filed','filed','refund_expected','filed_late','not_to_be_filed','payment_made','tax_payment_done'], color:'#22c55e' },
  { label:'Issues',            statuses:['revision_required','not_responding','on_hold','customer_refused','defective_notice'], color:'#f43f5e' },
]

export const DashboardIT = ({ clients, tasks, users, onTask }) => {
  const [filterUser,    setFilterUser]    = useState('')
  const [filterService, setFilterService] = useState('Income Tax Filing')
  const [search,        setSearch]        = useState('')
  const [sortBy,        setSortBy]        = useState('stage')

  const itClients = clients.filter(c => c.itApplicable || c.accounting || c.advanceTax)

  const itTasks = useMemo(() =>
    tasks.filter(t => IT_SERVICES.includes(t.service) &&
      (filterService ? t.service === filterService : true) &&
      (filterUser    ? t.assignedTo === filterUser  : true) &&
      (search        ? t.clientName.toLowerCase().includes(search.toLowerCase()) : true)
    )
  , [tasks, filterService, filterUser, search])

  // Group by client
  const byClient = useMemo(() => {
    const map = {}
    itTasks.forEach(t => {
      if (!map[t.clientId]) map[t.clientId] = { clientId:t.clientId, clientName:t.clientName, tasks:[] }
      map[t.clientId].tasks.push(t)
    })
    return Object.values(map)
  }, [itTasks])

  // Funnel counts
  const funnelCounts = funnelStages.map(fs => ({
    ...fs,
    count: itTasks.filter(t => fs.statuses.includes(t.status)).length,
  }))
  const totalTasks = itTasks.length

  const assignees = [...new Map(
    tasks.filter(t=>IT_SERVICES.includes(t.service)).map(t=>{
      const u = users.find(x=>x.id===t.assignedTo)
      return u ? [u.id,u] : null
    }).filter(Boolean)
  ).values()]

  const stageIndex = status => {
    const i = STAGE_ORDER.indexOf(status)
    return i === -1 ? 99 : i
  }

  const sorted = useMemo(() => {
    return [...byClient].sort((a,b) => {
      if (sortBy === 'stage') {
        const aMin = Math.min(...a.tasks.map(t=>stageIndex(t.status)))
        const bMin = Math.min(...b.tasks.map(t=>stageIndex(t.status)))
        return aMin - bMin
      }
      if (sortBy === 'overdue') {
        const aOv = a.tasks.filter(t=>getBucket(t)==='overdue').length
        const bOv = b.tasks.filter(t=>getBucket(t)==='overdue').length
        return bOv - aOv
      }
      return a.clientName.localeCompare(b.clientName)
    })
  }, [byClient, sortBy])

  return (
    <div className="fade-up" style={{ padding:'24px 28px' }}>
      <div style={{ fontSize:20, fontWeight:800, color:'var(--text)', marginBottom:4 }}>Income Tax & Accounts Dashboard</div>
      <div style={{ fontSize:13, color:'var(--text2)', marginBottom:20 }}>ITR · Accounting · Advance Tax · CA Certificates — all clients, all stages</div>

      {/* Funnel */}
      <div style={{ display:'flex', gap:3, marginBottom:24, height:64, alignItems:'flex-end' }}>
        {funnelCounts.map((f,i) => {
          const pct = totalTasks ? Math.max(8, (f.count/totalTasks)*100) : 8
          return (
            <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <div style={{ fontSize:12, fontWeight:700, color:f.color }}>{f.count}</div>
              <div style={{ width:'100%', height:`${pct}%`, background:`${f.color}30`, border:`1px solid ${f.color}50`,
                borderRadius:'4px 4px 0 0', minHeight:8, transition:'height 0.4s ease' }}/>
              <div style={{ fontSize:9, color:'var(--text3)', textAlign:'center', lineHeight:1.2 }}>{f.label}</div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
        <input placeholder="🔍 Search client…" value={search} onChange={e=>setSearch(e.target.value)} style={{ width:200 }}/>
        <select value={filterService} onChange={e=>setFilterService(e.target.value)} style={{ width:200 }}>
          <option value="">All IT Services</option>
          {IT_SERVICES.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterUser} onChange={e=>setFilterUser(e.target.value)} style={{ width:180 }}>
          <option value="">All Team Members</option>
          {assignees.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ width:160 }}>
          <option value="stage">Sort: By Stage</option>
          <option value="overdue">Sort: Overdue First</option>
          <option value="name">Sort: By Name</option>
        </select>
      </div>

      <div style={{ fontSize:12, color:'var(--text3)', marginBottom:12 }}>{sorted.length} clients · {itTasks.length} tasks</div>

      {/* Client cards */}
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {sorted.map(({ clientId, clientName, tasks:ct }) => {
          const assignee = users.find(u=>u.id===ct[0]?.assignedTo)
          const client   = clients.find(c=>c.id===clientId)
          const overdue  = ct.filter(t=>getBucket(t)==='overdue').length
          return (
            <div key={clientId} className="card" style={{ padding:'14px 18px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14, color:'var(--text)' }}>{clientName}</div>
                  <div style={{ fontSize:11, color:'var(--text3)' }}>
                    {client?.constitution} · {assignee?.name||'Unassigned'}
                    {overdue > 0 && <span style={{ color:'var(--danger)', marginLeft:8, fontWeight:700 }}>⚠ {overdue} overdue</span>}
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {ct.map(t => {
                  const st  = getStatusObj(t.service, t.status)
                  const bkt = getBucket(t)
                  return (
                    <div key={t.id} onClick={()=>onTask(t)} className="hover-lift" style={{
                      background: st.bg, border:`1px solid ${st.c}40`,
                      borderRadius:8, padding:'8px 12px', cursor:'pointer', minWidth:160,
                      outline: bkt==='overdue' ? `2px solid #f43f5e` : 'none',
                    }}>
                      <div style={{ fontSize:11, color:'var(--text3)', marginBottom:2 }}>{t.service}</div>
                      <div style={{ fontSize:12, fontWeight:700, color:st.c }}>{st.l}</div>
                      {t.arn && <div style={{ fontSize:10, color:'var(--success)', fontFamily:'var(--mono)', marginTop:2 }}>ARN: {t.arn}</div>}
                      <div style={{ fontSize:10, color:'var(--text3)', marginTop:2 }}>Due: {fmtDate(t.dueDate)}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
        {!sorted.length && <div style={{ textAlign:'center', padding:40, color:'var(--text3)' }}>No IT / Accounting tasks found.</div>}
      </div>
    </div>
  )
}
