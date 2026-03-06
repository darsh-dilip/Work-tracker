import { useState, useMemo } from 'react'
import { useAuth }        from './hooks/useAuth.js'
import { useCollection }  from './hooks/useFirestore.js'
import { getBucket }      from './utils/dates.js'
import { DONE_STATUSES }  from './constants.js'

import { Sidebar }        from './components/Sidebar.jsx'
import { TaskModal }      from './components/TaskModal.jsx'
import { Spinner }        from './components/UI.jsx'

import { LoginPage }      from './pages/LoginPage.jsx'
import { DashboardPage }  from './pages/DashboardPage.jsx'
import { TasksPage }      from './pages/TasksPage.jsx'
import { ClientsPage }    from './pages/ClientsPage.jsx'
import { AddClientPage }  from './pages/AddClientPage.jsx'
import { TeamPage }       from './pages/TeamPage.jsx'
import { UsersPage }      from './pages/UsersPage.jsx'

export default function App() {
  const { firebaseUser, userProfile, login, logout, createUser, loading: authLoading } = useAuth()

  // Real-time Firestore listeners
  const { data: users,   loading: usersLoading   } = useCollection('users')
  const { data: clients, loading: clientsLoading } = useCollection('clients')
  const { data: tasks,   loading: tasksLoading   } = useCollection('tasks')

  const [page,         setPage]         = useState('dashboard')
  const [selectedTask, setSelectedTask] = useState(null)

  // Overdue count for sidebar badge
  const myOverdue = useMemo(() => {
    if (!userProfile) return 0
    return tasks.filter(t => t.assignedTo === userProfile.id && getBucket(t) === 'overdue').length
  }, [tasks, userProfile])

  // ── Loading states ──
  if (authLoading) return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <Spinner text="Starting ComplianceDesk…" />
    </div>
  )

  // ── Not logged in ──
  if (!firebaseUser || !userProfile) return <LoginPage onLogin={login} />

  // ── Data loading ──
  const dataLoading = usersLoading || clientsLoading || tasksLoading
  if (dataLoading) return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <Spinner text="Loading your workspace…" />
    </div>
  )

  // ── Handle page changes & nav ──
  const handleSetPage = p => { setPage(p) }

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <DashboardPage tasks={tasks} user={userProfile} users={users} onTask={setSelectedTask} />

      case 'tasks':
        return <TasksPage tasks={tasks} user={userProfile} users={users} clients={clients} onTask={setSelectedTask} />

      case 'clients':
        return <ClientsPage clients={clients} users={users} tasks={tasks}
          onAdd={() => setPage('add_client')} onTask={setSelectedTask} />

      case 'add_client':
        return <AddClientPage users={users} onBack={() => setPage('clients')} onSuccess={() => setPage('clients')} />

      case 'team':
        return <TeamPage users={users} tasks={tasks} user={userProfile} onTask={setSelectedTask} />

      case 'users':
        return <UsersPage users={users} currentUser={userProfile} createFirebaseUser={createUser} />

      default:
        return <DashboardPage tasks={tasks} user={userProfile} users={users} onTask={setSelectedTask} />
    }
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)' }}>
      <Sidebar
        page={page}
        setPage={handleSetPage}
        user={userProfile}
        onLogout={logout}
        overdueCount={myOverdue}
      />

      <div style={{ flex:1, overflow:'auto' }}>
        {renderPage()}
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          users={users}
          currentUser={userProfile}
          onClose={() => setSelectedTask(null)}
          onReassign={() => setSelectedTask(null)}
        />
      )}
    </div>
  )
}
