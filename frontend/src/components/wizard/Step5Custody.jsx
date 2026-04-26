import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import useFinancialStore from '../../store/useFinancialStore';
import { Loader2, CheckCircle2, AlertCircle, Smile, Heart, ArrowLeft, ArrowRight } from 'lucide-react';

const Step5Custody = ({ onNext, onPrev, onFinish, submitState, submitError }) => {
    const { wizardData, updateSection } = useFinancialStore();
    const { register, handleSubmit, control, setValue } = useForm({
        defaultValues: wizardData.childSupport
    });

    const motherOvernights = useWatch({ control, name: 'motherOvernights' });

    // Auto-update Father's overnights when Mother's slider moves
    useEffect(() => {
        if (motherOvernights !== undefined) {
            const val = parseInt(motherOvernights);
            setValue('fatherOvernights', 365 - val);
        }
    }, [motherOvernights, setValue]);

    const onSubmit = (data) => {
        updateSection('childSupport', data);
        onFinish();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Children</h3>
                <p className="text-gray-500 text-sm">How many children are involved in this action?</p>
            </div>

            {/* Number of Children */}
            <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Number of Children</label>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 z-10">
                        <Smile size={18} className="text-gray-400" />
                    </div>
                    <select
                        {...register("numChildren")}
                        className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 pl-10 pr-10 appearance-none transition-all outline-none font-medium text-gray-900 cursor-pointer"
                    >
                        <option value="1">1 Child</option>
                        <option value="2">2 Children</option>
                        <option value="3">3 Children</option>
                        <option value="4">4 Children</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>

            {/* Custody Slider Card */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 mb-6">
                    <Heart className="text-pink-500 fill-pink-500" size={20} />
                    <h3 className="text-lg font-bold text-gray-900">Custody Schedule (Overnights)</h3>
                </div>

                <div className="flex justify-between items-end mb-4 px-2">
                    <div className="text-left">
                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Mother</span>
                        <span className="block text-3xl font-extrabold text-pink-600">{motherOvernights}</span>
                        <span className="text-xs text-gray-500">nights</span>
                    </div>
                    <div className="text-right">
                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Father</span>
                        <span className="block text-3xl font-extrabold text-blue-600">{365 - (motherOvernights || 0)}</span>
                        <span className="text-xs text-gray-500">nights</span>
                    </div>
                </div>

                <div className="relative h-12 w-full flex items-center">
                    {/* Slider Track Background */}
                    <div className="absolute w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-pink-500 to-blue-500"
                            style={{ width: '100%' }}
                        />
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="365"
                        {...register("motherOvernights")}
                        className="w-full absolute z-20 opacity-0 cursor-pointer h-full"
                    />
                    {/* Visual Thumb (Simplified) */}
                    <div
                        className="absolute h-6 w-1 bg-white z-10 pointer-events-none shadow-sm"
                        style={{ left: `${(motherOvernights / 365) * 100}%`, transform: 'translateX(-50%)' }}
                    ></div>
                </div>

                <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                    <span>0</span>
                    <span>182.5 (50/50 Split)</span>
                    <span>365</span>
                </div>
            </div>

            {/* Error State */}
            {submitState === 'error' && submitError && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                    <p className="text-sm text-red-700">{submitError}</p>
                </div>
            )}

            <div className="flex justify-between pt-8 border-t border-gray-100 mt-8 gap-4">
                <button
                    type="button"
                    onClick={onPrev}
                    disabled={submitState === 'loading'}
                    className="text-gray-500 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    <ArrowLeft size={18} /> Back
                </button>

                {submitState === 'loading' ? (
                    <button
                        type="button"
                        disabled
                        className="flex-1 bg-blue-400 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                        <Loader2 size={20} className="animate-spin" /> Saving...
                    </button>
                ) : submitState === 'success' ? (
                    <button
                        type="button"
                        disabled
                        className="flex-1 bg-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                        <CheckCircle2 size={20} /> Saved!
                    </button>
                ) : (
                    <button
                        type="submit"
                        className="flex-1 bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-green-500/30 hover:bg-green-700 hover:shadow-green-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                    >
                        Generate Financial Declaration <ArrowRight size={20} />
                    </button>
                )}
            </div>
        </form>
    );
};

export default Step5Custody;
