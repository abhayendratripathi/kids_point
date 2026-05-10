const express = require('express');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.use('/api/auth',       require('./routes/auth'));
app.use('/api/kids',       require('./routes/kids'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/history',    require('./routes/history'));
app.use('/api/profile',    require('./routes/profile'));

app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', db: 'sqlite', ts: new Date().toISOString() })
);

app.listen(PORT, () =>
  console.log(`🚀 KidPoints API → http://localhost:${PORT}`)
);
