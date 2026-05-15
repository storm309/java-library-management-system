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
    <div className="auth-page">
      {/* Floating background blobs */}
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />
      <div className="auth-blob auth-blob-3" />

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">📚</div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to Library Management System</p>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="on">
          <div className="form-group">
            <label>Email or Username</label>
            <div className="input-icon-wrap">
              <span className="input-icon">👤</span>
              <input
                type="text"
                placeholder="you@example.com or username"
                value={form.username}
                onChange={set('username')}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-icon-wrap">
              <span className="input-icon">🔒</span>
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={set('password')}
                autoComplete="current-password"
                required
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(s => !s)} tabIndex={-1}>
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading
              ? <><span className="btn-spinner" /> Signing in...</>
              : '→ Sign In'}
          </button>
        </form>

        <div className="auth-divider"><span>New here?</span></div>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one free</Link>
        </p>
      </div>
    </div>
  )
}
