import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

const TYPE_COLORS = {
  survey_complete: '#173124',
  survey_retake:   '#173124',
  dictionary_batch: '#4caf7d',
  module_complete:  '#2d7dd2',
  milestone_unlock: '#f59e0b',
  update:           '#a09a93',
};

export default function LiteracyTimeline({ timelineData }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-3)', marginBottom: 16 }}>
        Literacy Score Timeline
      </div>
      {timelineData.length < 2 ? (
        <div style={{
          height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--surface-low)', borderRadius: 'var(--radius-md)',
          fontSize: 13, color: 'var(--fg-3)', fontStyle: 'italic',
        }}>
          Read more terms or complete activities to build your timeline.
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={timelineData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-1)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--fg-3)', fontFamily: 'var(--font-sans)' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }} />
              <Tooltip
                formatter={(v) => [`${v} pts`, 'Literacy']}
                contentStyle={{ fontFamily: 'var(--font-sans)', fontSize: 12, border: '1px solid var(--border-1)', borderRadius: 8 }}
              />
              <Line
                type="monotone" dataKey="literacy" stroke="#173124" strokeWidth={2}
                dot={({ cx, cy, payload }) => (
                  <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={4} fill={TYPE_COLORS[payload.type] ?? '#a09a93'} stroke="#fff" strokeWidth={1.5} />
                )}
              />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 10 }}>
            {Object.entries(TYPE_COLORS).map(([type, color]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--fg-3)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                {type.replace(/_/g, ' ')}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
