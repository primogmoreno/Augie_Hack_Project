import { useState, useEffect } from 'react';
import TopBar from '../components/layout/TopBar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import api from '../services/api';

export default function Analyze() {
  const [analysis, setAnalysis] = useState(null);
  const [stage, setStage] = useState(null);
  const [txCount, setTxCount] = useState(null);

  useEffect(() => {
    api.get('/transactions?days=90')
      .then(({ data }) => {
        if (!data.pending) setTxCount(data.transactions?.length ?? 0);
      })
      .catch(() => {});
  }, []);

  const runAnalysis = async () => {
    setStage('fetching');
    setAnalysis(null);
    try {
      const { data: txData } = await api.get('/transactions?days=90');
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar
        title="Spending Analysis"
        subtitle="AI-powered breakdown of your transactions"
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 40px 60px', background: 'var(--ink-0)' }}>
        <div style={{ maxWidth: 760 }}>

          {/* Hero card */}
          <Card style={{
            background: 'linear-gradient(180deg, var(--amber-50) 0%, #fff 70%)',
            borderColor: 'color-mix(in srgb, var(--amber-400) 35%, var(--border-1))',
            padding: 28,
            marginBottom: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                background: 'linear-gradient(135deg, var(--amber-300), var(--amber-400))',
                color: 'var(--ink-800)', display: 'grid', placeItems: 'center',
                fontWeight: 700, fontSize: 20,
              }}>✦</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--amber-500)', marginBottom: 6 }}>
                  Gemini AI · Spending Analyzer
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500, margin: '0 0 10px', lineHeight: 1.25 }}>
                  What's happening with your money
                </h2>
                <p style={{ fontSize: 14.5, color: 'var(--fg-2)', lineHeight: 1.6, margin: '0 0 18px' }}>
                  Gemini reads your last 90 days of transactions and explains your spending patterns in plain English — no jargon, no judgment.
                  {txCount !== null && (
                    <span style={{ color: 'var(--teal-700)', fontWeight: 500 }}> {txCount} transactions loaded.</span>
                  )}
                </p>
                {!analysis && stage !== 'error' && (
                  <Button variant="accent" onClick={runAnalysis} disabled={loading}>
                    {loading ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          width: 14, height: 14,
                          border: '2px solid rgba(255,255,255,0.4)',
                          borderTopColor: '#fff',
                          borderRadius: '50%',
                          display: 'inline-block',
                          animation: 'spin 1s linear infinite',
                        }} />
                        {stage === 'fetching' ? 'Fetching transactions…' : 'Analyzing with Gemini…'}
                      </span>
                    ) : 'Analyze my spending'}
                  </Button>
                )}
                {stage === 'error' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <p style={{ fontSize: 14, color: 'var(--danger)', margin: 0 }}>
                      Something went wrong. Make sure your bank account is connected and the server is running.
                    </p>
                    <Button variant="secondary" size="sm" onClick={runAnalysis}>Try again</Button>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Analysis result */}
          {analysis && (
            <Card style={{ padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal-700)' }}>
                  Analysis complete
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setAnalysis(null); setStage(null); }}>
                  Run again
                </Button>
              </div>
              <div style={{
                fontSize: 15, lineHeight: 1.75, color: 'var(--fg-1)',
                whiteSpace: 'pre-wrap',
                borderLeft: '3px solid var(--amber-300)',
                paddingLeft: 18,
              }}>
                {analysis}
              </div>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
