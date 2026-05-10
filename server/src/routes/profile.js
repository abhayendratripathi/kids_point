const router = require('express').Router();
const db   = require('../data/db');
const auth = require('../middleware/auth');

const safe = (u) => { const { password: _, ...rest } = u; return rest; };
router.use(auth);

router.get('/', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id=?').get(req.userId);
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json(safe(user));
});

router.put('/', (req, res) => {
  const allowed = ['first_name','last_name','phone','family'];
  // Support both camelCase (from React) and snake_case
  const map = { firstName:'first_name', lastName:'last_name', phone:'phone', family:'family' };
  const updates = {};
  for (const [k,v] of Object.entries(req.body)) {
    const col = map[k] || (allowed.includes(k) ? k : null);
    if (col) updates[col] = v;
  }
  if (Object.keys(updates).length) {
    const sets = Object.keys(updates).map(k=>`${k}=?`).join(',');
    db.prepare(`UPDATE users SET ${sets} WHERE id=?`).run(...Object.values(updates), req.userId);
  }
  const user = db.prepare('SELECT * FROM users WHERE id=?').get(req.userId);
  res.json(safe(user));
});

module.exports = router;
