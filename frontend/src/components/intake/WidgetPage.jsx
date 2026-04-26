import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import FinancialWizard from '../financials/FinancialWizard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const WidgetPage = () => {
    const { firmId } = useParams();
    const [firm, setFirm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!firmId) {
            setLoading(false);
            setError('No firm ID provided');
            return;
        }

        fetch(`${API_URL}/api/v1/intake/firm/${firmId}/`)
            .then(res => {
                if (!res.ok) throw new Error('Firm not found');
                return res.json();
            })
            .then(data => {
                setFirm(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [firmId]);

    // Loading state — minimal, since this is embedded
    if (loading) {
        return (
            <div className="flex items-center justify-center p-8" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <div className="animate-pulse text-slate-400 text-sm">Loading...</div>
            </div>
        );
    }

    // Error state — show a clean message without breaking the host page
    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <p className="text-red-700 text-sm font-medium">Unable to load intake form</p>
                <p className="text-red-500 text-xs mt-1">Please contact the firm directly.</p>
            </div>
        );
    }

    return (
        <div className="widget-container" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {/* Firm Branding Bar */}
            {firm && (
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <span className="text-white font-semibold text-sm truncate">
                            {firm.name}
                        </span>
                        <span className="text-indigo-200 text-xs">Powered by SoloFlow</span>
                    </div>
                </div>
            )}

            {/* Wizard Content */}
            <div className="bg-white">
                <FinancialWizard isWidget={true} />
            </div>
        </div>
    );
};

export default WidgetPage;
