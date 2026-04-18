const express = require('express');
const router = express.Router();
const { PlaidApi, PlaidEnvironments, Configuration, Products, CountryCode } = require('plaid');

const config = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(config);

router.post('/create-link-token', async (req, res) => {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: 'finlit-user' },
      client_name: 'FinLit',
      products: [Products.Transactions, Products.Liabilities],
      country_codes: [CountryCode.Us],
      language: 'en',
    });
    res.json({ link_token: response.data.link_token });
  } catch (err) {
    console.error('create-link-token error', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to create link token' });
  }
});

router.post('/exchange-token', async (req, res) => {
  const { public_token } = req.body;
  try {
    const response = await plaidClient.itemPublicTokenExchange({ public_token });
    req.session.accessToken = response.data.access_token;
    res.json({ success: true });
  } catch (err) {
    console.error('exchange-token error', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to exchange token' });
  }
});

router.get('/accounts', async (req, res) => {
  const accessToken = req.session.accessToken;
  if (!accessToken) return res.status(401).json({ error: 'Not connected' });
  try {
    const [accounts, liabilities] = await Promise.all([
      plaidClient.accountsGet({ access_token: accessToken }),
      plaidClient.liabilitiesGet({ access_token: accessToken }),
    ]);
    res.json({
      accounts: accounts.data.accounts,
      liabilities: liabilities.data.liabilities,
    });
  } catch (err) {
    console.error('accounts error', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

router.get('/transactions', async (req, res) => {
  const accessToken = req.session.accessToken;
  if (!accessToken) return res.status(401).json({ error: 'Not connected' });
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  try {
    const response = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
    });
    res.json({ transactions: response.data.transactions });
  } catch (err) {
    console.error('transactions error', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

module.exports = router;
