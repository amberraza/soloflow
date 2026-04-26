import React, { useMemo } from 'react';
import useFinancialStore from '../../store/useFinancialStore';
import { estimateChildSupport } from '../../utils/scChildSupport';
import { Activity, DollarSign, Calculator, Users, TrendingDown } from 'lucide-react';

// Helper for number formatting
const fmt = (val) => Number(val || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
});

const LiveCalculatorSidebar = () => {
    const wizardData = useFinancialStore((state) => state.wizardData);
    const income = wizardData.income || {};
    const deductions = wizardData.deductions || {};
    const childSupport = wizardData.childSupport || {};

    const grossMonthly = parseFloat(income.grossMonthly) || 0;
    const totalDeductions = (parseFloat(deductions.federalTax) || 0)
        + (parseFloat(deductions.stateTax) || 0)
        + (parseFloat(deductions.fica) || 0)
        + (parseFloat(deductions.healthInsurance) || 0);
    const netMonthly = grossMonthly - totalDeductions;

    // SC Child Support estimate
    const support = useMemo(() => {
        try {
            return estimateChildSupport({
                motherIncome: grossMonthly,
                fatherIncome: grossMonthly * 0.75, // Rough 25% lower as estimate for other parent
                numChildren: parseInt(childSupport.numChildren) || 1,
                motherOvernights: parseInt(childSupport.motherOvernights) || 182
            });
        } catch {
            return null;
        }
    }, [grossMonthly, childSupport.numChildren, childSupport.motherOvernights]);

    return (
        <div className="space-y-6">
            {/* Live Estimates Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-900 p-4 border-b border-slate-800">
                    <h2 className="text-white text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                        <Activity size={16} className="text-emerald-400" /> Live Estimates
                    </h2>
                </div>

                <div className="divide-y divide-slate-100">
                    {/* Gross */}
                    <div className="p-5">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <DollarSign size={12} /> Gross Monthly
                        </p>
                        <p className="text-2xl font-bold text-slate-800 tracking-tight">
                            ${fmt(grossMonthly)}
                        </p>
                    </div>

                    {/* Deductions Breakdown */}
                    <div className="p-5">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <TrendingDown size={12} /> Est. Deductions
                        </p>
                        <div className="space-y-1.5 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Federal Tax</span>
                                <span className="font-medium text-slate-700">${fmt(deductions.federalTax)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">State Tax</span>
                                <span className="font-medium text-slate-700">${fmt(deductions.stateTax)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">FICA</span>
                                <span className="font-medium text-slate-700">${fmt(deductions.fica)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Health Insurance</span>
                                <span className="font-medium text-slate-700">${fmt(deductions.healthInsurance)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Net */}
                    <div className="p-5">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Calculator size={12} /> Est. Net Monthly
                        </p>
                        <p className={`text-2xl font-bold tracking-tight ${netMonthly >= 0 ? 'text-slate-800' : 'text-red-500'}`}>
                            ${fmt(netMonthly)}
                        </p>
                    </div>
                </div>

                {/* SC Child Support Estimate */}
                <div className="bg-emerald-50 p-5 border-t border-emerald-100">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Users size={12} /> SC Child Support Estimate
                    </p>

                    {support && support.estimatedTransfer !== 0 ? (
                        <>
                            <p className={`text-3xl font-extrabold tracking-tight ${support.estimatedTransfer > 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {support.estimatedTransfer > 0 ? '+' : ''}${fmt(Math.abs(support.estimatedTransfer))}
                            </p>
                            <p className="text-xs text-emerald-600/70 mt-1">
                                {support.estimatedTransfer > 0
                                    ? 'Estimated obligation to other parent (monthly)'
                                    : 'Estimated obligation you may receive (monthly)'
                                }
                            </p>
                            <div className="mt-3 pt-3 border-t border-emerald-200/50 text-xs text-emerald-700/80 space-y-1">
                                <div className="flex justify-between">
                                    <span>Combined income</span>
                                    <span className="font-semibold">${fmt(support.combinedIncome)}/mo</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Your share</span>
                                    <span className="font-semibold">{support.motherShare}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Overnights (you)</span>
                                    <span className="font-semibold">{support.motherOvernights}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="text-3xl font-extrabold text-emerald-600 tracking-tight">
                            ${fmt(support?.baseAmount || 0)}
                        </p>
                    )}
                    <p className="text-[10px] text-emerald-600/70 mt-2 font-medium">
                        *Estimated based on SC Guidelines — for reference only
                    </p>
                </div>
            </div>

            {/* Tip Card */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-blue-800 text-xs font-medium leading-relaxed">
                    <strong>Tip:</strong> Ensure all income data matches your latest paystubs to minimize amendments later.
                </p>
            </div>
        </div>
    );
};

export default LiveCalculatorSidebar;
