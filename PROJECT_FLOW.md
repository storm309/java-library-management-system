# BookSphere — Complete Project Flow & Architecture

---

## Tech Stack at a Glance

| Layer | Technology | Version | Port |
|-------|-----------|---------|------|
| Frontend | React + Vite | React 18, Vite 5 | 5173 |
| Backend | Spring Boot | Java 21, Spring 3.2.5 | 8080 |
| Database | PostgreSQL | 17 | 5432 |
| Build Tool | Maven | — | — |

---

## Project Folder Structure

```
java-library-management-system/
│
├── backend/                         ← Spring Boot app
│   └── src/main/java/com/library/
│       ├── LibraryApplication.java  ← Entry point (@SpringBootApplication)
│       ├── config/
│       │   └── CorsConfig.java      ← Allow frontend origins to call backend
│       ├── entity/                  ← Database tables (JPA entities)
│       │   ├── User.java
│       │   ├── Profile.java
│       │   ├── Book.java
│       │   ├── Author.java
│       │   ├── Category.java
│       │   └── Role.java            ← Enum: USER | ADMIN
│       ├── dto/                     ← Data Transfer Objects (request/response shapes)
│       │   ├── AuthRequest.java     ← Login/Register input
│       │   ├── AuthResponse.java    ← Login/Register output (with role)
│       │   └── BookRequest.java     ← Add book input (authorId + categoryIds)
│       ├── repository/              ← Database query interfaces (Spring Data JPA)
│       │   ├── UserRepository.java
│       │   ├── BookRepository.java
│       │   ├── AuthorRepository.java
│       │   └── CategoryRepository.java
│       ├── service/                 ← Business logic
│       │   ├── UserService.java
│       │   ├── BookService.java
│       │   ├── AuthorService.java
│       │   └── CategoryService.java
│       └── controller/              ← REST API endpoints
│           ├── AuthController.java  ← /auth/register, /auth/login
│           ├── UserController.java  ← /users/**
│           ├── BookController.java  ← /books/**
│           ├── AuthorController.java← /authors/**
│           └── CategoryController.java ← /categories/**
│
├── frontend/                        ← React app
│   ├── public/
│   │   └── logo.jpg                 ← BookSphere logo
│   ├── index.html                   ← Root HTML (title: BookSphere)
│   └── src/
│       ├── main.jsx                 ← React entry point
│       ├── App.jsx                  ← Router + PrivateRoute guard
│       ├── index.css                ← All styles (design system)
│       ├── api/
│       │   └── api.js               ← All HTTP calls to backend
│       └── pages/
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── Dashboard.jsx        ← Layout wrapper with sidebar
│           ├── Home.jsx             ← Stats overview
│           ├── Books.jsx
│           ├── Authors.jsx
│           ├── Categories.jsx
│           ├── Users.jsx            ← Admin only
│           └── Profile.jsx
│
└── PROJECT_FLOW.md                  ← This file
```

---

## How the App Runs

### Start Backend
```bash
cd backend
mvn spring-boot:run
# Runs at http://localhost:8080
# Hibernate auto-creates/updates tables on startup (ddl-auto=update)
```

### Start Frontend
```bash
cd frontend
npm run dev
# Runs at http://localhost:5173
```

### How Frontend Talks to Backend
Vite has a **dev proxy** configured in `vite.config.js`:
- Any request to `/api/*` from the frontend gets **forwarded** to `http://localhost:8080`
- `/api` prefix is stripped before hitting the backend
- Example: `fetch('/api/books')` → hits `http://localhost:8080/books`

```
Browser → /api/books → Vite Proxy → localhost:8080/books → Spring Boot
```

---

## Database Tables (PostgreSQL)

Hibernate creates/updates these tables automatically on startup.

```
users
  id          BIGINT  PK
  name        VARCHAR
  username    VARCHAR (unique)
  password    VARCHAR (plain text)
  role        VARCHAR ('USER' or 'ADMIN')
  profile_id  BIGINT  FK → profiles.id

profiles
  id       BIGINT  PK
  email    VARCHAR
  phone    VARCHAR
  address  VARCHAR
  user_id  (back-reference via OneToOne)

authors
  id    BIGINT  PK
  name  VARCHAR
  bio   TEXT

books
  id                   BIGINT  PK
  title                VARCHAR
  image_url            VARCHAR
  description          TEXT
  publish_year         INT
  author_id            BIGINT  FK → authors.id
  borrowed_by_user_id  BIGINT  FK → users.id (NULL = available)

categories
  id    BIGINT  PK
  name  VARCHAR

book_category  (join table for Many-to-Many)
  book_id      BIGINT  FK → books.id
  category_id  BIGINT  FK → categories.id
```

