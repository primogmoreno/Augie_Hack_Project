import { useState } from 'react';
import PlaidLink from '../components/plaid/PlaidLinkButton';
import Logo from '../components/ui/Logo';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Icon, { ICONS } from '../components/ui/Icon';

export default function Home() {
  const [step, setStep] = useState('intro'); // intro | picking

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      background: 'var(--bg-page)',
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
              fontStyle: 'italic',
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
          <Card style={{ padding: 32, textAlign: 'center', animation: 'fadeIn var(--dur-base) var(--ease-out)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <Button variant="ghost" size="sm" onClick={() => setStep('intro')}>
                <Icon d={ICONS.back} size={16} />
              </Button>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500, margin: 0 }}>
                Connect your bank
              </h2>
            </div>
            <p style={{ fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.6, marginBottom: 24 }}>
              Plaid will open a secure window where you can choose your bank and sign in. We never see your credentials.
            </p>
            <PlaidLink />
            <div style={{ marginTop: 20, fontSize: 12, color: 'var(--fg-3)' }}>
              Sandbox test credentials: <strong>user_good</strong> / <strong>pass_good</strong>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
}
