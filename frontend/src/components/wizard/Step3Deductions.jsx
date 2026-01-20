import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import useFinancialStore from '../../store/useFinancialStore';
import WizardLayout from './WizardLayout';
import { DollarSign, Shield, Calculator, ArrowRight, ArrowLeft } from 'lucide-react';

const Step3Deductions = ({ onNext, onPrev }) => {
    const { wizardData, updateSection } = useFinancialStore();
    const { register, handleSubmit, setValue, getValues } = useForm({
        defaultValues: wizardData.deductions
    });

    const grossMonthly = wizardData.income.grossMonthly || 0;

    const calculateFICA = () => {
        // 7.65% Logic
        const fica = (parseFloat(grossMonthly) * 0.0765).toFixed(2);
        setValue('fica', fica);
    };

    const onSubmit = (data) => {
        updateSection('deductions', data);
        onNext();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Standard Deductions</h3>
                <p className="text-gray-500 text-sm">Enter the monthly amounts for taxes and insurance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Federal */}
                <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Federal Tax</label>
                    <div className="relative rounded-md shadow-sm group">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <DollarSign size={18} className="text-gray-400 group-focus-within:text-blue-500" />
                        </div>
                        <input
                            type="number"
                            step="0.01"
                            {...register("federalTax")}
                            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 pl-10 transition-all outline-none font-medium text-gray-900 placeholder-gray-400"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                {/* State */}
                <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">State Tax</label>
                    <div className="relative rounded-md shadow-sm group">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <DollarSign size={18} className="text-gray-400 group-focus-within:text-blue-500" />
                        </div>
                        <input
                            type="number"
                            step="0.01"
                            {...register("stateTax")}
                            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 pl-10 transition-all outline-none font-medium text-gray-900 placeholder-gray-400"
                            placeholder="0.00"
                        />
                    </div>
                </div>
            </div>

            {/* FICA Section */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <div className="flex flex-col md:flex-row md:items-end gap-4">
                    <div className="flex-1 space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">FICA (Social Security + Medicare)</label>
                        <div className="relative rounded-md shadow-sm group">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                <DollarSign size={18} className="text-gray-400 group-focus-within:text-blue-500" />
                            </div>
                            <input
                                type="number"
                                step="0.01"
                                {...register("fica")}
                                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 pl-10 bg-white transition-all outline-none font-medium text-gray-900 placeholder-gray-400"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={calculateFICA}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-colors whitespace-nowrap"
                    >
                        <Calculator size={18} />
                        Auto-Calculate (7.65%)
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    *Calculated based on your gross monthly income of <span className="font-bold text-gray-600">${grossMonthly}</span>
                </p>
            </div>

            {/* Health Insurance */}
            <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Health Insurance (Total Cost)</label>
                <div className="relative rounded-md shadow-sm group">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <Shield size={18} className="text-gray-400 group-focus-within:text-blue-500" />
                    </div>
                    <input
                        type="number"
                        step="0.01"
                        {...register("healthInsurance")}
                        className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 pl-10 transition-all outline-none font-medium text-gray-900 placeholder-gray-400"
                        placeholder="0.00"
                    />
                </div>
            </div>

            <div className="flex justify-between pt-8 border-t border-gray-100 mt-8 gap-4">
                <button
                    type="button"
                    onClick={onPrev}
                    className="text-gray-500 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center gap-2"
                >
                    <ArrowLeft size={18} /> Back
                </button>
                <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2"
                >
                    Next: Expenses <ArrowRight size={18} />
                </button>
            </div>
        </form>
    );
};

export default Step3Deductions;
