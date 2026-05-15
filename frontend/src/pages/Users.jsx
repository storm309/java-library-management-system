import { useState, useEffect } from 'react'
import { usersAPI } from '../api/api'

const COVER_GRADIENTS = 10
function coverClass(id) { return `cover-${id % COVER_GRADIENTS}` }

export default function Users() {
  const [users, setUsers]           = useState([])
  const [expandedId, setExpandedId] = useState(null)
  const [userBooks, setUserBooks]   = useState({})
  const [loadingId, setLoadingId]   = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')

  const loggedIn = JSON.parse(localStorage.getItem('user') || '{}')
  const isAdmin = loggedIn.role === 'ADMIN'

  useEffect(() => {
    if (!isAdmin) return
    usersAPI.getAll()
      .then(data => setUsers(data || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const toggleBooks = async (user) => {
    if (expandedId === user.id) { setExpandedId(null); return }
    setExpandedId(user.id)
    if (userBooks[user.id]) return
    setLoadingId(user.id)
    try {
      const books = await usersAPI.getBooks(user.id) || []
      setUserBooks(prev => ({ ...prev, [user.id]: books }))
    } catch (err) { setError(err.message) }
    finally { setLoadingId(null) }
  }

  if (!isAdmin) {
    return (
      <div className="empty-state" style={{ marginTop: '3rem' }}>
        <div className="empty-icon">🔒</div>
        <h3>Access Restricted</h3>
        <p>Only administrators can view the members list.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon page-icon-users">👥</div>
          <div>
            <div className="page-title">Users</div>
            <div className="page-subtitle">{users.length} registered member{users.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {loading ? (
        <div className="empty-state" style={{ padding: '3rem' }}>
          <div className="empty-icon">👥</div>
          <p>Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No users yet</h3>
          <p>Register an account to get started</p>
        </div>
      ) : (
        <div className="users-grid">
          {users.map(u => {
            const books = userBooks[u.id] || []
            const isExpanded = expandedId === u.id
            const isLoading = loadingId === u.id
            const isMe = u.id === loggedIn.id
            return (
              <div key={u.id} className="user-card">
                <div className="user-card-header">
                  <div className="user-card-avatar">
                    {u.name[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="user-card-name">
                      {u.name}
                      {isMe && <span className="badge badge-primary" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>You</span>}
                    </div>
                    <div className="user-card-username">@{u.username}</div>
                  </div>
                </div>

                <div className="user-card-meta">
                  {u.profile?.email && (
                    <div className="user-meta-item">
                      <div className="user-meta-label">📧 Email</div>
                      <div className="user-meta-value">{u.profile.email}</div>
                    </div>
                  )}
                  {u.profile?.phone && (
                    <div className="user-meta-item">
                      <div className="user-meta-label">📱 Phone</div>
                      <div className="user-meta-value">{u.profile.phone}</div>
                    </div>
                  )}
                  {u.profile?.address && (
                    <div className="user-meta-item" style={{ gridColumn: '1 / -1' }}>
                      <div className="user-meta-label">📍 Address</div>
                      <div className="user-meta-value">{u.profile.address}</div>
                    </div>
                  )}
                  {!u.profile?.email && !u.profile?.phone && !u.profile?.address && (
                    <div className="user-meta-item" style={{ gridColumn: '1 / -1' }}>
                      <div className="user-meta-label">Profile</div>
                      <div className="user-meta-value" style={{ color: 'var(--text-muted)', fontWeight: 400 }}>No profile info</div>
                    </div>
                  )}
                </div>

                <button
                  className={`btn btn-sm ${isExpanded ? 'btn-secondary' : 'btn-ghost'}`}
                  style={{ width: '100%' }}
                  onClick={() => toggleBooks(u)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : isExpanded
                    ? `▲ Hide Books`
                    : `📚 Borrowed Books${books.length > 0 ? ` (${books.length})` : ''}`}
                </button>

                {isExpanded && (
                  <div className="books-list-card">
                    <div className="books-list-title">Books borrowed by {u.name}</div>
                    {books.length === 0 ? (
                      <p className="text-muted text-sm">No books currently borrowed.</p>
                    ) : (
                      books.map(b => (
                        <div key={b.id} className="book-list-item">
                          <div className={`book-list-thumb ${coverClass(b.id)}`}>
                            {b.title[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="book-list-title">{b.title}</div>
                            <div className="book-list-author">{b.author?.name || 'Unknown Author'}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
