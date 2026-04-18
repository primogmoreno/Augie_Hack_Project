import { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import api from '../../services/api';

export default function SpendingAnalyzer() {
  const [analysis, setAnalysis] = useState(null);
  const [stage, setStage] = useState(null); // null | 'fetching' | 'analyzing' | 'error'

  const runAnalysis = async () => {
    setStage('fetching');
    setAnalysis(null);
    try {
      const { data: txData } = await api.get('/plaid/transactions');
      setStage('analyzing');
      const { data } = await api.post('/gemini/analyze-spending', {
        transactions: txData.transactions ?? [],
      });
      setAnalysis(data.analysis);
      setStage(null);
    } catch {
      setStage('error');
    }
  };

  const loading = stage === 'fetching' || stage === 'analyzing';

  return (
    <Card style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--amber-500)', marginBottom: 4 }}>
          ✦ AI Spending Analyzer
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, margin: 0 }}>
          What's happening with your money
        </h3>
      </div>

      {!analysis && stage !== 'error' && (
        <div>
          <p style={{ fontSize: 14, color: 'var(--fg-2)', marginBottom: 16, lineHeight: 1.55 }}>
            Gemini reads your last 90 days of transactions and explains what's happening in plain English — no jargon.
          </p>
          <Button variant="accent" onClick={runAnalysis} disabled={loading}>
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                {stage === 'fetching' ? 'Fetching transactions…' : 'Analyzing with Gemini…'}
              </span>
            ) : 'Analyze my spending'}
          </Button>
        </div>
      )}

      {stage === 'error' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 14, color: 'var(--danger)' }}>
            Something went wrong. Make sure your bank account is connected and the server is running.
          </p>
          <Button variant="secondary" size="sm" onClick={runAnalysis}>Try again</Button>
        </div>
      )}

      {analysis && (
        <div>
          <div style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--fg-1)', whiteSpace: 'pre-wrap', marginBottom: 16 }}>
            {analysis}
          </div>
          <Button variant="ghost" size="sm" onClick={() => { setAnalysis(null); setStage(null); }}>
            Run again
          </Button>
        </div>
      )}
    </Card>
  );
}
