import { useState, useEffect } from 'react'
import { categoriesAPI } from '../api/api'

const CAT_EMOJIS = ['📖', '🔬', '📜', '💻', '🎭', '🌍', '🎨', '🧬', '🏛️', '🎵', '⚽', '🍳']

function catEmoji(name, index) {
  const lower = name.toLowerCase()
  if (lower.includes('fiction') || lower.includes('novel'))      return '📖'
  if (lower.includes('science') || lower.includes('sci'))        return '🔬'
  if (lower.includes('history') || lower.includes('historic'))   return '📜'
  if (lower.includes('tech') || lower.includes('computer') || lower.includes('code')) return '💻'
  if (lower.includes('drama') || lower.includes('play'))         return '🎭'
  if (lower.includes('geography') || lower.includes('travel'))   return '🌍'
  if (lower.includes('art') || lower.includes('design'))         return '🎨'
  if (lower.includes('bio') || lower.includes('life'))           return '🧬'
  if (lower.includes('philosophy') || lower.includes('religion'))return '🏛️'
  if (lower.includes('music') || lower.includes('sound'))        return '🎵'
  if (lower.includes('sport') || lower.includes('fitness'))      return '⚽'
  if (lower.includes('cook') || lower.includes('food'))          return '🍳'
  if (lower.includes('fantasy') || lower.includes('magic'))      return '✨'
  if (lower.includes('mystery') || lower.includes('thriller'))   return '🔍'
  if (lower.includes('romance') || lower.includes('love'))       return '💖'
  if (lower.includes('self') || lower.includes('motivat'))       return '🚀'
  return CAT_EMOJIS[index % CAT_EMOJIS.length]
}

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm]     = useState(false)
  const [name, setName]             = useState('')
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState('')

  const isAdmin = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}').role === 'ADMIN' } catch (_) { return false } })()

  useEffect(() => { loadCategories() }, [])

  const loadCategories = async () => {
    setLoading(true)
    try { setCategories(await categoriesAPI.getAll() || []) }
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
      await categoriesAPI.create({ name })
      flash('success', `✅ Category "${name}" added!`)
      setName(''); setShowForm(false)
      loadCategories()
    } catch (err) { flash('error', err.message) }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon page-icon-cats">🏷️</div>
          <div>
            <div className="page-title">Categories</div>
            <div className="page-subtitle">{categories.length} genre{categories.length !== 1 ? 's' : ''} available</div>
          </div>
        </div>
        <div className="page-actions">
          {isAdmin && (
          <button className="btn btn-primary" onClick={() => { setShowForm(s => !s); setError('') }}>
            {showForm ? '✕ Cancel' : '+ Add Category'}
          </button>
          )}
        </div>
      </div>

      {error   && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {isAdmin && showForm && (
        <div className="card add-form-card" style={{ marginBottom: '1.5rem' }}>
          <h3>🏷️ Add New Category</h3>
          <form onSubmit={handleAdd} className="inline-form">
            <div className="form-group">
              <label>Category Name *</label>
              <input type="text" placeholder="e.g. Fiction, Science, History"
                value={name} onChange={e => setName(e.target.value)} required autoFocus />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Add Category</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="empty-state" style={{ padding: '3rem' }}>
          <div className="empty-icon">🏷️</div>
          <p>Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏷️</div>
          <h3>No categories yet</h3>
          <p>Click "+ Add Category" to get started</p>
        </div>
      ) : (
        <div className="categories-grid">
          {categories.map((c, i) => (
            <div key={c.id} className={`category-card cat-${i % 8}`}>
              <div className={`category-icon cat-${i % 8}`} style={{ background: 'transparent' }}>
                {catEmoji(c.name, i)}
              </div>
              <div className="category-name">{c.name}</div>
              <div className="category-count">Genre #{i + 1}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
