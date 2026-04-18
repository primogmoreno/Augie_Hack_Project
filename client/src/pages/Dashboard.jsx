import RateRealityCheck from '../components/dashboard/RateRealityCheck';
import SpendingAnalyzer from '../components/analyzer/SpendingAnalyzer';

export default function Dashboard() {
  return (
    <div className="space-y-10">
      <RateRealityCheck />
      <SpendingAnalyzer />
    </div>
  );
}
