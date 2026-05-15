import { useState } from 'react'
import { usersAPI } from '../api/api'

export default function Profile() {
  const stored = JSON.parse(localStorage.getItem('user') || '{}')
  const [form, setForm] = useState({
    name:     stored.name     || '',
    email:    stored.email    || '',
    phone:    stored.phone    || '',
    address:  stored.address  || '',
    password: '',
    confirm:  '',
  })
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name cannot be empty'); return }
    if (!form.email.trim()) { setError('Email cannot be empty'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Invalid email address'); return }
    if (form.password && form.password.length < 6) { setError('New password must be at least 6 characters'); return }
    if (form.password && form.password !== form.confirm) { setError('Passwords do not match'); return }

    setLoading(true)
    setError('')
    const payload = {
      name:    form.name,
      email:   form.email,
      phone:   form.phone,
      address: form.address,
      ...(form.password ? { password: form.password } : {}),
    }
    try {
      const data = await usersAPI.updateProfile(stored.id, payload)
      // Merge new values back into stored user
      const updated = { ...stored, name: data.name, username: data.username, email: data.email }
      localStorage.setItem('user', JSON.stringify(updated))
      setSuccess('✅ Profile updated successfully!')
      setForm(f => ({ ...f, password: '', confirm: '' }))
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const initials = stored.name
    ? stored.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', fontSize: '1.25rem' }}>👤</div>
          <div>
            <div className="page-title">My Profile</div>
            <div className="page-subtitle">Manage your personal information</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* ── Left: identity card ── */}
        <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '20px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.875rem', fontWeight: 900, color: 'white',
            margin: '0 auto 1rem', boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
          }}>
            {initials}
          </div>
          <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text)', marginBottom: '0.25rem' }}>
            {stored.name}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
            @{stored.username}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {stored.email && (
              <div className="user-meta-item">
                <div className="user-meta-label">📧 Email</div>
                <div className="user-meta-value">{stored.email}</div>
              </div>
            )}
            {form.phone && (
              <div className="user-meta-item">
                <div className="user-meta-label">📱 Phone</div>
                <div className="user-meta-value">{form.phone}</div>
              </div>
            )}
            {form.address && (
              <div className="user-meta-item">
                <div className="user-meta-label">📍 Address</div>
                <div className="user-meta-value">{form.address}</div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: edit form ── */}
        <div>
          {error   && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>}
          {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}

          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.25rem', color: 'var(--text)' }}>
              Personal Information
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" value={form.name} onChange={set('name')} placeholder="Your full name" required />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
                  <div className="form-hint">Used to log in. Must be unique.</div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" value={form.phone} onChange={set('phone')} placeholder="9876543210" />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input type="text" value={form.address} onChange={set('address')} placeholder="123 Main St, City" />
                </div>
              </div>

              <div className="divider" />

              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--text)' }}>
                Change Password <span style={{ fontWeight: 400, fontSize: '0.8rem', color: 'var(--text-muted)' }}>(leave blank to keep current)</span>
              </h3>
              <div className="form-row">
                <div className="form-group">
                  <label>New Password</label>
                  <div className="input-icon-wrap">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={form.password}
                      onChange={set('password')}
                      placeholder="Min 6 characters"
                    />
                    <button type="button" className="pw-toggle" onClick={() => setShowPw(s => !s)} tabIndex={-1}>
                      {showPw ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <div className="input-icon-wrap">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={form.confirm}
                      onChange={set('confirm')}
                      placeholder="Repeat new password"
                    />
                  </div>
                  {form.confirm && form.password !== form.confirm && (
                    <div className="form-hint" style={{ color: 'var(--danger)' }}>Passwords don't match</div>
                  )}
                  {form.confirm && form.password === form.confirm && (
                    <div className="form-hint" style={{ color: 'var(--success)' }}>✓ Match</div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <><span className="btn-spinner" /> Saving...</> : '💾 Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
