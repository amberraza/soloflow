import React from 'react';
import { useForm } from 'react-hook-form';
import useFinancialStore from '../../store/useFinancialStore';
import WizardLayout from './WizardLayout';
import { User, MapPin, Hash, ArrowRight } from 'lucide-react';

const Step1CaseBasics = ({ onNext }) => {
    const { wizardData, updateSection } = useFinancialStore();
    const { register, handleSubmit } = useForm({
        defaultValues: wizardData.caseBasics
    });

    const onSubmit = (data) => {
        updateSection('caseBasics', data);
        onNext();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Parties & Jurisdiction</h3>
                <p className="text-gray-500 text-sm">Let's start with the basic information for your case.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Plaintiff */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Plaintiff (You)</label>
                    <div className="relative rounded-lg shadow-sm group">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <User size={18} className="text-gray-400 group-focus-within:text-blue-500" />
                        </div>
                        <input
                            {...register("plaintiff", { required: true })}
                            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 pl-10 transition-all outline-none font-medium text-gray-900 placeholder-gray-400"
                            placeholder="Jane Doe"
                        />
                    </div>
                </div>

                {/* Defendant */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Defendant (Other Parent)</label>
                    <div className="relative rounded-lg shadow-sm group">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <User size={18} className="text-gray-400 group-focus-within:text-blue-500" />
                        </div>
                        <input
                            {...register("defendant")}
                            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 pl-10 transition-all outline-none font-medium text-gray-900 placeholder-gray-400"
                            placeholder="John Doe"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* County */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Filing County</label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 z-10">
                            <MapPin size={18} className="text-gray-400" />
                        </div>
                        <select
                            {...register("county")}
                            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 pl-10 pr-10 appearance-none transition-all outline-none font-medium text-gray-900 cursor-pointer"
                        >
                            <option value="Charleston">Charleston County</option>
                            <option value="Richland">Richland County</option>
                            <option value="Greenville">Greenville County</option>
                            <option value="Horry">Horry County</option>
                            <option value="Spartanburg">Spartanburg County</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                {/* Case Number */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Case Number (Optional)</label>
                    <div className="relative rounded-lg shadow-sm group">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <Hash size={18} className="text-gray-400 group-focus-within:text-blue-500" />
                        </div>
                        <input
                            {...register("caseNumber")}
                            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 pl-10 transition-all outline-none font-medium text-gray-900 placeholder-gray-400"
                            placeholder="202X-DR-XX-XXXX"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-8 border-t border-gray-100 mt-8">
                <button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2">
                    Next: Income <ArrowRight size={18} />
                </button>
            </div>
        </form>
    );
};

export default Step1CaseBasics;
