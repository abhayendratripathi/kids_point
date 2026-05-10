const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

app.use('/api/auth',       require('./routes/auth'));
app.use('/api/kids',       require('./routes/kids'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/history',    require('./routes/history'));
app.use('/api/profile',    require('./routes/profile'));

app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', db: 'sqlite', ts: new Date().toISOString() })
);

// ✅ Serve React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/build/index.html'));
  });
}

app.listen(PORT, () =>
  console.log(`🚀 KidPoints running on port ${PORT}`)
);