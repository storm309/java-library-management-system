import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../api/api'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', username: '', password: '', email: '', phone: '', address: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await authAPI.register(form)
      localStorage.setItem('user', JSON.stringify(data))
      navigate('/books')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-logo">📚</div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join the Library Management System</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" placeholder="John Doe" value={form.name} onChange={set('name')} required />
            </div>
            <div className="form-group">
              <label>Username *</label>
              <input type="text" placeholder="johndoe" value={form.username} onChange={set('username')} required />
            </div>
          </div>
          <div className="form-group">
            <label>Password *</label>
            <input type="password" placeholder="Create a password" value={form.password} onChange={set('password')} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="john@example.com" value={form.email} onChange={set('email')} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="text" placeholder="9876543210" value={form.phone} onChange={set('phone')} />
            </div>
          </div>
          <div className="form-group">
            <label>Address</label>
            <input type="text" placeholder="123 Main Street" value={form.address} onChange={set('address')} />
          </div>
          <button className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
