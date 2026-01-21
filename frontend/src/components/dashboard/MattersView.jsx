import React, { useState, useEffect } from 'react';
import { Download, FileText, Search, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const MattersView = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [matters, setMatters] = useState([]);
    const [token] = useState(localStorage.getItem('access_token'));

    useEffect(() => {
        fetchMatters();
    }, []);

    const fetchMatters = async () => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        try {
            const response = await fetch(`${API_URL}/api/v1/matters/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setMatters(data);
            }
        } catch (error) {
            console.error("Failed to fetch matters", error);
        }
    };

    const handleDownloadPDF = async (matterId) => {
        setIsLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

        try {
            // Updated to accept matter_id if needed, but current PDF endpoint might be generic/hardcoded stub?
            // Wait, the PDF endpoint is /api/v1/financials/generate-scca-430-pdf/
            // Does it take an ID? Let's check backend urls. 
            // It was implemented as a generic stub in phase 2/4.
            // Actually implementation_plan says "GenerateSCCA430View".
            // Let's assume for now we pass ?matter_id=XYZ if the backend supports it, 
            // OR if the endpoint is stateful (session based).
            // But looking at previous code, it wasn't taking args transparently.
            // Let's check urls.py content again.
            // "path('matters/<uuid:matter_id>/generate-retainer/', ...)" is there.
            // But the SCCA PDF? 
            // Let's stick to the URL used in the previous hardcoded version for now, 
            // but ideally we should pass the ID.

            const response = await fetch(`${API_URL}/api/v1/financials/generate-scca-430-pdf/?matter_id=${matterId}`, {
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
                a.download = `Financial_Declaration_${matterId.slice(0, 4)}.pdf`;
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

    const handleDelete = async (matterId) => {
        if (!window.confirm("Are you sure you want to delete this matter? This cannot be undone.")) {
            return;
        }

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        try {
            const response = await fetch(`${API_URL}/api/v1/matters/${matterId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Remove locally
                setMatters(prev => prev.filter(m => m.id !== matterId));
            } else {
                alert("Failed to delete matter");
            }
        } catch (error) {
            console.error("Delete error", error);
            alert("Network error");
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

            {/* Matters List */}
            <div className="space-y-4">
                {matters.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                        No active matters found. Start a new intake!
                    </div>
                ) : (
                    matters.map((matter) => (
                        <div key={matter.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900">{matter.client_name} - {matter.title}</h3>
                                        <div className="text-sm text-slate-500 mb-2">Case #: {matter.case_number}</div>
                                        <div className="flex gap-2 mt-2">
                                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold uppercase">{matter.status}</span>
                                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold uppercase">{matter.practice_area}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 items-end">
                                    <button
                                        onClick={() => handleDownloadPDF(matter.id)}
                                        disabled={isLoading}
                                        className="border border-slate-200 bg-white text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-50 transition-all flex items-center gap-2 text-sm disabled:opacity-50 mb-2"
                                    >
                                        {isLoading ? (
                                            <span className="animate-pulse">Generating...</span>
                                        ) : (
                                            <>
                                                <Download size={16} /> SCCA 430 PDF
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(matter.id)}
                                        className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                        title="Delete Matter"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MattersView;
