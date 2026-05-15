import { useState, useEffect } from 'react'
import { booksAPI, authorsAPI, categoriesAPI } from '../api/api'

const COVER_COLORS = 10

function coverClass(id) { return `cover-${id % COVER_COLORS}` }

function BookCover({ book }) {
  if (book.imageUrl) {
    return <img src={book.imageUrl} alt={book.title} onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
  }
  return (
    <div className={`book-cover-placeholder ${coverClass(book.id)}`}>
      <div className="book-initial">{book.title[0].toUpperCase()}</div>
      <div className="book-cover-subtitle">{book.title}</div>
    </div>
  )
}

function SkeletonCards() {
  return (
    <div className="loading-grid">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="skeleton">
          <div className="skeleton-cover" />
          <div className="skeleton-body">
            <div className="skeleton-line" />
            <div className="skeleton-line skeleton-line-short" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Books() {
  const [books, setBooks]           = useState([])
  const [authors, setAuthors]       = useState([])
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm]     = useState(false)
  const [form, setForm]             = useState({ title: '', imageUrl: '', description: '', publishYear: '', authorId: '', categoryIds: [] })
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState('')
  const [search, setSearch]         = useState('')
  const [filter, setFilter]         = useState('all')   // all | available | borrowed
  const [selected, setSelected]     = useState(null)    // book modal

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isAdmin = user.role === 'ADMIN'

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [b, a, c] = await Promise.all([booksAPI.getAll(), authorsAPI.getAll(), categoriesAPI.getAll()])
      setBooks(b || [])
      setAuthors(a || [])
      setCategories(c || [])
    } catch (err) { flash('error', err.message) }
    finally { setLoading(false) }
  }

  const flash = (type, msg) => {
    if (type === 'success') { setSuccess(msg); setTimeout(() => setSuccess(''), 3000) }
    else { setError(msg); setTimeout(() => setError(''), 4000) }
  }

  const handleAddBook = async (e) => {
    e.preventDefault()
    if (!form.authorId) return flash('error', 'Please select an author')
    if (form.categoryIds.length === 0) return flash('error', 'Select at least one category')
    try {
      await booksAPI.create({
        title: form.title,
        imageUrl: form.imageUrl || null,
        description: form.description || null,
        publishYear: form.publishYear ? parseInt(form.publishYear) : null,
        authorId: parseInt(form.authorId),
        categoryIds: form.categoryIds,
      })
      flash('success', '📚 Book added successfully!')
      setForm({ title: '', imageUrl: '', description: '', publishYear: '', authorId: '', categoryIds: [] })
      setShowForm(false)
      loadData()
    } catch (err) { flash('error', err.message) }
  }

  const handleBorrow = async (bookId) => {
    try {
      await booksAPI.borrow(bookId, user.id)
      flash('success', '✅ Book borrowed!')
      setSelected(null)
      loadData()
    } catch (err) { flash('error', err.message) }
  }

  const handleReturn = async (bookId) => {
    try {
      await booksAPI.returnBook(bookId)
      flash('success', '✅ Book returned!')
      setSelected(null)
      loadData()
    } catch (err) { flash('error', err.message) }
  }

  const toggleCategory = (id) => {
    setForm(f => ({
      ...f,
      categoryIds: f.categoryIds.includes(id)
        ? f.categoryIds.filter(c => c !== id)
        : [...f.categoryIds, id],
    }))
  }

  const filtered = books.filter(b => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) ||
                        (b.author?.name || '').toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || (filter === 'available' ? b.available : !b.available)
    return matchSearch && matchFilter
  })

  const available = books.filter(b => b.available).length

  return (
    <div>
      {/* ── Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon page-icon-books">📚</div>
          <div>
            <div className="page-title">Books</div>
            <div className="page-subtitle">{books.length} total · {available} available · {books.length - available} borrowed</div>
          </div>
        </div>
        <div className="page-actions">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              placeholder="Search books or authors..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {isAdmin && (
          <button className="btn btn-primary" onClick={() => { setShowForm(s => !s); setError('') }}>
            {showForm ? '✕ Cancel' : '+ Add Book'}
          </button>
          )}
        </div>
      </div>

      {/* ── Alerts ── */}
      {error   && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* ── Add Form ── */}
      {isAdmin && showForm && (
        <div className="card add-form-card" style={{ marginBottom: '1.5rem' }}>
          <h3>📖 Add New Book</h3>
          <form onSubmit={handleAddBook}>
            <div className="form-row">
              <div className="form-group">
                <label>Title *</label>
                <input type="text" placeholder="e.g. The Great Gatsby"
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Author *</label>
                <select value={form.authorId} onChange={e => setForm(f => ({ ...f, authorId: e.target.value }))} required>
                  <option value="">-- Select Author --</option>
                  {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Cover Image URL <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '0.75rem', color: 'var(--text-muted)' }}>(optional)</span></label>
              <input type="url" placeholder="https://example.com/cover.jpg"
                value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} />
              <div className="form-hint">Leave blank for an auto-generated colorful cover</div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Publish Year <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '0.75rem', color: 'var(--text-muted)' }}>(optional)</span></label>
                <input type="number" placeholder="e.g. 2023" min="1000" max="2099"
                  value={form.publishYear} onChange={e => setForm(f => ({ ...f, publishYear: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Short Description <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '0.75rem', color: 'var(--text-muted)' }}>(optional)</span></label>
                <input type="text" placeholder="One-line description of the book"
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label>Categories * <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '0.75rem', color: 'var(--text-muted)' }}>(click to select)</span></label>
              <div className="chips-container">
                {categories.length === 0
                  ? <span className="text-muted text-sm">No categories yet — add categories first.</span>
                  : categories.map(c => (
                    <span key={c.id}
                      className={`chip${form.categoryIds.includes(c.id) ? ' chip-selected' : ''}`}
                      onClick={() => toggleCategory(c.id)}
                    >{c.name}</span>
                  ))
                }
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Add Book</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Filter Bar ── */}
      <div className="filter-bar">
        {['all', 'available', 'borrowed'].map(f => (
          <button key={f} className={`filter-btn${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? `All (${books.length})` : f === 'available' ? `✓ Available (${available})` : `✗ Borrowed (${books.length - available})`}
          </button>
        ))}
        {search && <span className="text-muted text-sm" style={{ marginLeft: 'auto' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"</span>}
      </div>

      {/* ── Book Grid ── */}
      {loading ? (
        <SkeletonCards />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>{search ? 'No books match your search' : 'No books yet'}</h3>
          <p>{search ? 'Try a different search term' : 'Click "+ Add Book" to get started'}</p>
        </div>
      ) : (
        <div className="books-grid">
          {filtered.map(book => (
            <div key={book.id} className="book-card" onClick={() => setSelected(book)}>
              <div className={`book-cover ${book.imageUrl ? '' : coverClass(book.id)}`}>
                <BookCover book={book} />
                <div className="book-status-overlay">
                  <span className={`badge ${book.available ? 'badge-success' : 'badge-danger'}`}>
                    {book.available ? '✓' : '✗'}
                  </span>
                </div>
              </div>
              <div className="book-body">
                <div className="book-title">{book.title}</div>
                <div className="book-author">✍️ {book.author?.name || 'Unknown'}</div>
                <div className="book-categories">
                  {book.categories?.map(c => <span key={c.id} className="tag">{c.name}</span>)}
                </div>
                <div className="book-footer">
                  {book.available ? (
                    <button className="btn btn-success btn-sm" style={{ width: '100%' }}
                      onClick={e => { e.stopPropagation(); handleBorrow(book.id) }}>
                      Borrow
                    </button>
                  ) : book.borrowedByUserId === user.id ? (
                    <button className="btn btn-amber btn-sm" style={{ width: '100%' }}
                      onClick={e => { e.stopPropagation(); handleReturn(book.id) }}>
                      Return Book
                    </button>
                  ) : (
                    <span className="badge badge-danger" style={{ fontSize: '0.72rem' }}>Borrowed by someone</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Book Detail Modal ── */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-wrapper" onClick={e => e.stopPropagation()}>
            <div className="modal">
              <div className={`modal-cover ${selected.imageUrl ? '' : coverClass(selected.id)}`} style={{ position: 'relative' }}>
                {selected.imageUrl
                  ? <img src={selected.imageUrl} alt={selected.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '5rem', fontWeight: 900, color: 'rgba(255,255,255,0.95)', textShadow: '0 3px 12px rgba(0,0,0,0.3)' }}>
                      {selected.title[0].toUpperCase()}
                    </span>
                }
                <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="modal-title">{selected.title}</div>
                <div className="modal-author">✍️ {selected.author?.name || 'Unknown Author'}</div>
                {selected.description && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.5rem 0 1rem', lineHeight: 1.6 }}>
                    {selected.description}
                  </p>
                )}
                <div className="modal-meta">
                  <div className="modal-meta-row">
                    <span className="modal-meta-label">Status</span>
                    <span className={`badge ${selected.available ? 'badge-success' : 'badge-danger'}`}>
                      {selected.available ? '✓ Available' : '✗ Borrowed'}
                    </span>
                  </div>
                  {selected.publishYear && (
                    <div className="modal-meta-row">
                      <span className="modal-meta-label">Published</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{selected.publishYear}</span>
                    </div>
                  )}
                  <div className="modal-meta-row">
                    <span className="modal-meta-label">Categories</span>
                    <div className="tag-list">
                      {selected.categories?.map(c => <span key={c.id} className="tag">{c.name}</span>)}
                    </div>
                  </div>
                  {!selected.available && selected.borrowedByUserId === user.id && (
                    <div className="modal-meta-row">
                      <span className="modal-meta-label">Borrowed by</span>
                      <span className="badge badge-primary">You</span>
                    </div>
                  )}
                </div>
                <div className="modal-actions">
                  {selected.available ? (
                    <button className="btn btn-success" style={{ flex: 1 }} onClick={() => handleBorrow(selected.id)}>
                      📖 Borrow this Book
                    </button>
                  ) : selected.borrowedByUserId === user.id ? (
                    <button className="btn btn-amber" style={{ flex: 1 }} onClick={() => handleReturn(selected.id)}>
                      ↩️ Return this Book
                    </button>
                  ) : (
                    <span className="text-muted text-sm">This book is currently borrowed by another user.</span>
                  )}
                  <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
