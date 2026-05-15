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
  const [step, setStep]       = useState(1)

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  // Password hint checks
  const pwMinLength = form.password.length >= 6
  const pwHasNumber = /[0-9]/.test(form.password) || /[^a-zA-Z0-9]/.test(form.password)
  const pwHasCase   = /[a-z]/.test(form.password) && /[A-Z]/.test(form.password)

  const validateStep1 = () => {
    if (!form.name.trim())     return 'Full name is required'
    if (!form.username.trim()) return 'Username is required'
    if (form.username.length < 3) return 'Username must be at least 3 characters'
    if (!form.email.trim())    return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email address'
    if (!form.password)        return 'Password is required'
    if (!pwMinLength)          return 'Password must be at least 6 characters'
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
    <div className="auth-split">
      {/* ── LEFT PANEL ── */}
      <div className="auth-left">
        <nav className="auth-top-nav">
          {step === 1
            ? <Link to="/login" className="auth-back-btn" title="Back to login">←</Link>
            : <button className="auth-back-btn" onClick={() => setStep(1)} title="Back">←</button>
          }
          <span className="auth-top-right">
            Already a member? <Link to="/login">Sign In</Link>
          </span>
        </nav>

        <div className="auth-form-container">
          <h1 className="auth-heading">Sign Up</h1>
          <p className="auth-subheading">Create your BookSphere account</p>

          {/* Step indicator */}
          <div className="auth-steps-bar">
            <div className={`auth-step-node ${step >= 1 ? (step > 1 ? 'done' : 'active') : ''}`}>
              <div className="auth-step-circle">{step > 1 ? '✓' : '1'}</div>
              <span>Account</span>
            </div>
            <div className="auth-step-line" />
            <div className={`auth-step-node ${step >= 2 ? 'active' : ''}`}>
              <div className="auth-step-circle">2</div>
              <span>Profile</span>
            </div>
          </div>

          {error && <div className="auth-error">⚠️ {error}</div>}

          {step === 1 && (
            <form onSubmit={goToStep2}>
              {/* Name */}
              <div className={`auth-field${form.name.length > 0 && form.name.trim().length < 2 ? ' field-error' : ''}`}>
                <span className="auth-field-icon">👤</span>
                <input
                  type="text"
                  placeholder="Full name"
                  value={form.name}
                  onChange={set('name')}
                  autoComplete="name"
                />
                {form.name.trim().length >= 2 && <span className="auth-field-check">✓</span>}
              </div>

              {/* Username */}
              <div className={`auth-field${form.username.length > 0 && form.username.length < 3 ? ' field-error' : ''}`}>
                <span className="auth-field-icon">🏷️</span>
                <input
                  type="text"
                  placeholder="Username (min 3 chars)"
                  value={form.username}
                  onChange={set('username')}
                  autoComplete="username"
                />
                {form.username.length >= 3 && <span className="auth-field-check">✓</span>}
              </div>

              {/* Email */}
              <div className={`auth-field${form.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? ' field-error' : ''}`}>
                <span className="auth-field-icon">✉️</span>
                <input
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={set('email')}
                  autoComplete="email"
                />
                {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && <span className="auth-field-check">✓</span>}
              </div>

              {/* Password */}
              <div className="auth-field">
                <span className="auth-field-icon">🔒</span>
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Password"
                  value={form.password}
                  onChange={set('password')}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-field-toggle"
                  onClick={() => setShowPw(s => !s)}
                  tabIndex={-1}
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Password hints */}
              {form.password.length > 0 && (
                <div className="pw-hints">
                  <div className={`pw-hint${pwMinLength ? ' met' : ''}`}>
                    <span className="pw-hint-indicator" />
                    At least 6 characters
                  </div>
                  <div className={`pw-hint${pwHasNumber ? ' met' : ''}`}>
                    <span className="pw-hint-indicator" />
                    Contains a number or symbol
                  </div>
                  <div className={`pw-hint${pwHasCase ? ' met' : ''}`}>
                    <span className="pw-hint-indicator" />
                    Upper &amp; lowercase letters
                  </div>
                </div>
              )}

              {/* Confirm password */}
              <div className={`auth-field${form.confirm.length > 0 && form.password !== form.confirm ? ' field-error' : ''}`}>
                <span className="auth-field-icon">🔒</span>
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={form.confirm}
                  onChange={set('confirm')}
                  autoComplete="new-password"
                />
                {form.confirm.length > 0 && form.password === form.confirm && (
                  <span className="auth-field-check">✓</span>
                )}
              </div>

              <button className="auth-submit-btn" type="submit">
                Next
                <span className="btn-arrow-circle">→</span>
              </button>

              <div className="auth-or-row">Or</div>
              <div className="auth-socials">
                <button className="auth-social-btn" title="Continue with Facebook" type="button">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
                </button>
                <button className="auth-social-btn" title="Continue with Google" type="button">
                  <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit}>
              {/* Account summary */}
              <div className="auth-summary-box">
                <div className="auth-summary-row"><span>Name</span><strong>{form.name}</strong></div>
                <div className="auth-summary-row"><span>Username</span><strong>@{form.username}</strong></div>
                <div className="auth-summary-row"><span>Email</span><strong>{form.email}</strong></div>
              </div>

              {/* Phone */}
              <div className="auth-field">
                <span className="auth-field-icon">📱</span>
                <input
                  type="tel"
                  placeholder="Phone number (optional)"
                  value={form.phone}
                  onChange={set('phone')}
                  autoComplete="tel"
                />
              </div>

              {/* Address */}
              <div className="auth-field">
                <span className="auth-field-icon">📍</span>
                <input
                  type="text"
                  placeholder="Address (optional)"
                  value={form.address}
                  onChange={set('address')}
                  autoComplete="street-address"
                />
              </div>

              <button className="auth-submit-btn" type="submit" disabled={loading}>
                {loading ? <><span className="btn-spinner" />&nbsp;Creating…</> : 'Create Account'}
                <span className="btn-arrow-circle">🚀</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="auth-right">
        <div className="auth-circle-badge auth-circle-1">📚</div>
        <div className="auth-circle-badge auth-circle-2">🎓</div>

        <div className="auth-right-inner">
          {/* Card 1 — member count */}
          <div className="auth-float-card">
            <div className="auth-float-label">Active Members</div>
            <div className="auth-float-value">3,847</div>
            <div className="auth-float-sub">Readers joined this year</div>
            <div className="auth-mini-bars">
              {[30, 55, 40, 70, 50, 85, 60, 75, 90, 100].map((h, i) => (
                <div
                  key={i}
                  className={`auth-mini-bar ${i >= 6 ? 'auth-mini-bar-active' : 'auth-mini-bar-inactive'}`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Card 2 */}
          <div className="auth-float-card auth-float-card-sm">
            <div className="auth-float-card-2-inner">
              <div className="auth-float-card-icon">🛡️</div>
              <div>
                <div className="auth-float-card-2-title">Your data, your rules</div>
                <div className="auth-float-card-2-desc">Full control over your profile, borrow history &amp; preferences</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
