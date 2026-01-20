import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import useFinancialStore from '../../store/useFinancialStore';
import WizardLayout from './WizardLayout';
import { DollarSign } from 'lucide-react';

const Step2Income = ({ onNext, onPrev }) => {
    const { wizardData, updateSection } = useFinancialStore();
    const { register, handleSubmit, control, setValue } = useForm({
        defaultValues: wizardData.income
    });

    // Watch fields to calculate monthly gross in real-time
    const amount = useWatch({ control, name: 'rawAmount' });
    const frequency = useWatch({ control, name: 'frequency' });

    useEffect(() => {
        if (amount && frequency) {
            let monthly = 0;
            const val = parseFloat(amount);
            if (frequency === 'WEEKLY') monthly = val * 4.33;
            if (frequency === 'BI_WEEKLY') monthly = val * 2.166;
            if (frequency === 'SEMI_MONTHLY') monthly = val * 2;
            if (frequency === 'MONTHLY') monthly = val;
            if (frequency === 'ANNUALLY') monthly = val / 12;

            setValue('grossMonthly', monthly.toFixed(2));
        }
    }, [amount, frequency, setValue]);

    const onSubmit = (data) => {
        updateSection('income', data);
        onNext();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Amount Input */}
                <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Amount (Pre-tax)</label>
                    <div className="relative rounded-md shadow-sm group">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <DollarSign size={18} className="text-gray-400 group-focus-within:text-blue-500" />
                        </div>
                        <input
                            type="number"
                            step="0.01"
                            {...register("rawAmount", { required: true })}
                            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 pl-10 transition-all outline-none font-medium text-gray-900 placeholder-gray-400"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                {/* Frequency Select */}
                <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Frequency</label>
                    <div className="relative">
                        <select
                            {...register("frequency")}
                            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 appearance-none transition-all outline-none font-medium text-gray-900 cursor-pointer"
                        >
                            <option value="WEEKLY">Weekly (every week)</option>
                            <option value="BIWEEKLY">Bi-Weekly (every 2 weeks)</option>
                            <option value="SEMIMONTHLY">Semi-Monthly (twice a month)</option>
                            <option value="MONTHLY">Monthly</option>
                            <option value="ANNUALLY">Annually</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calculation Result Card */}
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <span className="block text-slate-900 font-bold text-lg">Court-Adjusted Monthly Gross</span>
                        <span className="block text-slate-500 text-xs font-medium uppercase tracking-wider">Automated Calculation</span>
                    </div>
                </div>

                <div className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    <span className="text-2xl text-slate-400 mr-1">$</span>
                    {/* We use input to mask it cleanly, but styles make it look like text */}
                    <input
                        {...register("grossMonthly")}
                        readOnly
                        className="bg-transparent text-right border-none focus:ring-0 w-32 p-0 m-0 font-inherit cursor-default"
                    />
                </div>
            </div>

            <div className="flex justify-between pt-8 border-t border-gray-100 mt-8 gap-4">
                <button
                    type="button"
                    onClick={onPrev}
                    className="text-gray-500 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                    Back
                </button>
                <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg shadow-lg transition-all"
                >
                    Save & Continue
                </button>
            </div>
        </form>
    );
};

export default Step2Income;
