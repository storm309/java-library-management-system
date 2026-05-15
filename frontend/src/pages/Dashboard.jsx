import { Outlet, NavLink, useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const logout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  const navItems = [
    { path: '/books',      icon: '📚', label: 'Books' },
    { path: '/authors',    icon: '✍️', label: 'Authors' },
    { path: '/categories', icon: '🏷️', label: 'Categories' },
    { path: '/users',      icon: '👥', label: 'Users' },
  ]

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">📚</span>
          <span className="brand-text">LibraryMS</span>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">
            {user.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div className="user-name">{user.name || 'User'}</div>
            <div className="user-role">@{user.username || 'user'}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
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

        <button className="sidebar-logout" onClick={logout}>
          🚪 Logout
        </button>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
