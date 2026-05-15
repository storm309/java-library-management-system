import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../api/api'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', username: '', email: '', phone: '', address: '', password: '', confirm: ''
  })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)
  const [step, setStep]       = useState(1) // two-step form: 1=account, 2=profile

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const validateStep1 = () => {
    if (!form.name.trim())     return 'Full name is required'
    if (!form.username.trim()) return 'Username is required'
    if (form.username.length < 3) return 'Username must be at least 3 characters'
    if (!form.email.trim())    return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email address'
    if (!form.password)        return 'Password is required'
    if (form.password.length < 6) return 'Password must be at least 6 characters'
    if (form.password !== form.confirm) return 'Passwords do not match'
    return null
  }

  const goToStep2 = (e) => {
    e.preventDefault()
    const err = validateStep1()
    if (err) { setError(err); return }
    setError('')
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { confirm, ...payload } = form
    try {
      const data = await authAPI.register(payload)
      localStorage.setItem('user', JSON.stringify(data))
      navigate('/home')
    } catch (err) {
      setError(err.message)
      if (err.message.includes('Username') || err.message.includes('Email')) setStep(1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />
      <div className="auth-blob auth-blob-3" />

      <div className="auth-card auth-card-wide">
        <div className="auth-logo">📚</div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join the Library Management System</p>

        {/* Step indicator */}
        <div className="auth-steps">
          <div className={`auth-step ${step >= 1 ? 'active' : ''}`}>
            <div className="auth-step-dot">{step > 1 ? '✓' : '1'}</div>
            <span>Account</span>
          </div>
          <div className="auth-step-line" />
          <div className={`auth-step ${step >= 2 ? 'active' : ''}`}>
            <div className="auth-step-dot">2</div>
            <span>Profile</span>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={goToStep2}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <div className="input-icon-wrap">
                  <span className="input-icon">👤</span>
                  <input type="text" placeholder="John Doe"
                    value={form.name} onChange={set('name')} required />
                </div>
              </div>
              <div className="form-group">
                <label>Username *</label>
                <div className="input-icon-wrap">
                  <span className="input-icon">@</span>
                  <input type="text" placeholder="johndoe"
                    value={form.username} onChange={set('username')} required />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <div className="input-icon-wrap">
                <span className="input-icon">✉️</span>
                <input type="email" placeholder="john@example.com"
                  value={form.email} onChange={set('email')} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password *</label>
                <div className="input-icon-wrap">
                  <span className="input-icon">🔒</span>
                  <input type={showPw ? 'text' : 'password'} placeholder="Min 6 characters"
                    value={form.password} onChange={set('password')} required />
                  <button type="button" className="pw-toggle" onClick={() => setShowPw(s => !s)} tabIndex={-1}>
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Confirm Password *</label>
                <div className="input-icon-wrap">
                  <span className="input-icon">🔒</span>
                  <input type={showPw ? 'text' : 'password'} placeholder="Repeat password"
                    value={form.confirm} onChange={set('confirm')} required />
                </div>
                {form.confirm && form.password !== form.confirm && (
                  <div className="form-hint" style={{ color: 'var(--danger)' }}>Passwords don't match</div>
                )}
                {form.confirm && form.password === form.confirm && (
                  <div className="form-hint" style={{ color: 'var(--success)' }}>✓ Passwords match</div>
                )}
              </div>
            </div>

            <button className="btn btn-primary btn-full" type="submit" style={{ marginTop: '0.25rem' }}>
              Next: Add Profile Info →
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Phone Number <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '0.75rem' }}>(optional)</span></label>
              <div className="input-icon-wrap">
                <span className="input-icon">📱</span>
                <input type="tel" placeholder="9876543210"
                  value={form.phone} onChange={set('phone')} />
              </div>
            </div>

            <div className="form-group">
              <label>Address <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '0.75rem' }}>(optional)</span></label>
              <div className="input-icon-wrap">
                <span className="input-icon">📍</span>
                <input type="text" placeholder="123 Main Street, City"
                  value={form.address} onChange={set('address')} />
              </div>
            </div>

            <div className="auth-summary">
              <div className="auth-summary-row"><span>Name</span><strong>{form.name}</strong></div>
              <div className="auth-summary-row"><span>Email</span><strong>{form.email}</strong></div>
              <div className="auth-summary-row"><span>Username</span><strong>@{form.username}</strong></div>
            </div>

            <div className="form-actions" style={{ marginTop: '1rem' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                {loading
                  ? <><span className="btn-spinner" /> Creating account...</>
                  : '🚀 Create Account'}
              </button>
            </div>
          </form>
        )}

        <p className="auth-footer" style={{ marginTop: '1.25rem' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
