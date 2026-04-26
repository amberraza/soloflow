import React from 'react';
import LiveCalculatorSidebar from './LiveCalculatorSidebar';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const STEPS = [
    { id: 1, label: 'Case Basics' },
    { id: 2, label: 'Income' },
    { id: 3, label: 'Deductions' },
    { id: 4, label: 'Expenses' },
    { id: 5, label: 'Custody' },
];

const WizardLayout = ({ children, title, currentStep, isWidget }) => {
    return (
        <div className={`min-h-screen bg-slate-50 font-sans ${isWidget ? 'pb-0 bg-transparent' : 'pb-20'}`}>
            {/* Header / Nav - Hide if Widget */}
            {!isWidget && (
                <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-30 shadow-sm">
                    <div className="max-w-6xl mx-auto flex items-center justify-between">
                        <Link to="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                            <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">S</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900 tracking-tight">SoloFlow</span>
                        </Link>
                        <div className="text-sm text-gray-500 font-medium">
                            Financial Declaration Wizard
                        </div>
                    </div>
                </header>
            )}

            <div className={`max-w-6xl mx-auto ${isWidget ? 'p-2' : 'p-4 md:p-8'}`}>
                {/* Step Progress */}
                <div className="mb-10 max-w-2xl mx-auto">
                    {/* Step Indicator Circles */}
                    <div className="flex items-center justify-between mb-6 px-2">
                        {STEPS.map((step, idx) => {
                            const isActive = step.id === currentStep;
                            const isCompleted = step.id < currentStep;

                            return (
                                <div key={step.id} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                                                isCompleted
                                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                                    : isActive
                                                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md shadow-blue-200'
                                                    : 'bg-slate-200 text-slate-500'
                                            }`}
                                        >
                                            {isCompleted ? <Check size={16} strokeWidth={3} /> : step.id}
                                        </div>
                                        <span
                                            className={`text-xs font-medium mt-1.5 whitespace-nowrap transition-colors ${
                                                isActive ? 'text-blue-600' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                                            }`}
                                        >
                                            {step.label}
                                        </span>
                                    </div>

                                    {/* Connector Line */}
                                    {idx < STEPS.length - 1 && (
                                        <div className={`flex-1 h-0.5 mx-3 mt-[-1.5rem] transition-colors duration-300 ${
                                            step.id < currentStep ? 'bg-blue-500' : 'bg-slate-200'
                                        }`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight text-center">{title}</h1>
                </div>

                <div className={`grid grid-cols-1 ${isWidget ? '' : 'md:grid-cols-3'} gap-8 items-start`}>
                    {/* Main Form Area (Expand if Widget) */}
                    <div className={`${isWidget ? 'col-span-1' : 'md:col-span-2'}`}>
                        <div className="bg-white shadow-xl rounded-2xl border border-slate-200 overflow-hidden">
                            <div className="p-8">
                                {children}
                            </div>
                        </div>
                        {!isWidget && (
                            <p className="text-center text-slate-400 text-xs mt-8">
                                © 2025 SoloFlow. Secure & Confidential.
                            </p>
                        )}
                    </div>

                    {/* Sidebar (Right 1/3) - Sticky - Hide if Widget */}
                    {!isWidget && (
                        <div className="hidden md:block md:col-span-1 sticky top-28">
                            <LiveCalculatorSidebar />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WizardLayout;
