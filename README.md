# Express API with Multiple Route Files - Complete Guide

## Project Structure

```text
project/
├── routes/
│   ├── auth/
│   │   ├── login.js
│   │   ├── register.js
│   │   └── index.js
│   ├── users/
│   │   └── index.js
│   └── index.js           # Main routes aggregator
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── config/
│   └── db.js              # Database configuration
├── server.js
├── .env
└── package.json
```

## Dependencies (package.json)

```json
{
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3",
    "mysql2": "^3.22.5",
    "nodemon": "^3.1.14"
  }
}
```

---

## Step 1: Environment Variables (.env)

Create a `.env` file in your project root:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database
JWT_SECRET=your_super_secret_jwt_key_change_this
```

---

## Step 2: Database Configuration

Create `config/db.js`:

```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'your_database',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
```

---

## Step 3: Authentication Middleware

Create `middleware/auth.js`:

```javascript
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
```

---

## Step 4: Create Route Files

### 4.1 Login Route

Create `routes/auth/login.js`:

```javascript
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../config/db');
require('dotenv').config();

router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
```

### 4.2 Register Route

Create `routes/auth/register.js`:

```javascript
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../../config/db');

router.post('/', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Username, email, and password are required'
      });
    }

    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        error: 'User with this email or username already exists'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    res.status(201).json({
      message: 'User registered successfully',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
```

### 4.3 Auth Routes Index

Create `routes/auth/index.js`:

```javascript
const express = require('express');
const router = express.Router();
const loginRouter = require('./login');
const registerRouter = require('./register');

router.use('/login', loginRouter);
router.use('/register', registerRouter);

module.exports = router;
```

### 4.4 Users Route

Create `routes/users/index.js`:

```javascript
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth');
const pool = require('../../config/db');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, email, created_at FROM users'
    );

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
```

---

## Step 5: Main Routes Aggregator

Create `routes/index.js`:

```javascript
const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const userRoutes = require('./users');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = router;
```

---

## Step 6: Main Server File

Create `server.js`:

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const apiRoutes = require('./routes');

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
```

---

## Step 7: React Frontend Integration

### Create API Service

Create `src/services/api.js` in your React app:

```javascript
const API_URL = 'http://localhost:3000/api';

export const authService = {
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  register: async (username, email, password) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    return response.json();
  }
};

export const userService = {
  getUsers: async (token) => {
    const response = await fetch(`${API_URL}/users`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    return response.json();
  },

  getUserById: async (id, token) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    return response.json();
  }
};
```

### React Component Example

```jsx
import React, { useState } from 'react';
import { authService } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = await authService.login(email, password);

      if (data.error) {
        setError(data.error);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/dashboard';
    } catch (err) {
      setError('An error occurred during login');
      console.error('Login error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
```

---

## API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST   | `/api/auth/login` | User login | No |
| POST   | `/api/auth/register` | User registration | No |
| GET    | `/api/users` | Get all users | Yes |
| GET    | `/api/users/:id` | Get single user | Yes |
| GET    | `/api/health` | Health check | No |

---

## How to Add New Routes

### Example: Adding a Products Module

1. Create the route file - `routes/products/index.js`:

```javascript
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth');
const pool = require('../../config/db');

router.get('/', async (req, res) => {
  try {
    const [products] = await pool.query('SELECT * FROM products');
    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const [result] = await pool.query(
      'INSERT INTO products (name, price, description) VALUES (?, ?, ?)',
      [name, price, description]
    );
    res.status(201).json({
      message: 'Product created',
      productId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
```

2. Import in main routes - Update `routes/index.js`:

```javascript
const productRoutes = require('./products');

router.use('/products', productRoutes);
```

New endpoints will be automatically available:
- `GET /api/products`
- `POST /api/products`

---

## Running the Application

1. Install dependencies:

```bash
npm install
```

2. Create MySQL database and table:

```sql
CREATE DATABASE your_database;
USE your_database;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

3. Start the server:

```bash
node server.js
# or with nodemon
nodemon server.js
```

4. Start React app (in separate terminal):

```bash
npm start
# or
npm run dev
```

---

## Best Practices Checklist

- ✅ Modular route files for better organization
- ✅ Centralized error handling
- ✅ JWT authentication middleware
- ✅ Environment variables for configuration
- ✅ MySQL connection pooling
- ✅ Input validation
- ✅ Password hashing with bcrypt
- ✅ CORS configuration for React frontend
- ✅ Easy to add new route modules
- ✅ Consistent API response format

## Common Issues & Solutions

### CORS Issues

- Ensure `cors` middleware is configured before routes
- Update the origin URL to match your React app's URL
- For development, you can use `origin: '*'` (not recommended for production)

### Database Connection Issues

- Verify MySQL is running
- Check credentials in `.env` file
- Ensure database and table exist

### JWT Issues

- Make sure `JWT_SECRET` is set in `.env`
- Token expires after 24 hours by default
- Send token as: `Authorization: Bearer your_token_here`

### Route Not Found

- Check URL spelling and method (GET/POST)
- Verify route is properly mounted in `routes/index.js`
- All API routes should start with `/api/`
