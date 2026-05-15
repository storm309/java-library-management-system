import { useState, useEffect } from 'react'
import { booksAPI, authorsAPI, categoriesAPI, usersAPI } from '../api/api'
import { Link } from 'react-router-dom'

export default function Home() {
  const [stats, setStats] = useState(null)
  const [myBooks, setMyBooks] = useState([])
  const [recentBooks, setRecentBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [books, authors, categories, users] = await Promise.all([
          booksAPI.getAll(),
          authorsAPI.getAll(),
          categoriesAPI.getAll(),
          usersAPI.getAll(),
        ])
        const available = (books || []).filter(b => b.available).length
        setStats({
          totalBooks: books?.length || 0,
          availableBooks: available,
          borrowedBooks: (books?.length || 0) - available,
          totalAuthors: authors?.length || 0,
          totalCategories: categories?.length || 0,
          totalUsers: users?.length || 0,
        })
        // Fetch books borrowed by current user
        if (user.id) {
          const mine = await usersAPI.getBooks(user.id)
          setMyBooks(mine || [])
        }
        // Last 6 books added (by id desc)
        const sorted = [...(books || [])].sort((a, b) => b.id - a.id)
        setRecentBooks(sorted.slice(0, 6))
      } catch (_) {}
      setLoading(false)
    }
    load()
  }, [])

  const COVER_COLORS = 10
  const coverClass = (id) => `cover-${id % COVER_COLORS}`

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div className="page-header-left">
            <div className="page-icon page-icon-books">🏠</div>
            <div><div className="page-title">Dashboard</div></div>
          </div>
        </div>
        <div className="stats-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card">
              <div className="skeleton-line" style={{ width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton-line" style={{ width: '60px', height: '28px', marginBottom: '6px' }} />
                <div className="skeleton-line skeleton-line-short" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* ── Greeting ── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>
          👋 Welcome back, {user.name?.split(' ')[0] || 'User'}!
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Here's an overview of your library today.
        </p>
      </div>

      {/* ── Stats Grid ── */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon stat-icon-purple">📚</div>
            <div>
              <div className="stat-value">{stats.totalBooks}</div>
              <div className="stat-label">Total Books</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-green">✅</div>
            <div>
              <div className="stat-value">{stats.availableBooks}</div>
              <div className="stat-label">Available</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-amber">📤</div>
            <div>
              <div className="stat-value">{stats.borrowedBooks}</div>
              <div className="stat-label">Borrowed</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-blue">✍️</div>
            <div>
              <div className="stat-value">{stats.totalAuthors}</div>
              <div className="stat-label">Authors</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-purple">🏷️</div>
            <div>
              <div className="stat-value">{stats.totalCategories}</div>
              <div className="stat-label">Genres</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-green">👥</div>
            <div>
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-label">Members</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.25rem', alignItems: 'start' }}>
        {/* ── Recently Added Books ── */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div className="card-section-title" style={{ marginBottom: 0 }}>Recently Added Books</div>
            <Link to="/books" className="btn btn-ghost btn-xs">View All →</Link>
          </div>
          {recentBooks.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-icon">📚</div>
              <p>No books added yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
              {recentBooks.map(b => (
                <div key={b.id} className="book-list-item" style={{ padding: '0.625rem 0' }}>
                  <div className={`book-list-thumb ${coverClass(b.id)}`}>
                    {b.title[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="book-list-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {b.title}
                    </div>
                    <div className="book-list-author">{b.author?.name || 'Unknown'}</div>
                  </div>
                  <span className={`badge ${b.available ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.68rem', flexShrink: 0 }}>
                    {b.available ? 'Available' : 'Borrowed'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── My Borrowed Books ── */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div className="card-section-title" style={{ marginBottom: 0 }}>My Borrowed Books</div>
            <span className="badge badge-amber">{myBooks.length}</span>
          </div>
          {myBooks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', opacity: 0.4 }}>📖</div>
              <p style={{ fontSize: '0.85rem' }}>You haven't borrowed any books yet.</p>
              <Link to="/books" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>Browse Books</Link>
            </div>
          ) : (
            <div>
              {myBooks.map(b => (
                <div key={b.id} className="book-list-item">
                  <div className={`book-list-thumb ${coverClass(b.id)}`}>
                    {b.title[0].toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="book-list-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</div>
                    <div className="book-list-author">{b.author?.name || '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="card" style={{ marginTop: '1.25rem' }}>
        <div className="card-section-title">Quick Actions</div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/books" className="btn btn-primary">📚 Browse Books</Link>
          <Link to="/authors" className="btn btn-amber">✍️ View Authors</Link>
          <Link to="/categories" className="btn btn-success">🏷️ Explore Genres</Link>
          <Link to="/profile" className="btn btn-ghost">👤 My Profile</Link>
        </div>
      </div>
    </div>
  )
}
