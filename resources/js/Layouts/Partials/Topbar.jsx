import { Link, usePage } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

export default function Topbar({ onMenuClick, title = 'Dashboard' }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notificationSeen, setNotificationSeen] = useState(false);
    const dropdownRef = useRef(null);
    const notificationRef = useRef(null);
    const flash = usePage().props.flash;
    const hasNotification = Boolean(flash?.success || flash?.error);

    // Tutup dropdown kalau klik di luar
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(e.target)) {
                setNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Inisial nama (misal "Mega Admin" → "MA")
    const initials = (user.name || user.username)
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();

    return (
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between h-16 px-4 lg:px-6">

                {/* Kiri: Hamburger + Title */}
                <div className="flex items-center gap-3">
                    {/* Hamburger (mobile only) */}
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-perhutani-700 hover:bg-gray-100 rounded-lg transition"
                        aria-label="Buka menu"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <h1 className="text-base lg:text-lg font-semibold text-gray-800">
                        {title}
                    </h1>
                </div>

                {/* Kanan: Notifikasi + User */}
                <div className="flex items-center gap-2 lg:gap-3">

                    {/* Notifikasi */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => {
                                setNotificationsOpen((open) => !open);
                                setNotificationSeen(true);
                            }}
                            className="relative rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-perhutani-700"
                            aria-label="Notifikasi"
                            aria-expanded={notificationsOpen}
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {hasNotification && !notificationSeen && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />}
                        </button>
                        {notificationsOpen && (
                            <div className="absolute right-0 z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                    <h2 className="text-sm font-semibold text-gray-800">Notifikasi</h2>
                                    {hasNotification && <span className="text-[10px] text-gray-400">Terbaru</span>}
                                </div>
                                {hasNotification ? (
                                    <div className={`mt-3 rounded-md border p-3 text-sm ${flash.success ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
                                        {flash.success || flash.error}
                                    </div>
                                ) : (
                                    <p className="py-6 text-center text-sm text-gray-500">Belum ada notifikasi.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Dropdown User */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 p-1.5 pr-2.5 hover:bg-gray-100 rounded-lg transition"
                        >
                            <div className="w-8 h-8 overflow-hidden rounded-full bg-perhutani-700 text-white flex items-center justify-center text-xs font-bold ring-2 ring-white">
                                {user.profile_photo_url ? (
                                    <img src={user.profile_photo_url} alt="Foto profil" className="h-full w-full object-cover" />
                                ) : initials}
                            </div>
                            <div className="hidden sm:block text-left leading-tight">
                                <div className="text-sm font-semibold text-gray-800">
                                    {user.name || user.username}
                                </div>
                                <div className="text-[10px] text-gray-500 capitalize">
                                    {user.jabatan || user.role}
                                </div>
                            </div>
                            <svg className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                                 fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Menu dropdown */}
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1.5 z-30">
                                {/* Info user */}
                                <div className="px-4 py-2.5 border-b border-gray-100">
                                    <div className="text-sm font-semibold text-gray-800">
                                        {user.name || user.username}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">
                                        {user.email}
                                    </div>
                                    {user.jabatan && <div className="mt-1 text-xs font-medium text-perhutani-700">{user.jabatan}</div>}
                                </div>

                                {/* Menu items */}
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Profil Saya
                                </Link>

                                <div className="border-t border-gray-100 mt-1 pt-1">
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Keluar
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