---

## Entity Relationships

```
User  ──(1:1)──  Profile
  │
  └──(1:N)──  Book  (borrowed_by_user_id)
                │
                ├──(N:1)──  Author
                │
                └──(N:M)──  Category
                            (via book_category table)
```

---

## Role System (ADMIN vs USER)

### How roles are assigned
- **First user to register** → automatically gets `ADMIN`
- **All other users** → get `USER`
- Role is stored as a string in the `users.role` column

### How roles are enforced (Backend)
Every write/admin operation reads `X-User-Id` from the HTTP request header:
```
POST /books          → requires ADMIN
POST /authors        → requires ADMIN
PUT  /authors/{id}   → requires ADMIN
POST /categories     → requires ADMIN
GET  /users          → requires ADMIN
DELETE /users/{id}   → requires ADMIN
```

`UserService.requireAdmin(userId)` is called at the top of each protected method:
1. If header is missing → `401 Unauthorized`
2. If user not found → `401 Unauthorized`
3. If user role is not ADMIN → `403 Forbidden`

### How roles work (Frontend)
- After login/register, the `AuthResponse` includes `role: "ADMIN"` or `role: "USER"`
- This is stored in `localStorage` as part of the `user` object
- `api.js` automatically adds `X-User-Id` header to every request
- UI hides/shows admin features based on `user.role === 'ADMIN'`:
  - **Add Book** button → hidden for USER
  - **Add Author** + Edit Author button → hidden for USER
  - **Add Category** button → hidden for USER
  - **Members** nav link → hidden for USER (entire Users page blocked)

---

## Authentication Flow

```
Register                              Login
   │                                    │
   ▼                                    ▼
POST /api/auth/register             POST /api/auth/login
  { name, username, password,         { username/email, password }
    email, phone, address }                      │
         │                                       │
         ▼                                       ▼
  UserService.register()           UserService.login()
         │                                       │
  count() == 0 ?                   find by username OR email
    → role = ADMIN                 check password match
    → role = USER                           │
         │                                  │
         ▼                                  ▼
  AuthResponse {                    AuthResponse {
    id, name, username,               id, name, username,
    email, role, message              email, role, message
  }                                 }
         │                                  │
         ▼                                  ▼
  localStorage.setItem('user', JSON.stringify(data))
  navigate('/home')
```

---

## Complete API Reference

### Auth (`/auth`)
| Method | URL | Body | Auth | Description |
|--------|-----|------|------|-------------|
| POST | `/auth/register` | `{name, username, password, email, phone, address}` | None | Register new user |
| POST | `/auth/login` | `{username, password}` | None | Login (username or email) |

### Books (`/books`)
| Method | URL | Body/Params | Auth | Description |
|--------|-----|-------------|------|-------------|
| GET | `/books` | — | None | Get all books |
| GET | `/books/{id}` | — | None | Get single book |
| POST | `/books` | `{title, authorId, categoryIds[], imageUrl, description, publishYear}` | **ADMIN** | Add book |
| PUT | `/books/{id}/borrow/{userId}` | — | None | Borrow a book |
| PUT | `/books/{id}/return` | — | None | Return a book |

### Authors (`/authors`)
| Method | URL | Body | Auth | Description |
|--------|-----|------|------|-------------|
| GET | `/authors` | — | None | Get all authors |
| GET | `/authors/{id}` | — | None | Get single author |
| GET | `/authors/{id}/books` | — | None | Get books by author |
| POST | `/authors` | `{name, bio}` | **ADMIN** | Add author |
| PUT | `/authors/{id}` | `{name, bio}` | **ADMIN** | Update author |

### Categories (`/categories`)
| Method | URL | Body | Auth | Description |
|--------|-----|------|------|-------------|
| GET | `/categories` | — | None | Get all categories |
| POST | `/categories` | `{name}` | **ADMIN** | Add category |

### Users (`/users`)
| Method | URL | Body | Auth | Description |
|--------|-----|------|------|-------------|
| GET | `/users` | — | **ADMIN** | Get all users |
| GET | `/users/{id}` | — | None | Get single user |
| GET | `/users/{id}/books` | — | None | Get borrowed books of user |
| DELETE | `/users/{id}` | — | **ADMIN** | Delete user |
| PUT | `/users/{id}/profile` | `{name, email, phone, address, password}` | None | Update own profile |

> **Admin auth** is passed via HTTP header: `X-User-Id: <logged-in-user-id>`

---

## Frontend Page-by-Page

