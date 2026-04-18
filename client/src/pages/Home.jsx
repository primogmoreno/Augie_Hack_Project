import PlaidLinkButton from '../components/plaid/PlaidLinkButton';

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <h1 className="text-4xl font-bold text-brand-primary mb-4">
        Know What Your Money Is Really Doing
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Connect your bank account to see how your interest rates compare to
        national averages — and what that difference costs you every year.
      </p>

      <div className="bg-white rounded-2xl shadow-md p-8 mb-6">
        <h2 className="text-xl font-semibold mb-2">Connect Your Bank</h2>
        <p className="text-sm text-gray-500 mb-6">
          Read-only access. No data stored permanently. Bank-level 256-bit
          encryption via Plaid.
        </p>
        <PlaidLinkButton />
      </div>

      <p className="text-xs text-gray-400">
        FinLit uses Plaid to read your account data. We never see your
        credentials and cannot move money.
      </p>
    </div>
  );
}
