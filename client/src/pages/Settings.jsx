import { useState, useEffect } from 'react';
import TopBar from '../components/layout/TopBar';
import SettingsSection from '../components/settings/SettingsSection';
import AccountSettings from '../components/settings/AccountSettings';
import ConnectedBankCard from '../components/settings/ConnectedBankCard';
import DataPreferencesSection from '../components/settings/DataPreferencesSection';
import LiteracySettingsSection from '../components/settings/LiteracySettingsSection';
import AppPreferencesSection from '../components/settings/AppPreferencesSection';
import DangerZone from '../components/settings/DangerZone';
import { useUserPreferences } from '../hooks/useUserPreferences';
import api from '../services/api';

export default function Settings({ onRestartTour }) {
  const { prefs, update } = useUserPreferences();
  const [accounts, setAccounts] = useState([]);
  const [institution, setInstitution] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  function loadAccounts() {
    api.get('/plaid/accounts')
      .then(({ data }) => {
        const list = data.accounts ?? [];
        setAccounts(list);
        setInstitution(data.institution?.name ?? null);
        setIsConnected(list.length > 0);
      })
      .catch(() => setIsConnected(false));
  }

  useEffect(() => { loadAccounts(); }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar title="Settings" subtitle="Manage your account, data, and preferences." />

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 40px 60px', background: 'var(--bg-page)' }}>
        <div style={{ maxWidth: 700 }}>

          <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 48, color: 'var(--primary)', letterSpacing: '-0.02em', lineHeight: 1, margin: '0 0 32px' }}>
            Settings
          </h2>

          <SettingsSection title="Account" icon="👤">
            <AccountSettings />
          </SettingsSection>

          <SettingsSection title="Connected Accounts" icon="🏦">
            {isConnected ? (
              <ConnectedBankCard
                institution={institution}
                accounts={accounts}
                onDisconnected={() => { setIsConnected(false); setAccounts([]); }}
              />
            ) : (
              <div style={{ fontSize: 13, color: 'var(--fg-3)' }}>
                No bank account connected. Use the "Connect Account" button in the sidebar.
              </div>
            )}
          </SettingsSection>

          <SettingsSection title="Data Preferences" icon="📊">
            <DataPreferencesSection prefs={prefs} update={update} />
          </SettingsSection>

          <SettingsSection title="Literacy Progress" icon="📈">
            <LiteracySettingsSection />
          </SettingsSection>

          <SettingsSection title="App Preferences" icon="⚙️">
            <AppPreferencesSection prefs={prefs} update={update} onRestartTour={onRestartTour} />
          </SettingsSection>

          <SettingsSection title="Danger Zone" icon="⚠️" defaultOpen={false}>
            <DangerZone onDisconnected={() => { setIsConnected(false); setAccounts([]); }} />
          </SettingsSection>

        </div>
      </div>
    </div>
  );
}
