require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const { initFirebase } = require('./services/firebase');

initFirebase();

const authRoutes = require('./routes/auth');
const calendarRoutes = require('./routes/calendar');
const schedulesRoutes = require('./routes/schedules');
const userRoutes = require('./routes/user');
const groupMeRoutes = require('./routes/groupme');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'adbee-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
}));

app.use('/auth', authRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/schedules', schedulesRoutes);
app.use('/api/user', userRoutes);
app.use('/api/groupme', groupMeRoutes);

app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`adBeeWork running at http://localhost:${PORT}`);
  });
}

module.exports = app;
