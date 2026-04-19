import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Coach from './pages/Coach';
import Dictionary from './pages/Dictionary';
import TransactionHistory from './pages/TransactionHistory';
import Simulation from './pages/Simulation';
import LifeSimulator from './pages/LifeSimulator';
import Analyze from './pages/Analyze';
import FinancialWorld from './pages/FinancialWorld';
import {Login,Logout} from './pages/Login';
import OnboardingSurvey from './pages/onboarding/OnboardingSurvey';
import Settings from './pages/Settings';
import GuidedTour from './components/tour/GuidedTour';
import { useGuidedTour } from './hooks/useGuidedTour';

const NO_SIDEBAR_PATHS = ['/', '/onboarding/survey'];

function Layout() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const tour = useGuidedTour();

  if (isHome) {
    return <Login />;
  }

  if (location.pathname === '/onboarding/survey') {
    return <OnboardingSurvey />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          
          <Route path="/transactions" element={<TransactionHistory />} />
          <Route path="/simulate"     element={<Simulation />} />
          <Route path="/lifesim"      element={<LifeSimulator />} />
          <Route path="/analyze"      element={<Analyze />} />
          <Route path="/world"        element={<FinancialWorld />} />
          <Route path="/coach"        element={<Coach />} />
          <Route path="/dictionary"   element={<Dictionary />} />
          <Route path="/settings"     element={<Settings onRestartTour={tour.restart} />} />
          <Route path="/logout"       element={<Logout />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
      <GuidedTour
        active={tour.active}
        step={tour.step}
        currentStep={tour.currentStep}
        totalSteps={tour.totalSteps}
        onNext={tour.next}
        onPrev={tour.prev}
        onSkip={tour.skip}
      />
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
