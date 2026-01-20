import React from 'react';
import useFinancialStore from '../../store/useFinancialStore';
import { Activity, DollarSign, Calculator } from 'lucide-react';

const LiveCalculatorSidebar = () => {
    const wizardData = useFinancialStore((state) => state.wizardData);
    const income = wizardData.income || {};
    const deductions = wizardData.deductions || {};

    const annualGross = (parseFloat(income.grossMonthly) || 0) * 12;
    const totalDeductions = (parseFloat(deductions.federalTax) || 0)
        + (parseFloat(deductions.stateTax) || 0)
        + (parseFloat(deductions.fica) || 0)
        + (parseFloat(deductions.healthInsurance) || 0);

    const netMonthly = (parseFloat(income.grossMonthly) || 0) - totalDeductions;

    return (
        <div className="space-y-6">
            {/* Sticky Summary Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-900 p-4 border-b border-slate-800">
                    <h2 className="text-white text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                        <Activity size={16} className="text-emerald-400" /> Live Estimates
                    </h2>
                </div>

                <div className="p-6 space-y-6">
                    {/* Gross Income */}
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Gross Monthly Income</p>
                        <p className="text-2xl font-bold text-slate-800 tracking-tight">
                            ${Number(income.grossMonthly || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* Net Income */}
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Est. Net Monthly</p>
                        <p className="text-2xl font-bold text-slate-800 tracking-tight">
                            ${Number(netMonthly || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                    </div>
                </div>

                <div className="bg-emerald-50 p-6 border-t border-emerald-100">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Estimated Child Support</p>
                    <p className="text-3xl font-extrabold text-emerald-600 tracking-tight">
                        --
                    </p>
                    <p className="text-[10px] text-emerald-600/70 mt-2 font-medium">
                        *Updating in real-time based on SC Guidelines
                    </p>
                </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-blue-800 text-xs font-medium leading-relaxed">
                    <strong>Tip:</strong> Ensure all income data matches your latest paystubs to minimize amendments later.
                </p>
            </div>
        </div>
    );
};

export default LiveCalculatorSidebar;
