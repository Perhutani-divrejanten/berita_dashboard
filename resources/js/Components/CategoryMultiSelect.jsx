export default function CategoryMultiSelect({ value, onChange, categories = [], error }) {
    const selected = String(value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

    const toggleCategory = (category) => {
        const next = selected.includes(category)
            ? selected.filter((item) => item !== category)
            : [...selected, category];

        onChange(next.join(', '));
    };

    return (
        <div>
            <div className={`grid grid-cols-1 gap-2 rounded-lg border p-3 sm:grid-cols-2 ${error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50'}`}>
                {categories.length === 0 ? (
                    <p className="col-span-full text-sm text-gray-500">Belum ada kategori aktif. Tambahkan kategori terlebih dahulu.</p>
                ) : (
                    categories.map((category) => (
                        <label key={category} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-700 transition hover:bg-white">
                            <input
                                type="checkbox"
                                checked={selected.includes(category)}
                                onChange={() => toggleCategory(category)}
                                className="rounded border-gray-300 text-perhutani-700 focus:ring-perhutani-600"
                            />
                            <span>{category}</span>
                        </label>
                    ))
                )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
                {selected.length > 0 ? `Terpilih: ${selected.join(', ')}` : 'Pilih satu atau beberapa kategori.'}
            </p>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}
