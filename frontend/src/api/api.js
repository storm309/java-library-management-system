const BASE = '/api'

async function request(url, options = {}) {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    let msg = text
    try { msg = JSON.parse(text)?.message || text } catch (_) {}
    throw new Error(msg || `Error ${res.status}`)
  }
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

export const authAPI = {
  register: (d) => request('/auth/register', { method: 'POST', body: JSON.stringify(d) }),
  login: (d) => request('/auth/login', { method: 'POST', body: JSON.stringify(d) }),
}

export const booksAPI = {
  getAll: () => request('/books'),
  create: (d) => request('/books', { method: 'POST', body: JSON.stringify(d) }),
  borrow: (bookId, userId) => request(`/books/${bookId}/borrow/${userId}`, { method: 'PUT' }),
  returnBook: (bookId) => request(`/books/${bookId}/return`, { method: 'PUT' }),
}

export const authorsAPI = {
  getAll: () => request('/authors'),
  create: (d) => request('/authors', { method: 'POST', body: JSON.stringify(d) }),
  getBooks: (id) => request(`/authors/${id}/books`),
}

export const categoriesAPI = {
  getAll: () => request('/categories'),
  create: (d) => request('/categories', { method: 'POST', body: JSON.stringify(d) }),
}

export const usersAPI = {
  getAll: () => request('/users'),
  getBooks: (id) => request(`/users/${id}/books`),
}
