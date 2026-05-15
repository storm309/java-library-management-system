import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Dashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  const logout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  const navItems = [
    { path: '/home',       icon: '🏠', label: 'Home'       },
    { path: '/books',      icon: '📚', label: 'Books'      },
    { path: '/authors',    icon: '✍️',  label: 'Authors'   },
    { path: '/categories', icon: '🏷️', label: 'Categories' },
    { path: '/users',      icon: '👥', label: 'Members'    },
    { path: '/profile',    icon: '👤', label: 'My Profile' },
  ]

  const initials = user.name
    ? user.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">📚</div>
          <span className="brand-text">LibraryMS</span>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name">{user.name || 'User'}</div>
            <div className="user-role">@{user.username || 'user'}</div>
          </div>
          <button className="theme-toggle" onClick={() => setDark(d => !d)} title="Toggle dark mode">
            {dark ? '☀️' : '🌙'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Menu</div>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="sidebar-logout" onClick={logout}>
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
