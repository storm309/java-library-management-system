import { useState, useEffect } from 'react'
import { authorsAPI } from '../api/api'

export default function Authors() {
  const [authors, setAuthors] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState(null)
  const [authorBooks, setAuthorBooks] = useState([])
  const [loadingBooks, setLoadingBooks] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => { loadAuthors() }, [])

  const loadAuthors = async () => {
    setLoading(true)
    try { setAuthors(await authorsAPI.getAll() || []) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      await authorsAPI.create({ name })
      setSuccess('Author added!')
      setName('')
      setShowForm(false)
      loadAuthors()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
      setTimeout(() => setError(''), 4000)
    }
  }

  const viewBooks = async (author) => {
    if (selectedAuthor?.id === author.id) {
      setSelectedAuthor(null)
      setAuthorBooks([])
      return
    }
    setSelectedAuthor(author)
    setLoadingBooks(true)
    try { setAuthorBooks(await authorsAPI.getBooks(author.id) || []) }
    catch (err) { setError(err.message) }
    finally { setLoadingBooks(false) }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Authors</h1>
          <p className="page-subtitle">Manage book authors ({authors.length} total)</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Cancel' : '+ Add Author'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="card add-form-card">
          <h3>Add New Author</h3>
          <form onSubmit={handleAdd} className="inline-form">
            <div className="form-group">
              <label>Author Name *</label>
              <input
                type="text"
                placeholder="e.g. J.K. Rowling"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Add Author</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="loading">Loading authors...</div>
        ) : authors.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✍️</div>
            <p>No authors yet. Add your first author!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>#</th><th>Name</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {authors.map((a, i) => (
                  <tr key={a.id} className={selectedAuthor?.id === a.id ? 'row-selected' : ''}>
                    <td className="text-muted">{i + 1}</td>
                    <td><strong>{a.name}</strong></td>
                    <td>
                      <button className="btn btn-sm btn-secondary" onClick={() => viewBooks(a)}>
                        {selectedAuthor?.id === a.id ? '▲ Hide Books' : '📚 View Books'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedAuthor && (
        <div className="card">
          <h3 className="card-section-title">Books by {selectedAuthor.name}</h3>
          {loadingBooks ? (
            <div className="loading">Loading...</div>
          ) : authorBooks.length === 0 ? (
            <p className="text-muted">No books by this author yet.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Title</th><th>Categories</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {authorBooks.map(b => (
                    <tr key={b.id}>
                      <td><strong>{b.title}</strong></td>
                      <td>
                        <div className="tag-list">
                          {b.categories?.map(c => <span key={c.id} className="tag">{c.name}</span>)}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${b.available ? 'badge-success' : 'badge-danger'}`}>
                          {b.available ? 'Available' : 'Borrowed'}
                        </span>
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
