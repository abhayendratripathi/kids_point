const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, '..', '..', 'kidpoints.db');
const db = new Database(DB_PATH);

// Performance + integrity
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── SCHEMA ────────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    first_name  TEXT NOT NULL,
    last_name   TEXT DEFAULT '',
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    phone       TEXT DEFAULT '',
    family      TEXT DEFAULT '',
    created_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS kids (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    dob         TEXT NOT NULL,
    gender      TEXT DEFAULT 'boy',
    bio         TEXT DEFAULT '',
    height      REAL DEFAULT 0,
    weight      REAL DEFAULT 0,
    blood       TEXT DEFAULT 'O+',
    allergies   TEXT DEFAULT 'None',
    medical     TEXT DEFAULT 'None',
    points      INTEGER DEFAULT 0,
    color_idx   INTEGER DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS activities (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    description TEXT DEFAULT '',
    icon        TEXT DEFAULT '✦',
    type        TEXT NOT NULL CHECK(type IN ('positive','negative')),
    points      INTEGER NOT NULL,
    created_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS history (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kid_id      TEXT NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
    activity_id TEXT,
    name        TEXT NOT NULL,
    icon        TEXT DEFAULT '⭐',
    points      INTEGER NOT NULL,
    type        TEXT NOT NULL,
    note        TEXT DEFAULT '',
    created_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS health_history (
    id          TEXT PRIMARY KEY,
    kid_id      TEXT NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
    user_id     TEXT NOT NULL,
    height      REAL,
    weight      REAL,
    blood       TEXT,
    allergies   TEXT,
    medical     TEXT,
    created_at  TEXT DEFAULT (datetime('now'))
  );
`);

// ── SEED DEMO DATA ────────────────────────────────────────────────────────────
const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@kidpoints.com');
if (!existing) {
  const uid  = uuidv4();
  const hash = bcrypt.hashSync('demo1234', 10);

  db.prepare(`INSERT INTO users(id,first_name,last_name,email,password,phone,family)
              VALUES(?,?,?,?,?,?,?)`)
    .run(uid,'Rahul','Sharma','demo@kidpoints.com',hash,'+91 98765 43210','The Sharma Family');

  const k1 = uuidv4(), k2 = uuidv4();
  const insertKid = db.prepare(`
    INSERT INTO kids(id,user_id,name,dob,gender,bio,height,weight,blood,allergies,medical,points,color_idx)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  insertKid.run(k1,uid,'Aarav','2015-03-10','boy','Loves science and cricket. Very curious about space!',130,28,'O+','None','None',45,0);
  insertKid.run(k2,uid,'Diya','2017-07-22','girl','Creative, loves painting and reading fairy tales.',115,22,'B+','Pollen','None',62,1);

  const insertAct = db.prepare(`INSERT INTO activities(id,user_id,name,description,icon,type,points) VALUES(?,?,?,?,?,?,?)`);
  const acts = [
    ['Complete Homework','Finish all school assignments','📚','positive',3],
    ['Study at Home','Extra study time at home','📖','positive',2],
    ['Help with Chores','Clean room, wash dishes etc.','🧹','positive',2],
    ['Read a Book','Read for 30+ minutes','📕','positive',3],
    ['Exercise / Play Sports','Physical activity 45+ mins','⚽','positive',2],
    ['Be Kind / Help Others','Acts of kindness','💛','positive',4],
    ['Mobile Use 1 Hour','Using phone/tablet for 1 hour','📱','negative',3],
    ['TV > 2 Hours','Excessive TV time','📺','negative',2],
    ['Skip Homework','Not completing school work','🙈','negative',4],
    ['Fight / Misbehave','Bad behavior or fighting','😤','negative',3],
    ['Junk Food','Eating unhealthy snacks','🍟','negative',1],
  ];
  acts.forEach(a => insertAct.run(uuidv4(),uid,...a));

  const insertHist = db.prepare(`
    INSERT INTO history(id,user_id,kid_id,name,icon,points,type,note,created_at) VALUES(?,?,?,?,?,?,?,?,?)`);
  const now = Date.now();
  const d = (ms) => new Date(now - ms).toISOString();
  insertHist.run(uuidv4(),uid,k1,'Complete Homework','📚',3,'positive','Finished all chapters!', d(86400000));
  insertHist.run(uuidv4(),uid,k2,'Read a Book','📕',3,'positive','', d(86400000));
  insertHist.run(uuidv4(),uid,k1,'Mobile Use 1 Hour','📱',-3,'negative','Too much YouTube', d(172800000));
  insertHist.run(uuidv4(),uid,k2,'Help with Chores','🧹',2,'positive','', d(172800000));

  console.log('✅ Demo data seeded → demo@kidpoints.com / demo1234');
}

module.exports = db;
