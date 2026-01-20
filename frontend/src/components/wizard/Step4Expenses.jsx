import React from 'react';
import { useForm } from 'react-hook-form';
import useFinancialStore from '../../store/useFinancialStore';
import WizardLayout from './WizardLayout';
import { DollarSign, ArrowLeft, ArrowRight } from 'lucide-react';

const Step4Expenses = ({ onNext, onPrev }) => {
    const { wizardData, updateSection } = useFinancialStore();
    const { register, handleSubmit } = useForm({
        defaultValues: wizardData.expenses
    });

    const onSubmit = (data) => {
        updateSection('expenses', data);
        onNext();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Monthly Expenses</h3>
                <p className="text-gray-500 text-sm">Estimate your average monthly costs.</p>
            </div>

            <div className="space-y-6">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-gray-100 pb-2">Housing & Household</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Rent / Mortgage</label>
                        <div className="relative rounded-md shadow-sm group">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                <DollarSign size={18} className="text-gray-400 group-focus-within:text-blue-500" />
                            </div>
                            <input type="number" step="0.01" {...register("housing")} className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 pl-10 transition-all outline-none font-medium text-gray-900 placeholder-gray-400" placeholder="0.00" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Utilities (Avg)</label>
                        <div className="relative rounded-md shadow-sm group">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                <DollarSign size={18} className="text-gray-400 group-focus-within:text-blue-500" />
                            </div>
                            <input type="number" step="0.01" {...register("utilities")} className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 pl-10 transition-all outline-none font-medium text-gray-900 placeholder-gray-400" placeholder="0.00" />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Food & Household Supplies</label>
                    <div className="relative rounded-md shadow-sm group">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <DollarSign size={18} className="text-gray-400 group-focus-within:text-blue-500" />
                        </div>
                        <input type="number" step="0.01" {...register("food")} className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 pl-10 transition-all outline-none font-medium text-gray-900 placeholder-gray-400" placeholder="0.00" />
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-8 border-t border-gray-100 mt-8 gap-4">
                <button type="button" onClick={onPrev} className="text-gray-500 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center gap-2">
                    <ArrowLeft size={18} /> Back
                </button>
                <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2">
                    Next: Child Support Factors <ArrowRight size={18} />
                </button>
            </div>
        </form>
    );
};

export default Step4Expenses;
