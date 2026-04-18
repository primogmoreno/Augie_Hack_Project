// TODO: wire up real data from /api/plaid/transactions and /api/gemini/analyze-spending
import { useState } from 'react';
import api from '../../services/api';

export default function SpendingAnalyzer() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/gemini/analyze-spending');
      setAnalysis(data.analysis);
    } catch (err) {
      console.error('Analysis failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-md p-8">
      <h2 className="text-2xl font-bold text-brand-primary mb-1">AI Spending Analyzer</h2>
      <p className="text-sm text-gray-500 mb-6">
        Gemini reads your last 90 days of transactions and explains what's happening in plain English.
      </p>

      {!analysis ? (
        <button
          onClick={runAnalysis}
          disabled={loading}
          className="bg-brand-accent hover:bg-brand-primary text-white font-semibold px-6 py-2 rounded-xl transition-colors disabled:opacity-50"
        >
          {loading ? 'Analyzing…' : 'Analyze My Spending'}
        </button>
      ) : (
        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
          {analysis}
        </div>
      )}
    </section>
  );
}
