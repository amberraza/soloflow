import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import FinancialWizard from './components/financials/FinancialWizard';
import DashboardLayout from './components/dashboard/DashboardLayout';
import Overview from './components/dashboard/Overview';
import MattersView from './components/dashboard/MattersView';
import WidgetPage from './components/intake/WidgetPage';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import SettingsView from './components/dashboard/SettingsView';
import './App.css';

function Home() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">SoloFlow</h1>
      <p className="mb-8">Legal Vertical SaaS for Solo Attorneys</p>
      <div className="space-x-4">
        <Link to="/tools/financial-wizard" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold">
          Try Financial Wizard (Free)
        </Link>
        <Link to="/login" className="bg-white border border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-bold">
          Log In
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/tools/financial-wizard" element={<FinancialWizard />} />
        <Route path="/intake/new" element={<FinancialWizard />} />
        <Route path="/intake/embed/:firmId" element={<WidgetPage />} />

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout><Overview /></DashboardLayout>} />
        <Route path="/dashboard/matters" element={<DashboardLayout><MattersView /></DashboardLayout>} />
        <Route path="/dashboard/settings" element={<DashboardLayout><SettingsView /></DashboardLayout>} />
      </Routes>
    </Router>
  );
}

export default App;
