import React, { useEffect, useState } from 'react';
import { Download, FileText, LogOut } from 'lucide-react';

const Dashboard = () => {
    const [token, setToken] = useState(localStorage.getItem('access_token'));
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            window.location.href = '/tools/financial-wizard'; // Redirect if not logged in
        }
    }, [token]);

    const handleDownloadPDF = async () => {
        setIsLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        try {
            const response = await fetch(`${API_URL}/api/v1/financials/generate-scca-430-pdf/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = "Financial_Declaration.pdf"; // Fallback name
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } else {
                const err = await response.json();
                alert(`Error downloading PDF: ${err.error || response.statusText}`);
            }
        } catch (error) {
            console.error(error);
            alert("Network error downloading PDF");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/';
    };

    if (!token) return null;

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-30 shadow-sm">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">S</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">SoloFlow</span>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 transition-colors">
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </header>

            <div className="max-w-4xl mx-auto py-12 px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Case Dashboard</h1>
                    <p className="text-slate-500 mt-2">Manage your documents and case details.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h2 className="font-bold text-slate-800 flex items-center gap-2">
                            <FileText className="text-blue-600" /> Documents
                        </h2>
                    </div>

                    <div className="p-8">
                        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all bg-white group">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-600 transition-colors group-hover:text-white text-blue-600">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Financial Declaration (SCCA 430)</h3>
                                    <p className="text-xs text-slate-500">Auto-generated from Wizard data</p>
                                </div>
                            </div>

                            <button
                                onClick={handleDownloadPDF}
                                disabled={isLoading}
                                className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-slate-800 transition-all disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <>Generating...</>
                                ) : (
                                    <>
                                        <Download size={18} /> Download PDF
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
