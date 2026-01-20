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
                {/* Global Progress Bar */}
                <div className="mb-8 max-w-2xl mx-auto">
                    <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                                    Step {currentStep} of {STEPS.length}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-semibold inline-block text-blue-600">
                                    {Math.round((currentStep / STEPS.length) * 100)}%
                                </span>
                            </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-200">
                            <div style={{ width: `${(currentStep / STEPS.length) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"></div>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight text-center mt-4">{title}</h1>
                    </div>
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
