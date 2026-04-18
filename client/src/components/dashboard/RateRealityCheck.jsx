// TODO: wire up real data from /api/rates/ncua and /api/plaid/accounts
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine, ResponsiveContainer,
} from 'recharts';

const PLACEHOLDER_DATA = [
  { date: 'Q1 2023', creditUnion: 11.2, bank: 14.8 },
  { date: 'Q2 2023', creditUnion: 11.5, bank: 15.2 },
  { date: 'Q3 2023', creditUnion: 11.8, bank: 15.6 },
  { date: 'Q4 2023', creditUnion: 12.1, bank: 16.0 },
  { date: 'Q1 2024', creditUnion: 12.3, bank: 16.3 },
  { date: 'Q2 2024', creditUnion: 12.0, bank: 16.1 },
];

const USER_APR = 21.99;

export default function RateRealityCheck() {
  const latestCU = PLACEHOLDER_DATA.at(-1).creditUnion;
  const latestBank = PLACEHOLDER_DATA.at(-1).bank;
  const annualSavings = ((USER_APR - latestCU) / 100 / 12 * 3500 * 12).toFixed(2);

  return (
    <section className="bg-white rounded-2xl shadow-md p-8">
      <h2 className="text-2xl font-bold text-brand-primary mb-1">Rate Reality Check</h2>
      <p className="text-sm text-gray-500 mb-6">
        Your current APR compared to national credit union and bank averages.
      </p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Your APR" value={`${USER_APR}%`} highlight />
        <StatCard label="Credit Union Avg" value={`${latestCU}%`} />
        <StatCard label="Bank Avg" value={`${latestBank}%`} />
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={PLACEHOLDER_DATA}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis unit="%" domain={[8, 25]} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => `${v}%`} />
          <Legend />
          <ReferenceLine y={USER_APR} stroke="#ef4444" strokeDasharray="6 3" label={{ value: 'Your Rate', fill: '#ef4444', fontSize: 12 }} />
          <Line type="monotone" dataKey="creditUnion" name="Credit Union Avg" stroke="#1E4D8C" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="bank" name="Bank Avg" stroke="#2E86AB" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-6 bg-blue-50 rounded-xl p-4 text-sm text-brand-primary">
        <strong>What this means:</strong> At your current rate vs. the credit union average, you could
        save roughly <strong>${annualSavings}/year</strong> on a $3,500 balance.{' '}
        <em>Ask your credit union: "Can I qualify for your current credit card rate?"</em>
      </div>
    </section>
  );
}

function StatCard({ label, value, highlight }) {
  return (
    <div className={`rounded-xl p-4 text-center ${highlight ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? 'text-red-500' : 'text-brand-primary'}`}>{value}</p>
    </div>
  );
}
