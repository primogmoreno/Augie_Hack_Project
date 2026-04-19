import { useState, useRef, useEffect } from 'react';
import TopBar from '../components/layout/TopBar';
import Button from '../components/ui/Button';
import Icon, { ICONS } from '../components/ui/Icon';
import api from '../services/api';

async function fetchAccountSummary() {
  try {
    const { data } = await api.get('/accounts');
    const accounts = data.accounts ?? [];
    const liabilities = data.liabilities ?? {};
    const checking = accounts.find(a => a.subtype === 'checking');
    const savings  = accounts.find(a => a.subtype === 'savings');
    const credit   = accounts.find(a => a.type === 'credit');
    const cc       = liabilities.credit?.[0];
    const apr      = cc?.aprs?.find(a => a.apr_type === 'purchase_apr')?.apr_percentage;
    return {
      checkingBal: checking?.balances?.current,
      savingsBal:  savings?.balances?.current,
      creditBal:   credit?.balances?.current,
      creditLimit: credit?.balances?.limit,
      creditApr:   apr,
    };
  } catch {
    return null;
  }
}

const INITIAL_MESSAGE = {
  role: 'ai',
  text: "Hi — I'm your FinLit coach, powered by Gemini. I can explain anything on your statement, walk you through tough money decisions, or help you prep for a call with your credit union.",
  suggestions: ['Why did my score drop?', 'Help me build an emergency fund', 'Explain my April statement'],
};

const CANNED = {
  "Why did my score drop?": {
    text: "Your score dropped 18 points last week. The biggest factor: your credit card balance went from $480 to $1,284, pushing utilization to 41%. Credit scoring models generally want utilization under 30%.\n\nThe good news — utilization isn't permanent. Once you pay the balance down, your score should recover within a month or two.",
    suggestions: ['How do I pay it down?', 'What if I call my credit union?', 'Explain utilization simply'],
  },
  "Help me build an emergency fund": {
    text: "Based on your spending, your essential monthly costs are about $2,140 (rent, utilities, groceries, transport). A starter emergency fund of one month — $2,100 — is a realistic first goal. You already have $680 set aside in savings.\n\nIf you move $90/week, you'll hit $2,100 in about 16 weeks.",
    suggestions: ['Try $150/week instead', 'Why one month?'],
  },
  "Explain my April statement": {
    text: "Here's your April so far, in plain English:\n\n• You brought in $2,450 in pay.\n• You spent $1,487, mostly on rent ($900), groceries ($284), and dining ($312).\n• Dining is your biggest outlier — you're 25% over your usual.\n• You saved $182 net this month.\n\nNothing alarming. The dining number is worth a look.",
    suggestions: ['Show me the dining detail', 'What about fees?'],
  },
};

export default function Coach() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [accountSummary, setAccountSummary] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchAccountSummary().then(setAccountSummary);
  }, []);

  const send = async (text) => {
    if (!text.trim() || loading) return;
    setMessages(m => [...m, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    // Try real API first, fall back to canned responses for demo
    try {
      const history = messages.map(m => ({ role: m.role === 'ai' ? 'model' : 'user', content: m.text }));
      const { data } = await api.post('/gemini/chat', {
        messages: [...history, { role: 'user', content: text }],
        accountSummary,
      });
      setMessages(m => [...m, { role: 'ai', text: data.reply, suggestions: [] }]);
    } catch {
      const fallback = CANNED[text] ?? { text: "Let me look at that. (Try one of the suggested prompts for a full reply.)", suggestions: [] };
      setTimeout(() => setMessages(m => [...m, { role: 'ai', ...fallback }]), 600);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar title="Coach" subtitle="Powered by Gemini" />

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '28px 40px', background: 'var(--ink-0)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ animation: 'fadeIn var(--dur-base) var(--ease-out)' }}>
              <div style={{
                display: 'flex',
                gap: 10,
                maxWidth: '90%',
                marginLeft: m.role === 'user' ? 'auto' : 0,
                flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  display: 'grid', placeItems: 'center',
                  background: m.role === 'ai'
                    ? 'linear-gradient(135deg, var(--amber-300), var(--amber-400))'
                    : 'var(--teal-500)',
                  color: m.role === 'ai' ? 'var(--ink-800)' : '#fff',
                  fontWeight: 700,
                  fontSize: m.role === 'ai' ? 14 : 12,
                }}>
                  {m.role === 'ai' ? '✦' : 'Y'}
                </div>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 14,
                  borderTopLeftRadius:  m.role === 'ai'   ? 4  : 14,
                  borderTopRightRadius: m.role === 'user' ? 4  : 14,
                  background: m.role === 'ai' ? '#fff' : 'var(--ink-800)',
                  color: m.role === 'ai' ? 'var(--fg-1)' : 'var(--ink-0)',
                  border: m.role === 'ai' ? '1px solid var(--border-1)' : 0,
                  boxShadow: m.role === 'ai' ? 'var(--shadow-xs)' : 'none',
                  fontSize: 14.5,
                  lineHeight: 1.55,
                  whiteSpace: 'pre-wrap',
                }}>
                  {m.text}
                </div>
              </div>

              {m.suggestions?.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10, marginLeft: 40 }}>
                  {m.suggestions.map(s => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="surface-lift btn-pressable"
                      style={{
                        padding: '6px 12px',
                        border: '1px solid var(--border-1)',
                        background: '#fff',
                        borderRadius: 999,
                        fontSize: 13,
                        cursor: 'pointer',
                        color: 'var(--fg-1)',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: 10, animation: 'fadeIn var(--dur-base) var(--ease-out)' }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--amber-300), var(--amber-400))',
                display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 14, color: 'var(--ink-800)',
              }}>✦</div>
              <div style={{
                padding: '12px 16px', borderRadius: 14, borderTopLeftRadius: 4,
                background: '#fff', border: '1px solid var(--border-1)', boxShadow: 'var(--shadow-xs)',
                fontSize: 14.5, color: 'var(--fg-3)',
              }}>
                Thinking…
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-1)', background: '#fff', padding: '16px 40px' }}>
        <form
          onSubmit={e => { e.preventDefault(); send(input); }}
          style={{ maxWidth: 720, margin: '0 auto', display: 'flex', gap: 10, alignItems: 'center' }}
        >
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask anything about your money…"
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid var(--ink-200)',
              borderRadius: 12,
              fontSize: 15,
              outline: 'none',
              fontFamily: 'var(--font-sans)',
              boxShadow: 'var(--shadow-inset)',
            }}
          />
          <Button variant="primary" type="submit" style={{ padding: '12px 14px' }}>
            <Icon d={ICONS.send} size={16} />
          </Button>
        </form>
        <div style={{ maxWidth: 720, margin: '8px auto 0', fontSize: 11, color: 'var(--fg-3)', textAlign: 'center' }}>
          Responses are AI-generated. Double-check specifics before acting on financial advice.
        </div>
      </div>
    </div>
  );
}
