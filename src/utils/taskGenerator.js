import { MONTHS } from '../constants.js'

const clampDate = (y, m, d) => {
  const dt = new Date(y, m, Math.min(d, new Date(y, m + 1, 0).getDate()))
  return dt.toISOString().split('T')[0]
}
const nextMon = (m, y) => ({ m:(m+1)%12, y:m===11?y+1:y })
const fyMon   = (i, fyS) => ({ m:(3+i)%12, y:i<9?fyS:fyS+1 })

export const generateTasks = (client, assignedTo, fy='2025-26') => {
  const tasks = []
  const fyS = parseInt(fy)
  const fyE = fyS + 1
  const now = new Date().toISOString()

  const task = (service, period, dueDate) => ({
    clientId:client.id, clientName:client.name, service, period, dueDate,
    assignedTo, status:'pending', statusNote:'', arn:'', ref:'',
    comments:[], history:[], fy, createdAt:now, updatedAt:now,
  })

  // GST
  if (client.gstApplicable) {
    if (client.gstFreq === 'monthly') {
      for (let i=0;i<12;i++) {
        const {m,y}=fyMon(i,fyS); const nm=nextMon(m,y)
        const period=`${MONTHS[m]} ${y}`
        tasks.push(task('GSTR-1',period,clampDate(nm.y,nm.m,11)))
        tasks.push(task('GSTR-2B Reconciliation',period,clampDate(nm.y,nm.m,15)))
        tasks.push(task('GSTR-3B',period,clampDate(nm.y,nm.m,20)))
      }
    } else {
      [{p:'Q1 (Apr–Jun)',dm:6,dy:fyS},{p:'Q2 (Jul–Sep)',dm:9,dy:fyS},
       {p:'Q3 (Oct–Dec)',dm:0,dy:fyE},{p:'Q4 (Jan–Mar)',dm:3,dy:fyE}].forEach(q=>{
        tasks.push(task('GSTR-1 (Quarterly)',q.p,clampDate(q.dy,q.dm,13)))
        tasks.push(task('GSTR-2B Reconciliation',q.p,clampDate(q.dy,q.dm,15)))
        tasks.push(task('GSTR-3B (Quarterly)',q.p,clampDate(q.dy,q.dm,22)))
      })
    }
    tasks.push(task('GSTR-9 Annual Return',`FY ${fy}`,clampDate(fyE,11,31)))
  }

  // TDS
  if (client.tdsApplicable) {
    for (let i=0;i<12;i++) {
      const {m,y}=fyMon(i,fyS); const nm=nextMon(m,y)
      tasks.push(task('TDS Payment',`${MONTHS[m]} ${y}`, m===2?clampDate(fyE,3,30):clampDate(nm.y,nm.m,7)))
    }
    [{p:'Q1 (Apr–Jun)',d:clampDate(fyS,6,31)},{p:'Q2 (Jul–Sep)',d:clampDate(fyS,9,31)},
     {p:'Q3 (Oct–Dec)',d:clampDate(fyE,0,31)},{p:'Q4 (Jan–Mar)',d:clampDate(fyE,4,31)}]
      .forEach(r=>tasks.push(task('TDS Return',r.p,r.d)))
  }

  // PT Maharashtra
  if (client.ptMH) {
    for (let i=0;i<12;i++) {
      const {m,y}=fyMon(i,fyS)
      tasks.push(task('PT Payment (Maharashtra)',`${MONTHS[m]} ${y}`,clampDate(y,m,31)))
    }
    tasks.push(task('PT Return (Maharashtra)',`FY ${fy}`,clampDate(fyE,2,31)))
  }

  // PT Karnataka
  if (client.ptKA) {
    tasks.push(task('PT Payment (Karnataka)',`FY ${fy}`,clampDate(fyS,3,30)))
    tasks.push(task('PT Return (Karnataka)',`FY ${fy}`,clampDate(fyS,3,30)))
  }

  // Income Tax
  if (client.itApplicable) {
    tasks.push(task('Income Tax Filing',`AY ${fyE}-${String(fyE+1).slice(2)}`,
      client.auditCase?clampDate(fyE,9,31):clampDate(fyE,6,31)))
  }

  // Advance Tax
  if (client.advanceTax) {
    [{p:'1st Instalment (15%)',d:clampDate(fyS,5,15)},{p:'2nd Instalment (45%)',d:clampDate(fyS,8,15)},
     {p:'3rd Instalment (75%)',d:clampDate(fyS,11,15)},{p:'4th Instalment (100%)',d:clampDate(fyE,2,15)}]
      .forEach(a=>tasks.push(task('Advance Tax',a.p,a.d)))
  }

  // Accounting
  if (client.accounting) {
    for (let i=0;i<12;i++) {
      const {m,y}=fyMon(i,fyS); const nm=nextMon(m,y)
      tasks.push(task('Accounting',`${MONTHS[m]} ${y}`,clampDate(nm.y,nm.m,28)))
    }
  }

  if (client.caCertificates) {
    tasks.push(task('CA Certificate',`FY ${fy}`,clampDate(fyE,2,31)))
  }

  return tasks
}
