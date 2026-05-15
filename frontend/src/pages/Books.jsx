import { useState, useEffect } from 'react'
import { booksAPI, authorsAPI, categoriesAPI } from '../api/api'

export default function Books() {
  const [books, setBooks] = useState([])
  const [authors, setAuthors] = useState([])
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', authorId: '', categoryIds: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [b, a, c] = await Promise.all([
        booksAPI.getAll(),
        authorsAPI.getAll(),
        categoriesAPI.getAll(),
      ])
      setBooks(b || [])
      setAuthors(a || [])
      setCategories(c || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const flash = (type, msg) => {
    if (type === 'success') { setSuccess(msg); setTimeout(() => setSuccess(''), 3000) }
    else { setError(msg); setTimeout(() => setError(''), 4000) }
  }

  const handleAddBook = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.authorId) return flash('error', 'Please select an author')
    if (form.categoryIds.length === 0) return flash('error', 'Select at least one category')
    try {
      await booksAPI.create({ title: form.title, authorId: parseInt(form.authorId), categoryIds: form.categoryIds })
      flash('success', 'Book added successfully!')
      setForm({ title: '', authorId: '', categoryIds: [] })
      setShowForm(false)
      loadData()
    } catch (err) {
      flash('error', err.message)
    }
  }

  const handleBorrow = async (bookId) => {
    try {
      await booksAPI.borrow(bookId, user.id)
      flash('success', 'Book borrowed!')
      loadData()
    } catch (err) {
      flash('error', err.message)
    }
  }

  const handleReturn = async (bookId) => {
    try {
      await booksAPI.returnBook(bookId)
      flash('success', 'Book returned!')
      loadData()
    } catch (err) {
      flash('error', err.message)
    }
  }

  const toggleCategory = (id) => {
    setForm(f => ({
      ...f,
      categoryIds: f.categoryIds.includes(id)
        ? f.categoryIds.filter(c => c !== id)
        : [...f.categoryIds, id],
    }))
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Books</h1>
          <p className="page-subtitle">Manage library books ({books.length} total)</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(s => !s); setError('') }}>
          {showForm ? '✕ Cancel' : '+ Add Book'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="card add-form-card">
          <h3>Add New Book</h3>
          <form onSubmit={handleAddBook}>
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                placeholder="Book title"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Author *</label>
              <select
                value={form.authorId}
                onChange={e => setForm(f => ({ ...f, authorId: e.target.value }))}
                required
              >
                <option value="">-- Select Author --</option>
                {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Categories * (click to select)</label>
              <div className="chips-container">
                {categories.length === 0
                  ? <span className="text-muted text-sm">No categories yet — add categories first.</span>
                  : categories.map(c => (
                    <span
                      key={c.id}
                      className={`chip${form.categoryIds.includes(c.id) ? ' chip-selected' : ''}`}
                      onClick={() => toggleCategory(c.id)}
                    >
                      {c.name}
                    </span>
                  ))
                }
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Add Book</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="loading">Loading books...</div>
        ) : books.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <p>No books yet. Add your first book!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Categories</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book, i) => (
                  <tr key={book.id}>
                    <td className="text-muted">{i + 1}</td>
                    <td><strong>{book.title}</strong></td>
                    <td>{book.author?.name || '—'}</td>
                    <td>
                      <div className="tag-list">
                        {book.categories?.map(c => (
                          <span key={c.id} className="tag">{c.name}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${book.available ? 'badge-success' : 'badge-danger'}`}>
                        {book.available ? '✓ Available' : '✗ Borrowed'}
                      </span>
                    </td>
                    <td>
                      {book.available ? (
                        <button className="btn btn-sm btn-primary" onClick={() => handleBorrow(book.id)}>
                          Borrow
                        </button>
                      ) : book.borrowedByUserId === user.id ? (
                        <button className="btn btn-sm btn-success" onClick={() => handleReturn(book.id)}>
                          Return
                        </button>
                      ) : (
                        <span className="text-muted text-sm">User #{book.borrowedByUserId}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
