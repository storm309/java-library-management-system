import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Books from './pages/Books'
import Authors from './pages/Authors'
import Categories from './pages/Categories'
import Users from './pages/Users'

function PrivateRoute({ children }) {
  const user = localStorage.getItem('user')
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>}>
          <Route index element={<Navigate to="/books" replace />} />
          <Route path="books" element={<Books />} />
          <Route path="authors" element={<Authors />} />
          <Route path="categories" element={<Categories />} />
          <Route path="users" element={<Users />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
