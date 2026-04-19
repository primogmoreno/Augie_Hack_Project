import { useState, useEffect } from 'react';
import TopBar from '../components/layout/TopBar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Icon, { ICONS } from '../components/ui/Icon';
import PlaidLink from '../components/plaid/PlaidLinkButton';
import api from '../services/api';

export default function Analyze() {
  const [analysis, setAnalysis]       = useState(null);
  const [stage, setStage]             = useState(null);
  const [txCount, setTxCount]         = useState(null);
  const [isConnected, setIsConnected] = useState(null); // null=loading, true=yes, false=no
  const [openPlaid, setOpenPlaid]     = useState(null);

  useEffect(() => {
    api.get('/transactions?days=90')
      .then(({ data }) => {
        setIsConnected(true);
        if (!data.pending) setTxCount(data.transactions?.length ?? 0);
      })
      .catch(err => {
        if (err.response?.status === 401) {
          setIsConnected(false);
        } else {
          setIsConnected(true); // connected but another error — let the analyzer surface it
        }
      });
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
      <PlaidLink onReady={openFn => setOpenPlaid(() => openFn)} />

      <TopBar
        title="Spending Analysis"
        subtitle={isConnected ? 'AI-powered breakdown of your transactions' : 'Connect your bank to get started'}
        right={
          isConnected === false ? (
            <Button variant="primary" size="sm" onClick={() => openPlaid?.()}>
              <Icon d={ICONS.plus} size={14} /> Connect bank
            </Button>
          ) : null
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 40px 60px', background: 'var(--ink-0)' }}>
        <div style={{ maxWidth: 760 }}>

          {/* ── NOT CONNECTED ──────────────────────────────────────── */}
          {isConnected === false && (
            <Card style={{
              background: 'linear-gradient(135deg, var(--teal-700) 0%, #0D5C52 100%)',
              border: 'none', padding: '40px 44px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: 20,
                    background: 'rgba(255,255,255,0.15)',
                    display: 'grid', placeItems: 'center', fontSize: 36,
                  }}>
                    ✦
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>
                    Gemini AI · Spending Analyzer
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 500, color: '#fff', margin: '0 0 12px', lineHeight: 1.2 }}>
                    Unlock AI-powered insights into your spending
                  </h2>
                  <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.75)', margin: '0 0 24px', lineHeight: 1.65 }}>
                    Connect your bank and Gemini will read your last 90 days of transactions — explaining exactly where your money is going, in plain English with no jargon.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                    {[
                      'Plain-English breakdown of every spending category',
                      'Flags unusual charges and recurring expenses',
                      'Personalized tips to reduce overspending',
                      'Savings opportunities based on your habits',
                    ].map(item => (
                      <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>
                        <Icon d={ICONS.check} size={15} stroke={2.5} />
                        {item}
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => openPlaid?.()}
                    style={{ background: '#fff', color: 'var(--teal-700)', fontWeight: 700, padding: '12px 28px' }}
                  >
                    <Icon d={ICONS.lock} size={14} /> Connect via Plaid — it's secure
                  </Button>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '14px 0 0' }}>
                    We never store your bank credentials.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* ── LOADING ────────────────────────────────────────────── */}
          {isConnected === null && (
            <Card style={{ padding: 40, textAlign: 'center', color: 'var(--fg-3)', fontSize: 14 }}>
              Checking connection…
            </Card>
          )}

          {/* ── CONNECTED ──────────────────────────────────────────── */}
          {isConnected === true && (
            <>
              <Card style={{
                background: 'linear-gradient(180deg, var(--amber-50) 0%, #fff 70%)',
                borderColor: 'color-mix(in srgb, var(--amber-400) 35%, var(--border-1))',
                padding: 28, marginBottom: 24,
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
            </>
          )}

        </div>
      </div>
    </div>
  );
}
