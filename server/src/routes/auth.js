const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db      = require('../data/db');
const authMw  = require('../middleware/auth');

const SECRET = process.env.JWT_SECRET || 'kidpoints_secret_2024';
const token  = (id) => jwt.sign({ userId: id }, SECRET, { expiresIn: '7d' });
const safe   = (u)  => { const { password: _, ...rest } = u; return rest; };

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName = '', email, password, phone = '' } = req.body;
    if (!firstName || !email || !password)
      return res.status(400).json({ message: 'First name, email and password are required' });
    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    if (db.prepare('SELECT id FROM users WHERE email=?').get(email))
      return res.status(409).json({ message: 'Email already registered' });

    const id   = uuidv4();
    const hash = await bcrypt.hash(password, 10);
    db.prepare(`INSERT INTO users(id,first_name,last_name,email,password,phone,family) VALUES(?,?,?,?,?,?,?)`)
      .run(id, firstName, lastName, email, hash, phone, `The ${lastName || firstName} Family`);

    const user = db.prepare('SELECT * FROM users WHERE id=?').get(id);
    res.status(201).json({ token: token(id), user: safe(user) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email=?').get(email);
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ token: token(user.id), user: safe(user) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/auth/me
router.get('/me', authMw, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id=?').get(req.userId);
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json(safe(user));
});

module.exports = router;
