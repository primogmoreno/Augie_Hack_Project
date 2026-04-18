import Card from '../ui/Card';
import Button from '../ui/Button';

export default function Explainer({ onClose, onCoach }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(15, 13, 9, 0.45)',
      display: 'grid', placeItems: 'center',
      padding: 24, zIndex: 10,
    }}>
      <Card style={{ maxWidth: 480, padding: 28, boxShadow: 'var(--shadow-lg)', animation: 'fadeIn var(--dur-base) var(--ease-out)' }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--amber-500)', marginBottom: 8 }}>
          ✦ In plain English
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 500, letterSpacing: '-0.015em', margin: '0 0 12px' }}>
          Credit utilization
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--fg-2)', margin: '0 0 12px' }}>
          It's how much of your credit card limit you're using right now. If your limit is $3,000 and you owe $1,200, your utilization is 40%.
        </p>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--fg-2)', margin: '0 0 20px' }}>
          Most scoring models like to see this under 30%. Lower is better — but 0% isn't ideal either; you want to show you can use credit responsibly.
        </p>
        <div style={{ background: 'var(--ink-0)', borderRadius: 10, padding: 14, marginBottom: 20, fontSize: 13, color: 'var(--fg-2)' }}>
          <strong style={{ color: 'var(--fg-1)' }}>Your case:</strong> $1,284 balance ÷ $3,100 limit = <span className="money" style={{ color: 'var(--danger)' }}>41%</span>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onClose}>Got it</Button>
          <Button variant="primary" onClick={onCoach}>Ask the coach</Button>
        </div>
      </Card>
    </div>
  );
}
