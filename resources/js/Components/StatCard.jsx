export default function StatCard({ title, value, subtitle, icon, color = 'perhutani' }) {
    const colorMap = {
        perhutani: 'bg-perhutani-100 text-perhutani-700',
        blue: 'bg-blue-100 text-blue-700',
        amber: 'bg-amber-100 text-amber-700',
        purple: 'bg-purple-100 text-purple-700',
        red: 'bg-red-100 text-red-700',
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {title}
                </span>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
                    {icon}
                </div>
            </div>

            <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                {value}
            </div>

            {subtitle && (
                <div className="text-xs text-gray-500">{subtitle}</div>
            )}
        </div>
    );
}
