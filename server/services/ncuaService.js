const axios = require('axios');

let cachedRates = null;

async function fetchAndCacheRates() {
  try {
    // TODO: parse the actual NCUA HTML/CSV when the data format is confirmed
    // For now, seed with representative placeholder data so the chart renders
    cachedRates = {
      lastFetched: new Date().toISOString(),
      series: [
        { date: 'Q1 2022', creditUnion: 10.8, bank: 14.1 },
        { date: 'Q2 2022', creditUnion: 11.0, bank: 14.4 },
        { date: 'Q3 2022', creditUnion: 11.3, bank: 14.9 },
        { date: 'Q4 2022', creditUnion: 11.6, bank: 15.3 },
        { date: 'Q1 2023', creditUnion: 11.8, bank: 15.7 },
        { date: 'Q2 2023', creditUnion: 12.0, bank: 16.0 },
        { date: 'Q3 2023', creditUnion: 12.2, bank: 16.3 },
        { date: 'Q4 2023', creditUnion: 12.1, bank: 16.1 },
        { date: 'Q1 2024', creditUnion: 12.0, bank: 16.0 },
        { date: 'Q2 2024', creditUnion: 11.9, bank: 15.8 },
      ],
      latest: { creditUnion: 11.9, bank: 15.8 },
    };
    console.log('NCUA rate data cached (placeholder — wire up real fetch)');
  } catch (err) {
    console.error('Failed to fetch NCUA rates:', err.message);
  }
}

function getCachedRates() {
  return cachedRates;
}

module.exports = { fetchAndCacheRates, getCachedRates };
