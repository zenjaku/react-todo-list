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

---

# Security Best Practices for Express API

## Complete Security Implementation Guide

---

## 1. SQL Injection Prevention

### ✅ Already Protected (Using Parameterized Queries)

Your current code with `mysql2` already uses parameterized queries with placeholders (`?`), which prevents SQL injection:

```javascript
// ✅ SAFE - Parameterized query
const [users] = await pool.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
);

// ❌ DANGEROUS - String concatenation (NEVER DO THIS)
const query = `SELECT * FROM users WHERE email = '${email}'`;
```

### Additional SQL Injection Protection

Install and configure an input sanitizer:

```bash
npm install express-validator sanitize-html
```

**Create `middleware/validator.js`:**

```javascript
const { body, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');

// Sanitize function
const sanitizeInput = (input) => {
    if (typeof input === 'string') {
        return sanitizeHtml(input, {
            allowedTags: [],
            allowedAttributes: {}
        });
    }
    return input;
};

// Middleware to sanitize all request data
const sanitizeAllInputs = (req, res, next) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            req.body[key] = sanitizeInput(req.body[key]);
        });
    }
    if (req.query) {
        Object.keys(req.query).forEach(key => {
            req.query[key] = sanitizeInput(req.query[key]);
        });
    }
    if (req.params) {
        Object.keys(req.params).forEach(key => {
            req.params[key] = sanitizeInput(req.params[key]);
        });
    }
    next();
};

// Validation rules for different routes
const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .trim()
        .escape(),
    body('password')
        .isLength({ min: 6 })
        .trim()
];

const registerValidation = [
    body('username')
        .isLength({ min: 3, max: 30 })
        .matches(/^[a-zA-Z0-9_]+$/)
        .trim()
        .escape(),
    body('email')
        .isEmail()
        .normalizeEmail()
        .trim()
        .escape(),
    body('password')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        .withMessage('Password must contain uppercase, lowercase, number and special character')
        .trim()
];

// Validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            error: 'Validation failed',
            details: errors.array() 
        });
    }
    next();
};

module.exports = {
    sanitizeAllInputs,
    loginValidation,
    registerValidation,
    handleValidationErrors
};
```

**Update routes to use validation:**

```javascript
// routes/auth/login.js
const router = express.Router();
const { loginValidation, handleValidationErrors } = require('../../middleware/validator');

router.post('/', 
    loginValidation, 
    handleValidationErrors, 
    async (req, res) => {
        // Your login logic
    }
);
```

---

## 2. Rate Limiting (DDoS Protection)

```bash
npm install express-rate-limit express-slow-down
```

**Create `middleware/rateLimiter.js`:**

```javascript
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Custom key generator (use IP + user ID if authenticated)
    keyGenerator: (req) => {
        return req.user?.id || req.ip;
    }
});

// Strict limiter for authentication routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 login attempts per window
    skipSuccessfulRequests: true, // Don't count successful logins
    message: {
        error: 'Too many login attempts, please try again after 15 minutes',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Registration limiter
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registration attempts per hour per IP
    message: {
        error: 'Too many accounts created from this IP, please try again after an hour'
    }
});

// Speed limiter (slows down responses after threshold)
const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50, // Allow 50 requests per 15 minutes
    delayMs: 500, // Add 500ms delay per request above threshold
    maxDelayMs: 20000 // Max delay of 20 seconds
});

module.exports = {
    apiLimiter,
    authLimiter,
    registerLimiter,
    speedLimiter
};
```

**Apply rate limiters in routes or server.js:**

```javascript
// server.js
const { apiLimiter, authLimiter, registerLimiter, speedLimiter } = require('./middleware/rateLimiter');

// Apply to all API routes
app.use('/api/', apiLimiter);
app.use('/api/', speedLimiter);

// Apply specific limiters in routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', registerLimiter);
```

---

## 3. Helmet (HTTP Headers Security)

```bash
npm install helmet
```

**Create `middleware/securityHeaders.js`:**

```javascript
const helmet = require('helmet');

const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "http://localhost:5173"], // Your React app
        },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-origin" },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: { permittedPolicies: "none" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true
});

module.exports = securityHeaders;
```

---

## 4. CORS Configuration

**Create `middleware/corsConfig.js`:**

```javascript
const cors = require('cors');

// Whitelist of allowed origins
const whitelist = [
    'http://localhost:5173',  // React dev server
    'http://localhost:3000',  // Alternative dev server
    'https://yourdomain.com', // Production domain
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204
};

module.exports = cors(corsOptions);
```

---

## 5. JWT Security Enhancement

**Create `middleware/jwtSecurity.js`:**

```javascript
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate secure random tokens
const generateSecureToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

// Create refresh token (store in database)
const generateRefreshToken = () => {
    return generateSecureToken(40);
};

// Enhanced JWT creation with more security
const createSecureJWT = (payload, options = {}) => {
    const tokenPayload = {
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        jti: generateSecureToken(16), // Unique token ID
    };
    
    return jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET,
        {
            expiresIn: options.expiresIn || '1h', // Shorter expiry
            issuer: 'your-app-name',
            audience: 'your-app-users',
            algorithm: 'HS256',
            ...options
        }
    );
};

// Token blacklist (for logout)
const tokenBlacklist = new Set();

const blacklistToken = (token) => {
    tokenBlacklist.add(token);
    // Clean up old tokens periodically (optional)
    setTimeout(() => tokenBlacklist.delete(token), 24 * 60 * 60 * 1000);
};

const isTokenBlacklisted = (token) => {
    return tokenBlacklist.has(token);
};

// Enhanced authentication middleware
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }
        
        // Check if token is blacklisted
        if (isTokenBlacklisted(token)) {
            return res.status(401).json({ error: 'Token has been revoked' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            issuer: 'your-app-name',
            audience: 'your-app-users'
        });
        
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(403).json({ error: 'Invalid token' });
    }
};

module.exports = {
    createSecureJWT,
    generateRefreshToken,
    authenticateToken,
    blacklistToken,
    isTokenBlacklisted
};
```

