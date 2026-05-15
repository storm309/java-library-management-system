import { useState, useEffect } from 'react'
import { authorsAPI } from '../api/api'

const COVER_GRADIENTS = 10

function coverClass(id) { return `cover-${id % COVER_GRADIENTS}` }

export default function Authors() {
  const [authors, setAuthors]         = useState([])
  const [showForm, setShowForm]       = useState(false)
  const [name, setName]               = useState('')
  const [expandedId, setExpandedId]   = useState(null)
  const [authorBooks, setAuthorBooks] = useState({})
  const [loadingId, setLoadingId]     = useState(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState('')

  useEffect(() => { loadAuthors() }, [])

  const loadAuthors = async () => {
    setLoading(true)
    try { setAuthors(await authorsAPI.getAll() || []) }
    catch (err) { flash('error', err.message) }
    finally { setLoading(false) }
  }

  const flash = (type, msg) => {
    if (type === 'success') { setSuccess(msg); setTimeout(() => setSuccess(''), 3000) }
    else { setError(msg); setTimeout(() => setError(''), 4000) }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      await authorsAPI.create({ name })
      flash('success', `✅ "${name}" added!`)
      setName(''); setShowForm(false)
      loadAuthors()
    } catch (err) { flash('error', err.message) }
  }

  const toggleBooks = async (author) => {
    if (expandedId === author.id) { setExpandedId(null); return }
    setExpandedId(author.id)
    if (authorBooks[author.id]) return
    setLoadingId(author.id)
    try {
      const books = await authorsAPI.getBooks(author.id) || []
      setAuthorBooks(prev => ({ ...prev, [author.id]: books }))
    } catch (err) { flash('error', err.message) }
    finally { setLoadingId(null) }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon page-icon-authors">✍️</div>
          <div>
            <div className="page-title">Authors</div>
            <div className="page-subtitle">{authors.length} author{authors.length !== 1 ? 's' : ''} in the library</div>
          </div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => { setShowForm(s => !s); setError('') }}>
            {showForm ? '✕ Cancel' : '+ Add Author'}
          </button>
        </div>
      </div>

      {error   && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="card add-form-card" style={{ marginBottom: '1.5rem' }}>
          <h3>✍️ Add New Author</h3>
          <form onSubmit={handleAdd} className="inline-form">
            <div className="form-group">
              <label>Author Name *</label>
              <input type="text" placeholder="e.g. J.K. Rowling"
                value={name} onChange={e => setName(e.target.value)} required autoFocus />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Add Author</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="empty-state" style={{ padding: '3rem' }}>
          <div className="empty-icon" style={{ animation: 'shimmer 1.5s infinite' }}>✍️</div>
          <p>Loading authors...</p>
        </div>
      ) : authors.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✍️</div>
          <h3>No authors yet</h3>
          <p>Click "+ Add Author" to get started</p>
        </div>
      ) : (
        <div className="authors-grid">
          {authors.map((author, i) => {
            const books = authorBooks[author.id] || []
            const isExpanded = expandedId === author.id
            const isLoading = loadingId === author.id
            return (
              <div key={author.id} className="author-card">
                <div className="author-header">
                  <div className={`author-avatar av-${i % 6}`}>
                    {author.name[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="author-name">{author.name}</div>
                    <div className="author-meta">
                      {isExpanded && books.length > 0
                        ? `${books.length} book${books.length !== 1 ? 's' : ''}`
                        : 'Author'}
                    </div>
                  </div>
                </div>
                <div className="author-actions">
                  <button
                    className={`btn btn-sm ${isExpanded ? 'btn-secondary' : 'btn-ghost'}`}
                    style={{ flex: 1 }}
                    onClick={() => toggleBooks(author)}
                    disabled={isLoading}
                  >
                    {isLoading ? '...' : isExpanded ? '▲ Hide Books' : '📚 View Books'}
                  </button>
                </div>

                {isExpanded && (
                  <div className="books-list-card">
                    <div className="books-list-title">Books by {author.name}</div>
                    {books.length === 0 ? (
                      <p className="text-muted text-sm">No books by this author yet.</p>
                    ) : (
                      books.map(b => (
                        <div key={b.id} className="book-list-item">
                          <div className={`book-list-thumb ${coverClass(b.id)}`}>
                            {b.title[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="book-list-title">{b.title}</div>
                            <div className="book-list-author">
                              <span className={`badge ${b.available ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.68rem' }}>
                                {b.available ? '✓ Available' : '✗ Borrowed'}
                              </span>
                            </div>
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