### `App.jsx` — Router
- Defines all routes
- `PrivateRoute` component checks `localStorage.getItem('user')` — if missing, redirects to `/login`
- Dashboard is the layout wrapper; all inner pages render inside it via `<Outlet />`

### `Dashboard.jsx` — Layout
- Renders the **sidebar** (logo, user info, nav, logout)
- `isAdmin` check hides "Members" nav link for non-admins
- Shows role badge: `👑 Admin` or `Member`
- Dark mode toggle stored in `localStorage`

### `Login.jsx`
- Form with email/username + password
- Calls `authAPI.login()` → stores response in `localStorage` as `user`

### `Register.jsx`
- 2-step form: Step 1 = username + password, Step 2 = email + phone + address
- Calls `authAPI.register()` → stores response in `localStorage` as `user`

### `Home.jsx`
- Shows live stats: total books, available, borrowed, authors, categories, members
- Fetches data from all APIs on load

### `Books.jsx`
- Lists all books with search + filter (All / Available / Borrowed)
- Each book shows title, author, categories, availability badge
- Borrow/Return button based on current user's borrowed status
- Add Book form (ADMIN only)

### `Authors.jsx`
- Lists all authors in a card grid
- Click to expand and see books by that author
- Inline edit form per card (ADMIN only)
- Add Author form (ADMIN only)

### `Categories.jsx`
- Lists all categories as icon cards
- Add Category form (ADMIN only)

### `Users.jsx`
- Lists all members with their borrowed books (expandable)
- Entire page blocked for non-admins (shows "Access Restricted")
- Admin-only

### `Profile.jsx`
- Shows current user's info (name, username, email, phone, address, role)
- Edit form to update name, email, phone, address, password

---

## `api.js` — How HTTP Calls Work

Every API call goes through the central `request()` function:

```
1. Read user from localStorage (to get id)
2. Add X-User-Id header automatically if user is logged in
3. Call fetch('/api' + url, options)
4. If response is not ok → parse error message → throw Error
5. If ok → parse JSON and return
```

Error messages are human-friendly — Spring's generic errors are replaced with clear messages (e.g., 409 → "Username already taken").

---

## Data Flow Example — Borrowing a Book

```
User clicks "Borrow" on Books.jsx
        │
        ▼
booksAPI.borrow(bookId, user.id)
        │
        ▼
PUT /api/books/5/borrow/3
  → Vite proxy → localhost:8080/books/5/borrow/3
        │
        ▼
BookController.borrowBook(id=5, userId=3)
        │
        ▼
BookService.borrowBook(5, 3)
  1. Find book by id 5 (throw 404 if not found)
  2. Check book.isAvailable() (throw 400 if already borrowed)
  3. Find user by id 3 (throw 404 if not found)
  4. book.setBorrowedBy(user)
  5. bookRepository.save(book)
        │
        ▼
Returns updated Book JSON { id:5, title:..., available:false, borrowedByUserId:3 }
        │
        ▼
Books.jsx updates state → UI re-renders showing "Return" button
```

---

## Data Flow Example — Adding a Book (Admin)

```
Admin fills form → clicks "Add Book"
        │
        ▼
booksAPI.create({ title, authorId, categoryIds, ... })
  → adds X-User-Id header automatically
        │
        ▼
POST /api/books  with header X-User-Id: 1
        │
        ▼
BookController.createBook(userId=1, request)
  1. userService.requireAdmin(1)
     → find user 1 → role == ADMIN → passes
  2. bookService.createBook(request)
     → find Author by authorId
     → find Categories by categoryIds
     → new Book() → set fields → save
        │
        ▼
Returns 201 Created + new Book JSON
        │
        ▼
Books.jsx adds new book to state → shows in list
```

---

## Security Notes

- No JWT — authentication is session-based via `localStorage`
- Admin checks are **manual** (no Spring Security) — `requireAdmin()` in UserService
- Passwords stored as **plain text** in DB (no hashing — development only)
- CORS allows `localhost:5173`, `localhost:5174`, `localhost:3000`
- `X-User-Id` header is the only auth mechanism for protected endpoints

---

## How to Run Full App (Step by Step)

1. Make sure **PostgreSQL** is running, DB `librarydb` exists, user `postgres` password `root`
2. Start backend:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
3. Start frontend:
   ```bash
   cd frontend
   npm install   # first time only
   npm run dev
   ```
4. Open `http://localhost:5173`
5. Register — **first account becomes Admin automatically**
6. Login and explore

---

## Build for Production

```bash
# Frontend build
cd frontend
npm run build
# Output: frontend/dist/

# Backend build
cd backend
mvn clean package
# Output: backend/target/*.jar
# Run: java -jar target/java-library-management-system-0.0.1-SNAPSHOT.jar
```
