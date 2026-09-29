import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from './Partials/Sidebar';
import Topbar from './Partials/Topbar';

export default function AuthenticatedLayout({ children, title = 'Dashboard' }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { flash } = usePage().props;
    const [showFlash, setShowFlash] = useState(false);

    // Tampilkan flash ketika ada pesan baru
    useEffect(() => {
        if (flash?.success || flash?.error) {
            setShowFlash(true);
            const timer = setTimeout(() => setShowFlash(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    return (
        <div className="h-screen overflow-hidden bg-gray-50 flex">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
                <Topbar
                    onMenuClick={() => setSidebarOpen(true)}
                    title={title}
                />

                <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 lg:p-6">
                    {/* Flash message */}
                    {showFlash && (flash?.success || flash?.error) && (
                        <div className={`mb-4 px-4 py-3 rounded-lg border flex items-start gap-3 animate-in fade-in slide-in-from-top-2
                            ${flash.success
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : 'bg-red-50 border-red-200 text-red-800'}`}
                        >
                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                {flash.success ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                )}
                            </svg>
                            <span className="text-sm font-medium">
                                {flash.success || flash.error}
                            </span>
                            <button
                                onClick={() => setShowFlash(false)}
                                className="ml-auto opacity-60 hover:opacity-100"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {children}
                </main>

                <footer className="px-4 lg:px-6 py-4 border-t border-gray-200 text-center text-xs text-gray-400">
                    © {new Date().getFullYear()} Perhutani Divisi Regional Janten.
                    Seluruh hak cipta dilindungi.
                </footer>
            </div>
        </div>
    );
}
