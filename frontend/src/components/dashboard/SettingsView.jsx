import React, { useState } from 'react';
import { Save, Building, User, Key, FileText } from 'lucide-react';

const SettingsView = () => {
    const [firmName, setFirmName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [saved, setSaved] = useState(false);

    const handleSave = (e) => {
        e.preventDefault();
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                <p className="text-slate-500 mt-1">Manage your firm profile and preferences.</p>
            </div>

            <div className="space-y-8">
                {/* Firm Profile */}
                <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            <Building size={20} />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-800">Firm Profile</h2>
                    </div>

                    <form onSubmit={handleSave} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Firm Name</label>
                            <input
                                type="text"
                                value={firmName}
                                onChange={(e) => setFirmName(e.target.value)}
                                placeholder="Your Firm, P.A."
                                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@firm.com"
                                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="(555) 123-4567"
                                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="123 Main St, Suite 100"
                                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
                        >
                            <Save size={16} />
                            {saved ? 'Saved!' : 'Save Changes'}
                        </button>
                    </form>
                </section>

                {/* Account */}
                <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                            <User size={20} />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-800">Account</h2>
                    </div>
                    <div className="space-y-3 text-sm text-slate-600">
                        <p>Password management coming soon.</p>
                        <p className="text-xs text-slate-400">You'll be able to update your password and enable two-factor authentication.</p>
                    </div>
                </section>

                {/* Document Defaults */}
                <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-green-100 p-2 rounded-lg text-green-600">
                            <FileText size={20} />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-800">Document Defaults</h2>
                    </div>
                    <div className="space-y-3 text-sm text-slate-600">
                        <p>Default template, signature, and formatting preferences coming soon.</p>
                        <p className="text-xs text-slate-400">Configure retainer templates, SCCA 430 defaults, and e-filing preferences.</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SettingsView;
