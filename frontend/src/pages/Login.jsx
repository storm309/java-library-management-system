import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../api/api'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const identifierValid = form.username.trim().length >= 3

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username.trim()) { setError('Please enter your email or username'); return }
    if (!form.password)        { setError('Please enter your password'); return }
    setLoading(true)
    setError('')
    try {
      const data = await authAPI.login(form)
      localStorage.setItem('user', JSON.stringify(data))
      navigate('/home')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-split">
      {/* ── LEFT PANEL ── */}
      <div className="auth-left">
        <nav className="auth-top-nav">
          <Link to="/" className="auth-back-btn" title="Back to home">←</Link>
          <span className="auth-top-right">
            New here? <Link to="/register">Sign Up</Link>
          </span>
        </nav>

        <div className="auth-form-container">
          <h1 className="auth-heading">Welcome<br />back 👋</h1>
          <p className="auth-subheading">Sign in to your Library Management account</p>

          {error && <div className="auth-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit} autoComplete="on">
            {/* Email / Username */}
            <div className={`auth-field${form.username && !identifierValid ? ' field-error' : ''}`}>
              <span className="auth-field-icon">👤</span>
              <input
                type="text"
                placeholder="Email or username"
                value={form.username}
                onChange={set('username')}
                autoComplete="username"
              />
              {identifierValid && <span className="auth-field-check">✓</span>}
            </div>

            {/* Password */}
            <div className="auth-field">
              <span className="auth-field-icon">🔒</span>
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={set('password')}
                autoComplete="current-password"
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

            <button className="auth-submit-btn" disabled={loading}>
              {loading ? <><span className="btn-spinner" />&nbsp;Signing in…</> : 'Sign In'}
              <span className="btn-arrow-circle">→</span>
            </button>
          </form>

          <div className="auth-or-row">Or</div>
          <div className="auth-socials">
            <button className="auth-social-btn" title="Continue with Facebook" type="button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
            </button>
            <button className="auth-social-btn" title="Continue with Google" type="button">
              <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="auth-right">
        <div className="auth-circle-badge auth-circle-1">📚</div>
        <div className="auth-circle-badge auth-circle-2">📖</div>

        <div className="auth-right-inner">
          {/* Card 1 — Library stats */}
          <div className="auth-float-card">
            <div className="auth-float-label">Library Stats</div>
            <div className="auth-float-value">1,248</div>
            <div className="auth-float-sub">Total books in collection</div>
            <div className="auth-mini-bars">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95].map((h, i) => (
                <div
                  key={i}
                  className={`auth-mini-bar ${i >= 7 ? 'auth-mini-bar-active' : 'auth-mini-bar-inactive'}`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Card 2 — small offset */}
          <div className="auth-float-card auth-float-card-sm">
            <div className="auth-float-card-2-inner">
              <div className="auth-float-card-icon">🔑</div>
              <div>
                <div className="auth-float-card-2-title">Secure Access</div>
                <div className="auth-float-card-2-desc">Your library data is protected with encrypted credentials</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
