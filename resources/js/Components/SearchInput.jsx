export default function SearchInput({ value, onChange, placeholder = 'Cari...', className = '' }) {
    return (
        <div className={`relative ${className}`}>
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </span>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg
                    bg-white placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-perhutani-600 focus:border-transparent
                    hover:border-gray-400 transition"
            />
        </div>
    );
}
