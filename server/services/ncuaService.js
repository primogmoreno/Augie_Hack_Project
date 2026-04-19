const axios = require('axios');

const NCUA_URL = 'https://ncua.gov/analysis/cuso-economic-data/credit-union-bank-rates';

// Fallback data used when the live fetch or parse fails
const FALLBACK = {
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

let cachedRates = null;

// Parse NCUA HTML table rows for credit card rates.
// The page has a <table> with rows like: <td>2024 Q2</td><td>11.90</td>...<td>15.80</td>
// Column order varies by page version so we look for rows that contain a quarter pattern.
function parseNcuaHtml(html) {
  const series = [];

  // Match all <tr>...</tr> blocks
  const rowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const cellPattern = /<td[^>]*>\s*([\s\S]*?)\s*<\/td>/gi;

  let rowMatch;
  while ((rowMatch = rowPattern.exec(html)) !== null) {
    const rowHtml = rowMatch[1];
    const cells = [];
    let cellMatch;
    // Reset lastIndex for each row
    cellPattern.lastIndex = 0;
    while ((cellMatch = cellPattern.exec(rowHtml)) !== null) {
      // Strip any inner HTML tags and trim
      cells.push(cellMatch[1].replace(/<[^>]+>/g, '').trim());
    }

    if (cells.length < 3) continue;

    // First cell should look like "2024 Q2" or "Q2 2024" or "2024-Q2"
    const dateCell = cells[0];
    const yearMatch = dateCell.match(/(\d{4})\s*[Qq]([1-4])/);
    const qyearMatch = dateCell.match(/[Qq]([1-4])\s*(\d{4})/);

    let dateLabel = null;
    if (yearMatch) dateLabel = `Q${yearMatch[2]} ${yearMatch[1]}`;
    else if (qyearMatch) dateLabel = `Q${qyearMatch[1]} ${qyearMatch[2]}`;
    if (!dateLabel) continue;

    // Look for two numeric rate values in remaining cells
    const rates = cells
      .slice(1)
      .map(c => parseFloat(c.replace(/[^0-9.]/g, '')))
      .filter(n => !isNaN(n) && n > 0 && n < 50);

    if (rates.length < 2) continue;

    // Assumption: first rate = credit union, second = bank (matches NCUA table layout)
    series.push({ date: dateLabel, creditUnion: rates[0], bank: rates[1] });
  }

  return series;
}

async function fetchAndCacheRates() {
  try {
    const response = await axios.get(NCUA_URL, {
      timeout: 8000,
      headers: { 'User-Agent': 'F.I.R.E/1.0 (HackAugie 2026)' },
    });

    const series = parseNcuaHtml(response.data);

    if (series.length < 4) {
      throw new Error(`Parsed only ${series.length} data points — likely a page structure change`);
    }

    // Sort chronologically
    series.sort((a, b) => {
      const [qa, ya] = [parseInt(a.date[1]), parseInt(a.date.slice(3))];
      const [qb, yb] = [parseInt(b.date[1]), parseInt(b.date.slice(3))];
      return ya !== yb ? ya - yb : qa - qb;
    });

    const latest = series.at(-1);
    cachedRates = {
      lastFetched: new Date().toISOString(),
      source: 'live',
      series,
      latest: { creditUnion: latest.creditUnion, bank: latest.bank },
    };
    console.log(`NCUA rates cached: ${series.length} quarters (latest ${latest.date})`);
  } catch (err) {
    console.warn(`NCUA live fetch failed (${err.message}) — using fallback data`);
    cachedRates = {
      lastFetched: new Date().toISOString(),
      source: 'fallback',
      ...FALLBACK,
    };
  }
}

function getCachedRates() {
  return cachedRates;
}

module.exports = { fetchAndCacheRates, getCachedRates };
