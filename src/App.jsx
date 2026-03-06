import { useState, useMemo } from 'react'
import { useAuth }          from './hooks/useAuth.js'
import { useCollection }    from './hooks/useFirestore.js'
import { getBucket }        from './utils/dates.js'
import { Sidebar }          from './components/Sidebar.jsx'
import { TaskModal }        from './components/TaskModal.jsx'
import { Spinner }          from './components/UI.jsx'
import { LoginPage }        from './pages/LoginPage.jsx'
import { DashboardPage }    from './pages/DashboardPage.jsx'
import { TasksPage }        from './pages/TasksPage.jsx'
import { ClientsPage }      from './pages/ClientsPage.jsx'
import { AddClientPage }    from './pages/AddClientPage.jsx'
import { TeamPage }         from './pages/TeamPage.jsx'
import { UsersPage }        from './pages/UsersPage.jsx'
import { DashboardWorkload } from './pages/DashboardWorkload.jsx'
import { DashboardGST }     from './pages/DashboardGST.jsx'
import { DashboardIT }      from './pages/DashboardIT.jsx'
import { AuditLogPage }     from './pages/AuditLogPage.jsx'

export default function App() {
  const { firebaseUser, userProfile, login, logout, createUser, loading:authLoading } = useAuth()
  const { data:users,   loading:ul } = useCollection('users')
  const { data:clients, loading:cl } = useCollection('clients')
  const { data:tasks,   loading:tl } = useCollection('tasks')

  const [page, setPage]               = useState('dashboard')
  const [selectedTask, setSelectedTask] = useState(null)

  const myOverdue = useMemo(()=>{
    if (!userProfile) return 0
    return tasks.filter(t=>t.assignedTo===userProfile.id&&getBucket(t)==='overdue').length
  },[tasks,userProfile])

  if (authLoading) return (
    <div style={{ minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center' }}>
      <Spinner text="Starting ComplianceDesk…"/>
    </div>
  )
  if (!firebaseUser||!userProfile) return <LoginPage onLogin={login}/>
  if (ul||cl||tl) return (
    <div style={{ minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center' }}>
      <Spinner text="Loading workspace…"/>
    </div>
  )

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <DashboardPage tasks={tasks} user={userProfile} users={users} clients={clients} onTask={setSelectedTask}/>
      case 'tasks':     return <TasksPage     tasks={tasks} user={userProfile} users={users} clients={clients} onTask={setSelectedTask}/>
      case 'clients':   return <ClientsPage   clients={clients} users={users} tasks={tasks} currentUser={userProfile} onAdd={()=>setPage('add_client')} onTask={setSelectedTask}/>
      case 'add_client':return <AddClientPage users={users} currentUser={userProfile} onBack={()=>setPage('clients')} onSuccess={()=>setPage('clients')}/>
      case 'team':      return <TeamPage      users={users} tasks={tasks} clients={clients} user={userProfile} onTask={setSelectedTask}/>
      case 'workload':  return <DashboardWorkload users={users} tasks={tasks} clients={clients} user={userProfile} onTask={setSelectedTask}/>
      case 'gst':       return <DashboardGST  clients={clients} tasks={tasks} users={users} onTask={setSelectedTask}/>
      case 'it':        return <DashboardIT   clients={clients} tasks={tasks} users={users} onTask={setSelectedTask}/>
      case 'audit':     return <AuditLogPage  users={users} clients={clients}/>
      case 'users':     return <UsersPage     users={users} currentUser={userProfile} createFirebaseUser={createUser}/>
      default:          return <DashboardPage tasks={tasks} user={userProfile} users={users} clients={clients} onTask={setSelectedTask}/>
    }
  }

  return (
    <div style={{ display:'flex',minHeight:'100vh',background:'var(--bg)' }}>
      <Sidebar page={page} setPage={setPage} user={userProfile} onLogout={logout} overdueCount={myOverdue}/>
      <div style={{ flex:1,overflow:'auto' }}>{renderPage()}</div>
      {selectedTask && (
        <TaskModal task={selectedTask} users={users} clients={clients} currentUser={userProfile} onClose={()=>setSelectedTask(null)}/>
      )}
    </div>
  )
}
