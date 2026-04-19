import { useLiteracyVisualization } from '../../hooks/useLiteracyVisualization';
import LiteracyStatCards from './LiteracyStatCards';
import LiteracyLevelBadge from './LiteracyLevelBadge';
import CategoryMasteryRings from './CategoryMasteryRings';
import LiteracyTimeline from './LiteracyTimeline';
import LiteracyActionFeed from './LiteracyActionFeed';

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[80, 48, 160].map(h => (
        <div key={h} style={{ height: h, background: 'var(--surface-low)', borderRadius: 'var(--radius-md)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      ))}
    </div>
  );
}

export default function LiteracyVisualization() {
  const data = useLiteracyVisualization();

  return (
    <div data-tour="literacy-visualization">
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-2)', marginBottom: 4 }}>
        Financial Literacy Growth
      </div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, margin: '0 0 20px' }}>
        Your learning journey
      </h3>

      {data.loading ? (
        <Skeleton />
      ) : data.literacy === null ? (
        <div style={{ fontSize: 13, color: 'var(--fg-3)', fontStyle: 'italic', padding: '20px 0' }}>
          Complete the onboarding survey to start tracking your literacy growth.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <LiteracyStatCards statCards={data.statCards} />
          <LiteracyLevelBadge
            level={data.level}
            nextLevel={data.nextLevel}
            levelProgress={data.levelProgress}
            literacy={data.literacy}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <CategoryMasteryRings categoryScores={data.categoryScores} />
            <LiteracyTimeline timelineData={data.timelineData} />
          </div>
          <LiteracyActionFeed recentActions={data.recentActions} />
        </div>
      )}
    </div>
  );
}
