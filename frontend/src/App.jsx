import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import FinancialWizard from './components/financials/FinancialWizard';
import Dashboard from './components/Dashboard';
import './App.css';

function Home() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">SoloFlow</h1>
      <p className="mb-8">Legal Vertical SaaS for Solo Attorneys</p>
      <Link to="/tools/financial-wizard" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold">
        Try Financial Wizard (Free)
      </Link>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tools/financial-wizard" element={<FinancialWizard />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
