const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db   = require('../data/db');
const auth = require('../middleware/auth');

router.use(auth);

// GET history (optional ?kidId= &limit=)
router.get('/', (req, res) => {
  const limit  = parseInt(req.query.limit) || 100;
  const kidId  = req.query.kidId;
  const rows   = kidId
    ? db.prepare('SELECT * FROM history WHERE user_id=? AND kid_id=? ORDER BY created_at DESC LIMIT ?').all(req.userId, kidId, limit)
    : db.prepare('SELECT * FROM history WHERE user_id=? ORDER BY created_at DESC LIMIT ?').all(req.userId, limit);
  res.json(rows);
});

// POST assign activity → kid
router.post('/assign', (req, res) => {
  const { kidId, activityId, note = '' } = req.body;
  if (!kidId || !activityId)
    return res.status(400).json({ message: 'kidId and activityId are required' });

  const kid = db.prepare('SELECT * FROM kids WHERE id=? AND user_id=?').get(kidId, req.userId);
  const act = db.prepare('SELECT * FROM activities WHERE id=? AND user_id=?').get(activityId, req.userId);
  if (!kid) return res.status(404).json({ message: 'Kid not found' });
  if (!act) return res.status(404).json({ message: 'Activity not found' });

  const pts     = act.type === 'positive' ? act.points : -act.points;
  const newPts  = kid.points + pts;
  db.prepare('UPDATE kids SET points=? WHERE id=?').run(newPts, kidId);

  const id = uuidv4();
  db.prepare(`INSERT INTO history(id,user_id,kid_id,activity_id,name,icon,points,type,note) VALUES(?,?,?,?,?,?,?,?,?)`)
    .run(id, req.userId, kidId, activityId, act.name, act.icon, pts, act.type, note);

  res.status(201).json({
    entry:     db.prepare('SELECT * FROM history WHERE id=?').get(id),
    kidPoints: newPts,
  });
});

// POST manual point adjustment
router.post('/manual', (req, res) => {
  const { kidId, points, note = '' } = req.body;
  const pts = parseInt(points);
  if (!kidId || !pts)
    return res.status(400).json({ message: 'kidId and non-zero points are required' });

  const kid = db.prepare('SELECT * FROM kids WHERE id=? AND user_id=?').get(kidId, req.userId);
  if (!kid) return res.status(404).json({ message: 'Kid not found' });

  const newPts = kid.points + pts;
  db.prepare('UPDATE kids SET points=? WHERE id=?').run(newPts, kidId);

  const id   = uuidv4();
  const icon = pts > 0 ? '⭐' : '📉';
  db.prepare(`INSERT INTO history(id,user_id,kid_id,name,icon,points,type,note) VALUES(?,?,?,?,?,?,?,?)`)
    .run(id, req.userId, kidId, 'Manual Adjustment', icon, pts, 'manual', note);

  res.status(201).json({
    entry:     db.prepare('SELECT * FROM history WHERE id=?').get(id),
    kidPoints: newPts,
  });
});

// DELETE (undo) history entry — reverses points
router.delete('/:id', (req, res) => {
  const h = db.prepare('SELECT * FROM history WHERE id=? AND user_id=?').get(req.params.id, req.userId);
  if (!h) return res.status(404).json({ message: 'Not found' });
  db.prepare('UPDATE kids SET points=points-? WHERE id=?').run(h.points, h.kid_id);
  db.prepare('DELETE FROM history WHERE id=?').run(req.params.id);
  res.json({ message: 'Entry reversed' });
});

module.exports = router;
