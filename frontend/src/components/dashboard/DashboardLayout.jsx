import React, { useState } from 'react';
import { LayoutDashboard, FileText, Settings, PlusCircle, LogOut, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const DashboardLayout = ({ children }) => {
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
        { icon: PlusCircle, label: 'New Intake', path: '/intake/new' },
        { icon: FileText, label: 'Matters', path: '/dashboard/matters' },
        { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            {/* Sidebar */}
            <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-slate-900 text-white hidden md:flex flex-col transition-all duration-300 ease-in-out`}>
                <div className={`p-6 border-b border-slate-800 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg shrink-0">S</div>
                        {!isCollapsed && <span className="text-xl font-bold tracking-tight whitespace-nowrap">SoloFlow</span>}
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    } ${isCollapsed ? 'justify-center' : ''}`}
                                title={isCollapsed ? item.label : ''}
                            >
                                <Icon size={20} className="shrink-0" />
                                {!isCollapsed && <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800 space-y-2">
                    {/* Toggle Button */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-white w-full transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        {isCollapsed ? <ChevronRight size={20} /> : <div className="flex items-center gap-3"><ChevronLeft size={20} /><span className="text-sm">Collapse</span></div>}
                    </button>

                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-red-900/20 hover:text-red-400 w-full transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                        title={isCollapsed ? "Sign Out" : ''}
                    >
                        <LogOut size={20} className="shrink-0" />
                        {!isCollapsed && <span className="font-medium text-sm whitespace-nowrap">Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm md:hidden">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white">S</div>
                        <span className="text-xl font-bold tracking-tight text-slate-900">SoloFlow</span>
                    </div>
                    <button className="text-slate-500"><Menu size={24} /></button>
                </header>

                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
