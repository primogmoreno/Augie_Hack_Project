require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');

const plaidRoutes = require('./routes/plaid');
const geminiRoutes = require('./routes/gemini');
const ratesRoutes = require('./routes/rates');

const { fetchAndCacheRates } = require('./services/ncuaService');

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'finlit-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true },
}));

app.use('/api/plaid', plaidRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/rates', ratesRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`FinLit server running on port ${PORT}`);
  await fetchAndCacheRates();
});
