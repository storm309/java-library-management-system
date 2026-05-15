import { useState, useEffect } from 'react'
import { categoriesAPI } from '../api/api'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => { loadCategories() }, [])

  const loadCategories = async () => {
    setLoading(true)
    try { setCategories(await categoriesAPI.getAll() || []) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      await categoriesAPI.create({ name })
      setSuccess('Category added!')
      setName('')
      setShowForm(false)
      loadCategories()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
      setTimeout(() => setError(''), 4000)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Manage book genres and categories ({categories.length} total)</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Cancel' : '+ Add Category'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="card add-form-card">
          <h3>Add New Category</h3>
          <form onSubmit={handleAdd} className="inline-form">
            <div className="form-group">
              <label>Category Name *</label>
              <input
                type="text"
                placeholder="e.g. Fiction, Science, History"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Add Category</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="loading">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏷️</div>
            <p>No categories yet. Add your first category!</p>
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map((c, i) => (
              <div key={c.id} className="category-card">
                <span className="category-number">{i + 1}</span>
                <span className="category-name">{c.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
