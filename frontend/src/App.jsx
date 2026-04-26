import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import FinancialWizard from './components/financials/FinancialWizard';
import DashboardLayout from './components/dashboard/DashboardLayout';
import Overview from './components/dashboard/Overview';
import MattersView from './components/dashboard/MattersView';
import WidgetPage from './components/intake/WidgetPage';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import SettingsView from './components/dashboard/SettingsView';
import TaxCalculatorView from './components/dashboard/TaxCalculatorView';
import LandingPage from './components/marketing/LandingPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/tools/financial-wizard" element={<FinancialWizard />} />
        <Route path="/intake/new" element={<FinancialWizard />} />
        <Route path="/intake/embed/:firmId" element={<WidgetPage />} />

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout><Overview /></DashboardLayout>} />
        <Route path="/dashboard/matters" element={<DashboardLayout><MattersView /></DashboardLayout>} />
        <Route path="/dashboard/settings" element={<DashboardLayout><SettingsView /></DashboardLayout>} />
        <Route path="/dashboard/tax-calculator" element={<DashboardLayout><TaxCalculatorView /></DashboardLayout>} />
      </Routes>
    </Router>
  );
}

export default App;
