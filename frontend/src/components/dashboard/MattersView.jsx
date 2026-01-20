import React, { useState, useEffect } from 'react';
import { Download, FileText, Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const MattersView = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [token] = useState(localStorage.getItem('access_token'));

    // In a real app, strict fetch call to get matters list.
    // Here we stub for the single Matter we know exists from the wizard.

    const handleDownloadPDF = async () => {
        setIsLoading(true);
        // Use environment variable or relative path
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
                a.download = "Financial_Declaration.pdf";
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } else {
                const err = await response.json();
                alert(`Error: ${err.detail || err.error || "Download failed"}`);
            }
        } catch (error) {
            console.error(error);
            alert("Network error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Active Matters</h1>
                    <p className="text-slate-500">Manage your cases and documents.</p>
                </div>
                <Link to="/intake/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm">
                    <Plus size={18} /> New Matter
                </Link>
            </div>

            {/* Search/Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by client name, case number..."
                        className="pl-10 w-full rounded-lg border-slate-200 border p-2 focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                </div>
            </div>

            {/* Matters List (Mocked for single item) */}
            <div className="space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">Doe vs. Doe (Pending)</h3>
                                <div className="text-sm text-slate-500 mb-2">Internal Ref: #MT-2025-001</div>
                                <div className="flex gap-2 mt-2">
                                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold uppercase">Active</span>
                                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold uppercase">Family Law</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={handleDownloadPDF}
                                disabled={isLoading}
                                className="border border-slate-200 bg-white text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-50 transition-all flex items-center gap-2 text-sm disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <span className="animate-pulse">Generating...</span>
                                ) : (
                                    <>
                                        <Download size={16} /> SCCA 430 PDF
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Placeholder for empty state if needed */}
            </div>
        </div>
    );
};

export default MattersView;
