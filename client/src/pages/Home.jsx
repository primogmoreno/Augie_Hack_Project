import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PlaidLink from '../components/plaid/PlaidLinkButton';
import Logo from '../components/ui/Logo';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Icon, { ICONS } from '../components/ui/Icon';
import api from '../services/api';

const BANKS = [
  { name: 'Harbor Credit Union', color: '#1F7A6B', initial: 'H' },
  { name: 'Midwest Federal CU',  color: '#2D6FA8', initial: 'M' },
  { name: 'Chase',               color: '#0F4A41', initial: 'C' },
  { name: 'Bank of America',     color: '#B83A2E', initial: 'B' },
  { name: 'Capital One',         color: '#D2902A', initial: 'C' },
  { name: 'Wells Fargo',         color: '#7D5617', initial: 'W' },
];

export default function Home() {
  const [step, setStep] = useState('picking'); // intro | picking | connecting
  const [bank, setBank] = useState(null);
  const navigate = useNavigate();

  const handleBankSelect = async (b) => {
    setBank(b);
    setStep('connecting');
    try {
      const { data } = await api.post('/plaid/create-link-token');
      // In a real flow, Plaid Link opens here using data.link_token.
      // For sandbox, we simulate the connection and go to dashboard.
      setTimeout(() => navigate('/dashboard'), 1800);
    } catch {
      setTimeout(() => navigate('/dashboard'), 1800);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      background: 'var(--ink-0)',
      padding: 40,
    }}>
      <div style={{ maxWidth: 520, width: '100%' }}>

        {step === 'intro' && (
          <div style={{ textAlign: 'center', animation: 'fadeIn var(--dur-base) var(--ease-out)' }}>
            <div style={{ display: 'inline-flex', marginBottom: 24 }}>
              <Logo size={56} />
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 44,
              fontWeight: 500,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              margin: '0 0 14px',
            }}>
              Let's make sense of your money.
            </h1>
            <p style={{ fontSize: 17, color: 'var(--fg-2)', lineHeight: 1.55, margin: '0 0 28px' }}>
              Connect your bank and FinLit will translate your statements into plain English — so you can walk into your credit union knowing exactly what to ask.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 32 }}>
              <Button variant="primary" size="lg" onClick={() => setStep('picking')}>
                Connect my bank
              </Button>
              <Button variant="ghost" size="lg">
                How it works
              </Button>
            </div>
            <div style={{ display: 'flex', gap: 18, justifyContent: 'center', fontSize: 12, color: 'var(--fg-3)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Icon d={ICONS.lock} size={13} /> Read-only access
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Icon d={ICONS.check} size={13} /> Secured by Plaid
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Icon d={ICONS.check} size={13} /> No credentials stored
              </span>
            </div>
          </div>
        )}

        {step === 'picking' && (
          <Card style={{ padding: 28, animation: 'fadeIn var(--dur-base) var(--ease-out)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <Button variant="ghost" size="sm" onClick={() => setStep('intro')}>
                <Icon d={ICONS.back} size={16} />
              </Button>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500, margin: 0 }}>
                Choose your bank
              </h2>
            </div>
            <input
              placeholder="Search 12,000+ banks and credit unions…"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: 15,
                border: '1px solid var(--ink-200)',
                borderRadius: 10,
                boxShadow: 'var(--shadow-inset)',
                marginBottom: 16,
                fontFamily: 'var(--font-sans)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {BANKS.map(b => (
                <button
                  key={b.name}
                  onClick={() => handleBankSelect(b)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 12,
                    border: '1px solid var(--border-1)',
                    borderRadius: 12,
                    background: '#fff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'var(--font-sans)',
                    transition: 'box-shadow var(--dur-fast) var(--ease-out)',
                  }}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: b.color, color: '#fff',
                    display: 'grid', placeItems: 'center',
                    fontWeight: 700, fontSize: 15, flexShrink: 0,
                  }}>
                    {b.initial}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{b.name}</span>
                </button>
              ))}
            </div>
          </Card>
        )}

        {step === 'connecting' && (
          <Card style={{ padding: 40, textAlign: 'center', animation: 'fadeIn var(--dur-base) var(--ease-out)' }}>
            <div style={{
              width: 56, height: 56,
              margin: '0 auto 20px',
              border: '3px solid var(--teal-100)',
              borderTopColor: 'var(--teal-500)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, marginBottom: 6 }}>
              Connecting to {bank?.name}…
            </h2>
            <p style={{ color: 'var(--fg-2)', fontSize: 14 }}>
              This usually takes 10–30 seconds. Hang tight.
            </p>
          </Card>
        )}

      </div>
    </div>
  );
}