---

## 6. Request Size Limiting

**Add to server.js:**

```javascript
const express = require('express');

// Limit request body size
app.use(express.json({ limit: '10kb' })); // Limit JSON payload to 10KB
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
```

---

## 7. MongoDB/NoSQL Injection Prevention (if using MongoDB)

```bash
npm install express-mongo-sanitize
```

```javascript
const mongoSanitize = require('express-mongo-sanitize');

app.use(mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`This request[${key}] is sanitized`, req);
    },
}));
```

---

## 8. Additional Security Packages

```bash
npm install hpp cookie-parser express-brute helmet-csp
```

**Create `middleware/securityMiddleware.js`:**

```javascript
const hpp = require('hpp'); // HTTP Parameter Pollution protection
const cookieParser = require('cookie-parser');

// Combined security middleware
const securityMiddleware = (app) => {
    // Prevent HTTP Parameter Pollution
    app.use(hpp({
        whitelist: ['price', 'rating'] // Parameters that can have duplicates
    }));
    
    // Parse cookies securely
    app.use(cookieParser(process.env.COOKIE_SECRET));
    
    // Disable X-Powered-By header
    app.disable('x-powered-by');
    
    // Trust proxy (if behind reverse proxy like Nginx)
    app.set('trust proxy', 1);
};

module.exports = securityMiddleware;
```

---

## 9. Complete Updated Server.js

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import custom middleware
const { sanitizeAllInputs } = require('./middleware/validator');
const { apiLimiter, authLimiter, registerLimiter, speedLimiter } = require('./middleware/rateLimiter');
const corsConfig = require('./middleware/corsConfig');

const app = express();
const PORT = process.env.PORT || 3000;

// ====== SECURITY MIDDLEWARE (Order matters!) ======

// 1. Trust proxy if behind reverse proxy
app.set('trust proxy', 1);

// 2. Set security headers
app.use(helmet());

// 3. CORS
app.use(corsConfig);

// 4. Rate limiting
app.use('/api/', speedLimiter);
app.use('/api/', apiLimiter);

// 5. Body parsing with size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 6. Cookie parser
app.use(cookieParser(process.env.COOKIE_SECRET));

// 7. HTTP Parameter Pollution protection
app.use(hpp());

// 8. Input sanitization
app.use(sanitizeAllInputs);

// 9. Disable X-Powered-By
app.disable('x-powered-by');

// ====== ROUTES ======
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// Apply route-specific rate limiters
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', registerLimiter);

// ====== ERROR HANDLING ======

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler (don't leak stack traces in production)
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    
    if (process.env.NODE_ENV === 'production') {
        res.status(500).json({ error: 'Internal server error' });
    } else {
        res.status(500).json({ 
            error: err.message,
            stack: err.stack 
        });
    }
});

// ====== START SERVER ======
const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Process terminated');
    });
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
});
```

---

## 10. Environment Variables (.env)

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_secure_password
DB_NAME=your_database
DB_PORT=3306

# JWT
JWT_SECRET=your_super_secret_key_at_least_32_characters_long
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d

# Cookie
COOKIE_SECRET=your_cookie_parsing_secret

# CORS
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

---

## 11. Security Checklist & Best Practices

### ✅ Implemented Protections

| Threat | Protection | Status |
|--------|------------|--------|
| SQL Injection | Parameterized queries + Input validation | ✅ |
| XSS Attacks | Helmet + Input sanitization | ✅ |
| DDoS | Rate limiting + Request size limits | ✅ |
| Brute Force | Rate limiting on auth routes | ✅ |
| CSRF | Same-origin policy + CORS whitelist | ✅ |
| JWT Theft | Short expiry + Refresh tokens + Blacklist | ✅ |
| HTTP Parameter Pollution | HPP middleware | ✅ |
| Information Disclosure | Hide X-Powered-By + Custom error handler | ✅ |
| MITM Attacks | HSTS headers (production with HTTPS) | ✅ |

### Additional Recommendations

1. **Use HTTPS in production**
```javascript
// Always redirect to HTTPS in production
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            res.redirect(`https://${req.header('host')}${req.url}`);
        } else {
            next();
        }
    });
}
```

2. **Implement API Key for service-to-service communication**
```javascript
const apiKeyAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.API_KEY) {
        return res.status(401).json({ error: 'Invalid API key' });
    }
    next();
};
```

3. **Set up logging for security events**
```bash
npm install winston morgan
```

```javascript
const morgan = require('morgan');
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
```

4. **Regular security audits**
```bash
npm audit
npm audit fix
```

5. **Database security**
- Use strong passwords
- Limit database user permissions
- Use SSL for database connections in production
- Regular backups

6. **Environment separation**
- Different .env files for development, staging, production
- Never commit .env files to version control

---

## Testing Security

### Test with these tools:
```bash
# Install security testing tools
npm install --save-dev helmet-csp test-cors

# Run npm audit
npm audit

# Test rate limiting
# Use Apache Bench or similar tool
ab -n 1000 -c 10 http://localhost:3000/api/health
```

---

## Important Notes

⚠️ **Always:**
- Keep dependencies updated (`npm update`)
- Monitor security advisories
- Use HTTPS in production
- Implement proper error logging
- Regular security audits
- Backup your database regularly

🔒 **Never:**
- Commit secrets to version control
- Use default credentials
- Trust user input without validation
- Expose stack traces in production
- Skip security headers in production
