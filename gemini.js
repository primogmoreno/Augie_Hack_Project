// Client-side helpers for the life simulation prediction feature.
// All Gemini calls are proxied through Flask so the API key stays server-side.

const API_BASE = window.API_BASE || 'http://localhost:5000/api';

/**
 * Ask the Flask backend to predict economic conditions using NCUA data + Gemini.
 * @param {number} advanceTime - Years to look ahead
 * @returns {{ inflationRate: number, marketRate: number, recessionProbability: number } | null}
 */
export async function predictFuture(advanceTime) {
    try {
        const response = await fetch(`${API_BASE}/gemini/predict-future`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ advanceTime }),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (err) {
        console.error('predictFuture failed:', err);
        return null;
    }
}

/**
 * Fetch NCUA rate data from the Flask backend (already cached server-side for 24h).
 * @returns {object | null}
 */
export async function initNCUAData() {
    try {
        const response = await fetch(`${API_BASE}/rates`, { credentials: 'include' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (err) {
        console.error('initNCUAData failed:', err);
        return null;
    }
}
