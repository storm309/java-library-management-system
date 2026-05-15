const BASE = '/api'

async function request(url, options = {}) {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    let backendMsg = ''
    try {
      const json = JSON.parse(text)
      backendMsg = json.message || ''
    } catch (_) {}

    // Spring defaults that are not user-friendly — always override with plain English
    const springDefaults = ['No message available', 'Conflict', 'Unauthorized', 'Not Found', 'Bad Request', 'Internal Server Error', 'Forbidden']
    const isSpringDefault = !backendMsg || springDefaults.includes(backendMsg)

    let msg = ''
    if (!isSpringDefault) {
      msg = backendMsg
    } else {
      switch (res.status) {
        case 400: msg = 'Invalid request. Please check your inputs.'; break
        case 401: msg = 'Incorrect username or password.'; break
        case 403: msg = 'You do not have permission to do this.'; break
        case 404: msg = 'The requested item was not found.'; break
        case 409: msg = 'Username already taken. Please choose a different one.'; break
        case 500: msg = 'Server error. Please try again later.'; break
        default:  msg = `Something went wrong (error ${res.status}). Please try again.`
      }
    }
    throw new Error(msg)
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
