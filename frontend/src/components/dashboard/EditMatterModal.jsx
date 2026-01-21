import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const EditMatterModal = ({ isOpen, onClose, matter, onSave }) => {
    const [formData, setFormData] = useState({
        title: '',
        case_number: '',
        status: 'ACTIVE'
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (matter) {
            setFormData({
                title: matter.title || '',
                case_number: matter.case_number || '',
                status: matter.status || 'ACTIVE'
            });
        }
    }, [matter]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        await onSave(matter.id, {
            title: formData.title,
            court_case_number: formData.case_number,
            status: formData.status
        });
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Edit Matter Details</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Case Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="e.g. Smith vs. Jones"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Case Number</label>
                        <input
                            type="text"
                            value={formData.case_number}
                            onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                            className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="e.g. 2025-DR-10-1234"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="LEAD">Lead</option>
                            <option value="QUALIFIED">Qualified</option>
                            <option value="CLOSED">Closed</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditMatterModal;
