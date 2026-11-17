const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'LAB_04_SECRET_KEY';
const SALT_ROUNDS = 10;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password TEXT NOT NULL
    )
  `);
});

function validateRegisterInput(username, name, password) {
  if (!username || !name || !password) {
    return 'username, name and password are required';
  }
  if (typeof username !== 'string' || typeof name !== 'string' || typeof password !== 'string') {
    return 'username, name and password must be strings';
  }
  if (username.trim().length < 3) return 'username must contain at least 3 characters';
  if (password.length < 6) return 'password must contain at least 6 characters';
  return null;
}

app.get('/', (req, res) => {
  res.json({
    message: 'Lab 4 API is running',
    endpoints: ['POST /register', 'POST /login']
  });
});

app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test.html'));
});

app.get(['/register', '/login'], (req, res) => {
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    return res.redirect('/test');
  }
  res.status(404).json({ error: 'Route not found. Use POST for this endpoint.' });
});

app.post('/reset-db', (req, res) => {
  db.run('DELETE FROM users', (err) => {
    if (err) return res.status(500).json({ error: 'Failed to reset database' });
    res.json({ message: 'Database reset successfully' });
  });
});

app.post('/register', async (req, res) => {
  try {
    const { username, name, password } = req.body;
    const validationError = validateRegisterInput(username, name, password);
    if (validationError) return res.status(400).json({ error: validationError });

    const cleanUsername = username.trim();
    const cleanName = name.trim();

    db.get('SELECT id FROM users WHERE username = ?', [cleanUsername], async (err, user) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (user) return res.status(400).json({ error: 'Username already exists' });

      try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        db.run(
          'INSERT INTO users (username, name, password) VALUES (?, ?, ?)',
          [cleanUsername, cleanName, hashedPassword],
          function (insertErr) {
            if (insertErr) return res.status(500).json({ error: 'Could not register user' });
            return res.status(201).json({
              message: 'User registered successfully',
              user: { id: this.lastID, username: cleanUsername, name: cleanName }
            });
          }
        );
      } catch (hashError) {
        return res.status(500).json({ error: 'Could not hash password' });
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username.trim()], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(400).json({ error: 'Invalid username or password' });

    try {
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(400).json({ error: 'Invalid username or password' });
      }

      // Only the username is included in the JWT payload.
      const jwt_token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
      return res.status(200).json({ jwt_token });
    } catch (compareError) {
      return res.status(500).json({ error: 'Login failed' });
    }
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
