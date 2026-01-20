import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Loader } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Adjust Login URL to point to backend. 
        // In local dev: absolute path or proxy.
        // For now, hardcode localhost or use env var relative path if using proxy.
        // Given we are deploying separately, we should use VITE_API_URL or relative if proxied.
        // Let's assume relative '/api/v1' if we set up proxy, or full URL.
        // I will use full URL for dev, and we can switch to env var later.
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

        try {
            const response = await fetch(`${API_URL}/api/v1/auth/token/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email, password: password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('access_token', data.access);
                localStorage.setItem('refresh_token', data.refresh);
                window.location.href = '/dashboard';
            } else {
                setError(data.detail || "Invalid credentials");
            }
        } catch (err) {
            setError("Network error. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
                <div className="p-8">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Lock className="text-white" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
                    <p className="text-slate-500 mb-8">Sign in to your SoloFlow account</p>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4 text-left">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input
                                    type="text" // Username is email
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="pl-10 w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="you@firm.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="pl-10 w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                        >
                            {isLoading ? <Loader className="animate-spin" size={20} /> : <>Sign In <ArrowRight size={18} /></>}
                        </button>
                    </form>
                </div>
                <div className="bg-slate-50 p-4 border-t border-slate-100 text-sm text-slate-500">
                    Don't have an account? <a href="/signup" className="text-blue-600 font-semibold hover:underline">Create one</a>
                </div>
            </div>
        </div>
    );
};

export default Login;
