import React, { useState, useEffect } from 'react';
import { Users, FileText, DollarSign, Activity } from 'lucide-react';

const Overview = () => {
    const [activeMattersCount, setActiveMattersCount] = useState(0);
    const [token] = useState(localStorage.getItem('access_token'));

    useEffect(() => {
        const fetchStats = async () => {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            try {
                // Fetch active matters
                const response = await fetch(`${API_URL}/api/v1/matters/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setActiveMattersCount(data.length);
                }
            } catch (error) {
                console.error("Failed to fetch stats", error);
            }
        };
        fetchStats();
    }, [token]);

    const stats = [
        { label: 'Active Matters', value: String(activeMattersCount), icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Pending Intakes', value: '0', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Billable Hours (MTD)', value: '0.0', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Trust Balance', value: '$0.00', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome back, Attorney</h1>
            <p className="text-slate-500 mb-8">Here's what's happening in your firm today.</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color}`}>
                                    <Icon size={20} />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
                            <div className="text-sm text-slate-500">{stat.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Activity or Quick Actions could go here */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-64 flex items-center justify-center text-slate-400">
                Chart / Activity Log Placeholder
            </div>
        </div>
    );
};

export default Overview;
