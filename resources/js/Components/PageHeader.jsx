import { Link } from '@inertiajs/react';

export default function PageHeader({ title, subtitle, action }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                )}
            </div>

            {action && (
                <div className="flex-shrink-0">
                    {typeof action === 'object' && action.href ? (
                        <Link
                            href={action.href}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg
                                bg-perhutani-700 hover:bg-perhutani-800 text-white text-sm font-semibold
                                shadow-sm hover:shadow transition"
                        >
                            {action.icon && <span className="w-4 h-4">{action.icon}</span>}
                            {action.label}
                        </Link>
                    ) : (
                        action
                    )}
                </div>
            )}
        </div>
    );
}
