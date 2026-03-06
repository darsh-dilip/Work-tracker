import { useState } from 'react'
import { ROLES, ROLE_CLR, ROLE_ORDER } from '../constants.js'
import { Avatar, Modal, Label, Alert } from '../components/UI.jsx'
import { saveUser } from '../hooks/useFirestore.js'

export const UsersPage = ({ users, currentUser, createFirebaseUser }) => {
  const [showAdd,  setShowAdd]  = useState(false)
  const [form,     setForm]     = useState({ name:'', email:'', role:'executive', dept:'', reportsTo:'', init:'' })
  const [password, setPassword] = useState('')
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const sorted = [...users].sort((a,b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role])

  const submit = async () => {
    if (!form.name || !form.email || !password) { setError('Name, email and password are required.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setSaving(true); setError('')
    try {
      // Create Firebase Auth user
      const cred = await createFirebaseUser(form.email, password)
      // Auto-generate initials if not provided
      const init = form.init || form.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()
      // Save profile to Firestore
      await saveUser(cred.user.uid, {
        name:      form.name,
        email:     form.email,
        role:      form.role,
        dept:      form.dept,
        reportsTo: form.reportsTo || null,
        init,
        createdAt: new Date().toISOString(),
      })
      setSuccess(`✓ ${form.name} has been added. They can now log in with their email and password.`)
      setForm({ name:'', email:'', role:'executive', dept:'', reportsTo:'', init:'' })
      setPassword('')
      setShowAdd(false)
    } catch (e) {
      const msgs = {
        'auth/email-already-in-use': 'This email is already registered.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/weak-password': 'Password is too weak (min 6 chars).',
      }
      setError(msgs[e.code] || e.message)
    } finally { setSaving(false) }
  }

  return (
    <div className="fade-up" style={{ padding: '24px 28px', maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>Manage Team</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>Add team members and set their roles. Partners only.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Team Member</button>
      </div>

      {success && <Alert type="success" message={success} />}
      <div style={{ height: success ? 12 : 0 }} />

      {/* Hierarchy tree */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {sorted.map(u => {
          const mgr = users.find(x => x.id === u.reportsTo)
          return (
            <div key={u.id} style={{
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
              padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <Avatar name={u.name} init={u.init} role={u.role} sz={34} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{u.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                  <span style={{ color: ROLE_CLR[u.role], fontWeight: 600 }}>{ROLES[u.role]}</span>
                  {u.dept && ` · ${u.dept}`}
                  {mgr && <span> · Reports to <strong style={{ color: 'var(--text2)' }}>{mgr.name}</strong></span>}
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{u.email}</div>
            </div>
          )
        })}
      </div>

      {/* Add Member Modal */}
      <Modal open={showAdd} onClose={() => { setShowAdd(false); setError('') }} title="Add New Team Member" width={480}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="grid-2">
            <div style={{ gridColumn: '1/-1' }}>
              <Label>Full Name *</Label>
              <input placeholder="e.g. Anjali Mehta" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <Label>Email Address *</Label>
              <input type="email" placeholder="anjali@yourfirm.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <Label>Temporary Password * (they can change later)</Label>
              <input type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div>
              <Label>Role *</Label>
              <select value={form.role} onChange={e => set('role', e.target.value)}>
                {Object.entries(ROLES).filter(([k]) => k !== 'partner').map(([k,v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <Label>Department</Label>
              <input placeholder="e.g. GST & Compliance" value={form.dept} onChange={e => set('dept', e.target.value)} />
            </div>
            <div>
              <Label>Reports To</Label>
              <select value={form.reportsTo} onChange={e => set('reportsTo', e.target.value)}>
                <option value="">-- Select Manager --</option>
                {users.filter(u => ['partner','hod','team_leader'].includes(u.role)).map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({ROLES[u.role]})</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Initials (2 letters, auto-generated if blank)</Label>
              <input placeholder="e.g. AM" maxLength={2} value={form.init} onChange={e => set('init', e.target.value.toUpperCase())} />
            </div>
          </div>

          {error && <Alert message={error} />}

          <div style={{ background: '#f59e0b15', border: '1px solid #f59e0b30', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#f59e0b' }}>
            ⚠️ The team member will log in with this email and the temporary password you set. Share it with them securely.
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={submit} disabled={saving}>
              {saving ? 'Creating account…' : 'Create Account'}
            </button>
            <button className="btn btn-ghost" onClick={() => { setShowAdd(false); setError('') }}>Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
