import React, { useState } from 'react';
import { DollarSign, Calculator, BadgeInfo } from 'lucide-react';

const FREQUENCIES = [
  { value: 'WEEKLY', label: 'Weekly', multiplier: 52 },
  { value: 'BIWEEKLY', label: 'Bi-Weekly', multiplier: 26 },
  { value: 'SEMIMONTHLY', label: 'Semi-Monthly', multiplier: 24 },
  { value: 'MONTHLY', label: 'Monthly', multiplier: 12 },
  { value: 'ANNUALLY', label: 'Annually', multiplier: 1 },
];

const SC_TAX_BRACKETS = [
  { min: 0, max: 3200, rate: 0.00 },        // 0% first $3,200
  { min: 3200, max: 6400, rate: 0.03 },      // 3% $3,200–$6,400
  { min: 6400, max: Infinity, rate: 0.064 },  // 6.4% over $6,400
];

function calculateSCTax(annualIncome) {
  // SC uses a progressive bracket system on taxable income
  // Simplified: first $3,200 at 0%, next $3,200 at 3%, remainder at 6.4%
  const brackets = [
    { min: 0, max: 3200, rate: 0.00 },
    { min: 3200, max: 6400, rate: 0.03 },
    { min: 6400, max: Infinity, rate: 0.064 },
  ];
  let tax = 0;
  for (const b of brackets) {
    if (annualIncome > b.min) {
      const taxable = Math.min(annualIncome, b.max) - b.min;
      tax += taxable * b.rate;
    }
  }
  return tax;
}

function calculateFICA(annualIncome) {
  // Social Security 6.2% up to $176,100 (2026), Medicare 1.45% uncapped
  const ssWageBase = 176100;
  const ss = Math.min(annualIncome, ssWageBase) * 0.062;
  const medicare = annualIncome * 0.0145;
  return ss + medicare;
}

function calculateFederalTax(annualIncome) {
  // 2025-2026 standard deduction: ~$15,000 single filer
  // Using simplified brackets for the estimator
  const standardDeduction = 15000;
  const taxableIncome = Math.max(0, annualIncome - standardDeduction);

  // Simplified 2025 brackets (single filer)
  const brackets = [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: Infinity, rate: 0.35 },
  ];
  let tax = 0;
  for (const b of brackets) {
    if (taxableIncome > b.min) {
      const taxable = Math.min(taxableIncome, b.max) - b.min;
      tax += taxable * b.rate;
    }
  }
  return tax;
}

const TaxCalculatorView = () => {
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('MONTHLY');
  const [filingStatus, setFilingStatus] = useState('single');

  const freq = FREQUENCIES.find(f => f.value === frequency);
  const annualIncome = (parseFloat(amount) || 0) * (freq?.multiplier || 12);

  const federalAnnual = calculateFederalTax(annualIncome);
  const scAnnual = calculateSCTax(annualIncome);
  const ficaAnnual = calculateFICA(annualIncome);
  const totalTax = federalAnnual + scAnnual + ficaAnnual;
  const takeHome = annualIncome - totalTax;

  const fmt = (val) => val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtSmall = (val) => val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const caption = freq?.label?.toLowerCase() || 'monthly';

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Tax Calculator</h1>
        <p className="text-slate-500">South Carolina-specific take-home pay estimator for solo attorneys.</p>
      </div>

      {/* Input Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2 md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Income</label>
            <div className="relative rounded-md shadow-sm group">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <DollarSign size={18} className="text-gray-400" />
              </div>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 pl-10"
                placeholder="5,000"
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Frequency</label>
            <select
              value={frequency}
              onChange={e => setFrequency(e.target.value)}
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4"
            >
              {FREQUENCIES.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Filing Status</label>
            <select
              value={filingStatus}
              onChange={e => setFilingStatus(e.target.value)}
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4"
            >
              <option value="single">Single</option>
              <option value="married">Married Filing Jointly</option>
            </select>
          </div>
        </div>
      </div>

      {amount && parseFloat(amount) > 0 && (
        <>
          {/* Breakdown Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Annual Tax Breakdown</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-slate-600">Gross Annual Income</span>
                <span className="text-xl font-bold text-slate-900">${fmt(annualIncome)}</span>
              </div>

              <div className="pl-4 space-y-2">
                <div className="flex justify-between items-center py-2 text-sm">
                  <span className="text-slate-500">Federal Income Tax</span>
                  <span className="text-red-500 font-medium">-${fmt(federalAnnual)}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-sm">
                  <span className="text-slate-500">South Carolina State Tax</span>
                  <span className="text-red-500 font-medium">-${fmt(scAnnual)}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-sm">
                  <span className="text-slate-500">FICA (Social Security + Medicare)</span>
                  <span className="text-red-500 font-medium">-${fmt(ficaAnnual)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-4 border-t-2 border-slate-200">
                <span className="text-lg font-bold text-slate-900">Estimated Take-Home Pay</span>
                <span className="text-2xl font-extrabold text-green-600">${fmt(takeHome)}</span>
              </div>

              <div className="flex justify-between items-center py-2 text-sm">
                <span className="text-slate-500">Effective Tax Rate</span>
                <span className="font-medium text-slate-700">
                  {annualIncome > 0 ? ((totalTax / annualIncome) * 100).toFixed(1) : '0.0'}%
                </span>
              </div>
            </div>
          </div>

          {/* Per-Paycheck Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Per-{caption} Breakdown</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Gross</span>
                <span className="text-xl font-bold text-slate-900">${fmt(parseFloat(amount) || 0)}</span>
              </div>
              <div className="bg-red-50 rounded-xl p-4 text-center">
                <span className="block text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Taxes</span>
                <span className="text-xl font-bold text-red-500">${fmt(totalTax / (freq?.multiplier || 12))}</span>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <span className="block text-xs font-bold text-green-400 uppercase tracking-wider mb-1">Take-Home</span>
                <span className="text-xl font-bold text-green-600">${fmt(takeHome / (freq?.multiplier || 12))}</span>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <span className="block text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Tax Rate</span>
                <span className="text-xl font-bold text-blue-600">
                  {annualIncome > 0 ? ((totalTax / annualIncome) * 100).toFixed(1) : '0.0'}%
                </span>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <BadgeInfo size={20} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800">
              This is an <strong>estimate</strong> based on simplified 2025-2026 tax brackets (single filer, standard deduction).
              SC uses a progressive system taxed at 0% (first $3,200), 3% ($3,200-$6,400), and 6.4% (over $6,400).
              Consult a CPA for exact figures.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default TaxCalculatorView;
