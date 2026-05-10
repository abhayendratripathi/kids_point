const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db   = require('../data/db');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM activities WHERE user_id=? ORDER BY type, created_at').all(req.userId));
});

router.post('/', (req, res) => {
  const { name, description = '', icon = '✦', type, points } = req.body;
  if (!name || !type || !points)
    return res.status(400).json({ message: 'Name, type and points are required' });
  const id = uuidv4();
  db.prepare('INSERT INTO activities(id,user_id,name,description,icon,type,points) VALUES(?,?,?,?,?,?,?)')
    .run(id, req.userId, name, description, icon, type, parseInt(points));
  res.status(201).json(db.prepare('SELECT * FROM activities WHERE id=?').get(id));
});

router.put('/:id', (req, res) => {
  const act = db.prepare('SELECT id FROM activities WHERE id=? AND user_id=?').get(req.params.id, req.userId);
  if (!act) return res.status(404).json({ message: 'Not found' });
  const fields = ['name','description','icon','type','points'];
  const updates = fields.filter(f => req.body[f] !== undefined);
  if (updates.length) {
    db.prepare(`UPDATE activities SET ${updates.map(f=>`${f}=?`).join(',')} WHERE id=?`)
      .run(...updates.map(f => req.body[f]), req.params.id);
  }
  res.json(db.prepare('SELECT * FROM activities WHERE id=?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const act = db.prepare('SELECT id FROM activities WHERE id=? AND user_id=?').get(req.params.id, req.userId);
  if (!act) return res.status(404).json({ message: 'Not found' });
  db.prepare('DELETE FROM activities WHERE id=?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
