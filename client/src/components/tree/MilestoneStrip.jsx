import { MILESTONES } from '../../utils/milestoneDefinitions';
import MilestoneCard from './MilestoneCard';

export default function MilestoneStrip({ unlockedMilestones = [] }) {
  const unlockedSet = new Set(unlockedMilestones);

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-3)', marginBottom: 12 }}>
        Milestones
      </div>
      <div style={{
        display: 'flex',
        gap: 10,
        overflowX: 'auto',
        paddingBottom: 8,
        scrollbarWidth: 'thin',
      }}>
        {MILESTONES.map(m => (
          <MilestoneCard key={m.id} milestone={m} unlocked={unlockedSet.has(m.id)} />
        ))}
      </div>
    </div>
  );
}
