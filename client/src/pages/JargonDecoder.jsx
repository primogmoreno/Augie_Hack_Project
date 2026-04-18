import { useState } from 'react';
import TopBar from '../components/layout/TopBar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import api from '../services/api';

const SECTION_LABELS = ['Plain-English definition', 'Why this matters for you', 'What to ask your credit union'];

const EXAMPLES = ['APR', 'Credit utilization', 'Minimum payment', 'Grace period', 'Balance transfer fee'];

function parseSections(text) {
  // Try to split on "1.", "2.", "3." markers
  const parts = text.split(/\n?\s*[1-3]\.\s+/).filter(Boolean);
  if (parts.length >= 2) return parts.slice(0, 3);
  // Fall back: return raw text in first section
  return [text];
}

export default function JargonDecoder() {
  const [term, setTerm] = useState('');
  const [sections, setSections] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const decode = async (t = term) => {
    const trimmed = t.trim();
    if (!trimmed) return;
    setSections(null);
    setError(false);
    setLoading(true);
    try {
      const { data } = await api.post('/gemini/decode-jargon', { term: trimmed });
      setSections(parseSections(data.explanation));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleExample = (ex) => {
    setTerm(ex);
    decode(ex);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar title="Jargon Decoder" subtitle="Paste any financial term and get a plain-English explanation." />

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 40px 60px', background: 'var(--ink-0)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>

          {/* Input card */}
          <Card style={{ padding: 24, marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 8 }}>
              Financial term or phrase
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                value={term}
                onChange={e => setTerm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && decode()}
                placeholder="e.g. APR, grace period, balance transfer…"
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  border: '1px solid var(--ink-200)',
                  borderRadius: 10,
                  fontSize: 15,
                  fontFamily: 'var(--font-sans)',
                  outline: 'none',
                  boxShadow: 'var(--shadow-inset)',
                }}
              />
              <Button variant="primary" onClick={() => decode()} disabled={loading || !term.trim()}>
                {loading ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                    Decoding…
                  </span>
                ) : 'Decode'}
              </Button>
            </div>

            <div style={{ marginTop: 14 }}>
              <span style={{ fontSize: 12, color: 'var(--fg-3)', marginRight: 8 }}>Try:</span>
              {EXAMPLES.map(ex => (
                <button
                  key={ex}
                  onClick={() => handleExample(ex)}
                  style={{
                    marginRight: 6, marginBottom: 4,
                    padding: '4px 10px',
                    border: '1px solid var(--border-1)',
                    borderRadius: 999,
                    background: '#fff',
                    fontSize: 12,
                    cursor: 'pointer',
                    color: 'var(--fg-2)',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </Card>

          {/* Error state */}
          {error && (
            <Card style={{ padding: 20, borderColor: 'var(--danger-bg)' }}>
              <p style={{ color: 'var(--danger)', fontSize: 14 }}>
                Something went wrong. Make sure the server is running and your Gemini API key is set.
              </p>
            </Card>
          )}

          {/* Results */}
          {sections && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'fadeIn var(--dur-base) var(--ease-out)' }}>
              {sections.map((text, i) => (
                <Card key={i} style={{ padding: 22 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
                    color: i === 2 ? 'var(--teal-600)' : 'var(--amber-500)',
                    marginBottom: 8,
                  }}>
                    {i === 2 ? '✦ ' : ''}{SECTION_LABELS[i] ?? `Section ${i + 1}`}
                  </div>
                  <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--fg-1)', margin: 0 }}>
                    {text.trim()}
                  </p>
                </Card>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
