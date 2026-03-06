import { ROLES, ROLE_CLR, ROLE_ORDER } from '../constants.js'
import { Avatar } from './UI.jsx'

const NAV = [
  { id: 'dashboard', icon: '◈', label: 'Dashboard' },
  { id: 'tasks',     icon: '≡', label: 'All Tasks'  },
  { id: 'clients',   icon: '🏢', label: 'Clients'   },
  { id: 'team',      icon: '👥', label: 'Team',       managerOnly: true },
  { id: 'users',     icon: '⚙️', label: 'Manage Team', partnerOnly: true },
]

export const Sidebar = ({ page, setPage, user, onLogout, overdueCount = 0 }) => {
  const isManager = ['partner', 'hod', 'team_leader'].includes(user.role)
  const isPartner = user.role === 'partner'

  const items = NAV.filter(n => {
    if (n.partnerOnly) return isPartner
    if (n.managerOnly) return isManager
    return true
  })

  return (
    <div style={{
      width: 210, flexShrink: 0, background: 'var(--surface)',
      borderRight: '1px solid var(--border)', display: 'flex',
      flexDirection: 'column', height: '100vh', position: 'sticky', top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px' }}>⚖️ ComplianceDesk</div>
        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2, letterSpacing: '0.05em' }}>CA FIRM MANAGER</div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 8px', flex: 1 }}>
        {items.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: page === n.id ? 'var(--surface3)' : 'transparent',
            color: page === n.id ? 'var(--text)' : 'var(--text2)',
            fontWeight: page === n.id ? 700 : 500, fontSize: 13,
            borderLeft: page === n.id ? '2px solid var(--accent)' : '2px solid transparent',
            marginBottom: 2, transition: 'all 0.1s',
            justifyContent: 'space-between',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 15 }}>{n.icon}</span> {n.label}
            </span>
            {n.id === 'dashboard' && overdueCount > 0 && (
              <span className="chip" style={{ background: '#f43f5e20', color: 'var(--danger)', border: '1px solid #f43f5e30', fontSize: 10 }}>
                {overdueCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* User footer */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Avatar name={user.name} init={user.init} role={user.role} sz={30} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name}
            </div>
            <div style={{ fontSize: 10, color: ROLE_CLR[user.role], fontWeight: 600 }}>{ROLES[user.role]}</div>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={onLogout}>
          Sign Out
        </button>
      </div>
    </div>
  )
}
