const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db     = require('../data/db');
const auth   = require('../middleware/auth');

router.use(auth);

// GET all kids
router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM kids WHERE user_id=? ORDER BY created_at').all(req.userId));
});

// POST create kid
router.post('/', (req, res) => {
  const { name, dob, gender = 'boy', bio = '', height, weight, blood = 'O+', allergies = 'None', medical = 'None' } = req.body;
  if (!name || !dob) return res.status(400).json({ message: 'Name and date of birth are required' });
  const count = db.prepare('SELECT COUNT(*) as c FROM kids WHERE user_id=?').get(req.userId).c;
  const id    = uuidv4();
  db.prepare(`INSERT INTO kids(id,user_id,name,dob,gender,bio,height,weight,blood,allergies,medical,points,color_idx)
              VALUES(?,?,?,?,?,?,?,?,?,?,?,0,?)`)
    .run(id, req.userId, name, dob, gender, bio, parseFloat(height)||0, parseFloat(weight)||0, blood, allergies, medical, count % 4);
  res.status(201).json(db.prepare('SELECT * FROM kids WHERE id=?').get(id));
});

// GET single kid
router.get('/:id', (req, res) => {
  const kid = db.prepare('SELECT * FROM kids WHERE id=? AND user_id=?').get(req.params.id, req.userId);
  if (!kid) return res.status(404).json({ message: 'Not found' });
  res.json(kid);
});

// PUT update kid
router.put('/:id', (req, res) => {
  const kid = db.prepare('SELECT id FROM kids WHERE id=? AND user_id=?').get(req.params.id, req.userId);
  if (!kid) return res.status(404).json({ message: 'Not found' });
  const fields = ['name','dob','gender','bio','height','weight','blood','allergies','medical'];
  const updates = fields.filter(f => req.body[f] !== undefined);
  if (updates.length) {
    const sql = `UPDATE kids SET ${updates.map(f=>`${f}=?`).join(',')} WHERE id=?`;
    db.prepare(sql).run(...updates.map(f => req.body[f]), req.params.id);
  }
  res.json(db.prepare('SELECT * FROM kids WHERE id=?').get(req.params.id));
});

// DELETE kid
router.delete('/:id', (req, res) => {
  const kid = db.prepare('SELECT id FROM kids WHERE id=? AND user_id=?').get(req.params.id, req.userId);
  if (!kid) return res.status(404).json({ message: 'Not found' });
  db.prepare('DELETE FROM kids WHERE id=?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// POST health record
router.post('/:id/health', (req, res) => {
  const kid = db.prepare('SELECT * FROM kids WHERE id=? AND user_id=?').get(req.params.id, req.userId);
  if (!kid) return res.status(404).json({ message: 'Not found' });
  const h = parseFloat(req.body.height)  || kid.height;
  const w = parseFloat(req.body.weight)  || kid.weight;
  const bl= req.body.blood     || kid.blood;
  const al= req.body.allergies || kid.allergies;
  const md= req.body.medical   || kid.medical;
  db.prepare('UPDATE kids SET height=?,weight=?,blood=?,allergies=?,medical=? WHERE id=?').run(h,w,bl,al,md,kid.id);
  const rid = uuidv4();
  db.prepare(`INSERT INTO health_history(id,kid_id,user_id,height,weight,blood,allergies,medical) VALUES(?,?,?,?,?,?,?,?)`)
    .run(rid, kid.id, req.userId, h, w, bl, al, md);
  res.json({
    kid:    db.prepare('SELECT * FROM kids WHERE id=?').get(kid.id),
    record: db.prepare('SELECT * FROM health_history WHERE id=?').get(rid),
  });
});

// GET health history
router.get('/:id/health', (req, res) => {
  const rows = db.prepare('SELECT * FROM health_history WHERE kid_id=? AND user_id=? ORDER BY created_at DESC').all(req.params.id, req.userId);
  res.json(rows);
});

module.exports = router;
