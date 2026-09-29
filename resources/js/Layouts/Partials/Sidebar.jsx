import { Link, usePage } from '@inertiajs/react';
import NavLink from './NavLink';

export default function Sidebar({ open, onClose }) {
    const { url } = usePage();
    const { auth } = usePage().props;

    const menuItems = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            exact: true,
            icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            name: 'Berita',
            href: '/sheets-berita',
            icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
            ),
        },
        {
            name: 'Kategori',
            href: '/kategori',
            icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5a2 2 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
            ),
        },
        ...(auth?.user?.role === 'admin' ? [{
            name: 'Pengguna',
            href: '/users',
            icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
        }] : []),
        {
            name: 'Profil',
            href: '/profile',
            icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
        },
    ];

    const isActive = (item) => {
        if (item.exact) {
            return url === item.href;
        }
        return url === item.href || url.startsWith(item.href + '/');
    };

    return (
        <>
            {/* Overlay mobile */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-perhutani-900 text-white
                    flex flex-col transition-transform duration-200 ease-out
                    ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                {/* Logo & Brand */}
                <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-3 group">
                        <img
                            src="/images/logo-perhutani.png"
                            alt="Logo Perhutani"
                            className="h-9 w-auto object-contain"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentNode.innerHTML = '<span style="font-size:24px">🌳</span>';
                            }}
                        />
                        <div className="leading-tight border-l border-white/20 pl-3">
                            <div className="text-xs font-bold tracking-wide">PERHUTANI</div>
                            <div className="text-[9px] text-white/60 tracking-[0.15em]">
                                DIVISI REGIONAL JANTEN
                            </div>
                        </div>
                    </Link>

                    {/* Close button mobile */}
                    <button
                        onClick={onClose}
                        className="lg:hidden text-white/70 hover:text-white"
                        aria-label="Tutup menu"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Menu */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    <div className="px-3 pb-2 text-[10px] uppercase tracking-widest text-white/40 font-semibold">
                        Menu Utama
                    </div>
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.name}
                            href={item.href}
                            active={isActive(item)}
                            icon={item.icon}
                            onClick={onClose}
                        >
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer sidebar */}
                <div className="px-5 py-4 border-t border-white/10">
                    <div className="text-[10px] text-white/40 tracking-wide">
                        © {new Date().getFullYear()} Perhutani
                    </div>
                </div>
            </aside>
        </>
    );
}
