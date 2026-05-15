import { useState, useEffect } from 'react'
import { usersAPI } from '../api/api'

export default function Users() {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [userBooks, setUserBooks] = useState([])
  const [loadingBooks, setLoadingBooks] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loggedIn = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    usersAPI.getAll()
      .then(data => setUsers(data || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const viewBooks = async (user) => {
    if (selectedUser?.id === user.id) {
      setSelectedUser(null)
      setUserBooks([])
      return
    }
    setSelectedUser(user)
    setLoadingBooks(true)
    try { setUserBooks(await usersAPI.getBooks(user.id) || []) }
    catch (err) { setError(err.message) }
    finally { setLoadingBooks(false) }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Registered library members ({users.length} total)</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        {loading ? (
          <div className="loading">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <p>No users yet.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} className={selectedUser?.id === u.id ? 'row-selected' : ''}>
                    <td className="text-muted">{i + 1}</td>
                    <td>
                      <strong>{u.name}</strong>
                      {u.id === loggedIn.id && (
                        <span className="badge badge-primary badge-sm" style={{ marginLeft: '0.5rem' }}>You</span>
                      )}
                    </td>
                    <td className="text-muted">@{u.username}</td>
                    <td>{u.profile?.email || '—'}</td>
                    <td>{u.profile?.phone || '—'}</td>
                    <td>
                      <button className="btn btn-sm btn-secondary" onClick={() => viewBooks(u)}>
                        {selectedUser?.id === u.id ? '▲ Hide' : '📚 Borrowed Books'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="card">
          <h3 className="card-section-title">
            Books borrowed by {selectedUser.name}
          </h3>
          {loadingBooks ? (
            <div className="loading">Loading...</div>
          ) : userBooks.length === 0 ? (
            <p className="text-muted">No books currently borrowed.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Title</th><th>Author</th><th>Categories</th></tr>
                </thead>
                <tbody>
                  {userBooks.map(b => (
                    <tr key={b.id}>
                      <td><strong>{b.title}</strong></td>
                      <td>{b.author?.name || '—'}</td>
                      <td>
                        <div className="tag-list">
                          {b.categories?.map(c => <span key={c.id} className="tag">{c.name}</span>)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
