import { Link } from '@inertiajs/react';

export default function NavLink({ href, active, icon, children, onClick }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                ${
                    active
                        ? 'bg-white/15 text-white shadow-sm'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
        >
            <span className={`w-5 h-5 flex-shrink-0 ${active ? 'text-emerald-300' : 'text-white/60 group-hover:text-emerald-300'} transition-colors`}>
                {icon}
            </span>
            <span>{children}</span>
            {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
        </Link>
    );
}
