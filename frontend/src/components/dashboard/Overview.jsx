import React, { useState, useEffect } from 'react';
import { Users, FileText, DollarSign, Activity, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Overview = () => {
    const [activeMattersCount, setActiveMattersCount] = useState(0);
    const [pendingIntakes, setPendingIntakes] = useState(0);
    const [trustBalance, setTrustBalance] = useState(0);
    const [recentMatters, setRecentMatters] = useState([]);
    const [token] = useState(localStorage.getItem('access_token'));

    useEffect(() => {
        const fetchStats = async () => {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            try {
                // Fetch matters
                const mattersRes = await fetch(`${API_URL}/api/v1/matters/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (mattersRes.ok) {
                    const data = await mattersRes.json();
                    setActiveMattersCount(data.length);
                    setRecentMatters(data.slice(0, 3));
                }

                // Fetch trust balance and pending intakes
                const trustRes = await fetch(`${API_URL}/api/v1/billing/trust-balance/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (trustRes.ok) {
                    const trustData = await trustRes.json();
                    setTrustBalance(parseFloat(trustData.trust_balance) || 0);
                    setPendingIntakes(trustData.pending_intakes || 0);
                }
            } catch (error) {
                console.error("Failed to fetch stats", error);
            }
        };
        fetchStats();
    }, [token]);

    const stats = [
        { label: 'Active Matters', value: String(activeMattersCount), icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Pending Intakes', value: String(pendingIntakes), icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Billable Hours (MTD)', value: '0.0', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Trust Balance', value: `$${trustBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: trustBalance > 0 ? 'text-green-600' : 'text-slate-400', bg: trustBalance > 0 ? 'bg-green-50' : 'bg-slate-50' },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Welcome back, Attorney</h1>
                    <p className="text-slate-500 mt-0.5">Here's what's happening in your firm today.</p>
                </div>
                <Link
                    to="/intake/new"
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 flex items-center gap-2"
                >
                    <FileText size={16} /> New Intake
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.bg} ${stat.color}`}>
                                <Icon size={20} />
                            </div>
                            <div className="text-2xl font-bold text-slate-900 mb-0.5">{stat.value}</div>
                            <div className="text-sm text-slate-500">{stat.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Two-column layout below stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Matters */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between p-5 border-b border-slate-100">
                        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                            <Clock size={16} className="text-slate-400" /> Recent Matters
                        </h2>
                        <Link
                            to="/dashboard/matters"
                            className="text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors"
                        >
                            View all
                        </Link>
                    </div>
                    <div className="p-5">
                        {recentMatters.length === 0 ? (
                            <div className="text-center py-10">
                                <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText size={28} className="text-slate-400" />
                                </div>
                                <p className="text-slate-500 font-medium mb-1">No matters yet</p>
                                <p className="text-sm text-slate-400 mb-4">Start your first intake to get rolling.</p>
                                <Link
                                    to="/intake/new"
                                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all"
                                >
                                    Start Intake
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentMatters.map((m) => (
                                    <div
                                        key={m.id}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xs font-bold">
                                                {m.client_name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">{m.client_name}</p>
                                                <p className="text-xs text-slate-400">{m.title} · {m.status}</p>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                                            m.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {m.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick actions / Insights */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="p-5 border-b border-slate-100">
                        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                            <TrendingUp size={16} className="text-slate-400" /> Quick Actions
                        </h2>
                    </div>
                    <div className="p-5 space-y-3">
                        <Link
                            to="/dashboard/matters"
                            className="block w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-sm font-medium text-slate-700"
                        >
                            📋 View all matters
                        </Link>
                        <Link
                            to="/dashboard/settings"
                            className="block w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-sm font-medium text-slate-700"
                        >
                            ⚙️ Update firm settings
                        </Link>
                        <Link
                            to="/tools/financial-wizard"
                            className="block w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-sm font-medium text-slate-700"
                        >
                            🧮 Open financial wizard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
