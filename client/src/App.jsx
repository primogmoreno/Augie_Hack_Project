import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Coach from './pages/Coach';
import Dictionary from './pages/Dictionary';
import TransactionHistory from './pages/TransactionHistory';
import Simulation from './pages/Simulation';
import Analyze from './pages/Analyze';
import FinancialWorld from './pages/FinancialWorld';
import {Login,Logout} from './pages/Login';


function Layout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  if (isHome) {
    return <Login />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/dashboard"    element={<Dashboard />} />
          <Route path="/transactions" element={<TransactionHistory />} />
          <Route path="/simulate"     element={<Simulation />} />
          <Route path="/analyze"      element={<Analyze />} />
          <Route path="/world"        element={<FinancialWorld />} />
          <Route path="/coach"        element={<Coach />} />
          <Route path="/dictionary"   element={<Dictionary />} />
          <Route path="/settings"     element={<SettingsPlaceholder />} />
          <Route path="/logout"       element={<Logout />} />
          <Route path="*"             element={<Home />} />
        </Routes>
      </div>
    </div>
  );
}

function SettingsPlaceholder() {
  return (
    <div style={{ padding: '48px 40px', color: 'var(--fg-3)', fontFamily: 'var(--font-display)', fontSize: 24 }}>
      Settings coming soon.
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<Layout />} />
      </Routes>
    </BrowserRouter>
  );
}
