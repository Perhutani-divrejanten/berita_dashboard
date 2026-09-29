import { useEffect, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import SearchInput from '@/Components/SearchInput';
import EmptyState from '@/Components/EmptyState';

export default function KategoriIndex({ kategoris, filters, sheetsConnected = false }) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [status, setStatus] = useState(filters?.status ?? 'all');
    const [deletingId, setDeletingId] = useState(null);
    const searchTimeout = useRef(null);

    useEffect(() => {
        const refresh = window.setInterval(() => {
            router.reload({ only: ['kategoris', 'filters'] });
        }, 30000);

        return () => {
            window.clearInterval(refresh);
            clearTimeout(searchTimeout.current);
        };
    }, []);

    const handleSearchChange = (value) => {
        setSearch(value);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            applyFilters({ search: value, status });
        }, 400);
    };

    const handleStatusChange = (value) => {
        setStatus(value);
        applyFilters({ search, status: value });
    };

    const applyFilters = (params) => {
        router.get(route('kategori.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleDelete = (id, nama) => {
        if (!confirm(`Hapus kategori "${nama}"?\n\nKategori akan dipindahkan ke arsip.`)) {
            return;
        }
        router.delete(route('kategori.destroy', id), {
            preserveScroll: true,
            onStart: () => setDeletingId(id),
            onError: () => window.alert('Kategori gagal dihapus. Coba lagi.'),
            onFinish: () => setDeletingId(null),
        });
    };

    // Warna badge
    const warnaMap = {
        indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        green:  'bg-emerald-100 text-emerald-700 border-emerald-200',
        blue:   'bg-blue-100 text-blue-700 border-blue-200',
        amber:  'bg-amber-100 text-amber-700 border-amber-200',
        red:    'bg-red-100 text-red-700 border-red-200',
        purple: 'bg-purple-100 text-purple-700 border-purple-200',
        gray:   'bg-gray-100 text-gray-700 border-gray-200',
    };

    return (
        <AuthenticatedLayout title="Kategori">
            <Head title="Kategori" />

            <div className="max-w-7xl mx-auto">
                <PageHeader
                    title="Kategori Berita"
                    subtitle="Kelola kategori yang tersedia pada berita"
                    action={{
                        href: route('kategori.create'),
                        label: 'Tambah Kategori',
                        icon: (
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        ),
                    }}
                />

                <div className={`mb-4 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${sheetsConnected
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-amber-200 bg-amber-50 text-amber-800'}`}
                >
                    <span className={`h-2 w-2 rounded-full ${sheetsConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {sheetsConnected
                        ? 'Kategori terhubung ke pusat data publikasi.'
                        : 'Pusat data publikasi belum dapat dihubungi. Jumlah berita belum tersedia.'}
                </div>

                {/* Filter */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <SearchInput
                            value={search}
                            onChange={handleSearchChange}
                            placeholder="Cari nama atau deskripsi kategori..."
                        />
                        <select
                            value={status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white
                                focus:outline-none focus:ring-2 focus:ring-perhutani-600 hover:border-gray-400 transition"
                        >
                            <option value="all">Semua Status</option>
                            <option value="active">Aktif</option>
                            <option value="inactive">Nonaktif</option>
                        </select>
                    </div>
                </div>

                {/* Grid */}
                {kategoris.data.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200">
                        <EmptyState
                            title="Tidak ada kategori"
                            description={
                                search || status !== 'all'
                                    ? 'Coba ubah filter atau kata kunci.'
                                    : 'Mulai dengan menambahkan kategori pertama.'
                            }
                            action={
                                <Link
                                    href={route('kategori.create')}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-perhutani-700 hover:bg-perhutani-800 text-white text-sm font-semibold transition"
                                >
                                    Tambah Kategori Pertama
                                </Link>
                            }
                        />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {kategoris.data.map((k) => (
                                <div
                                    key={k.id}
                                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition p-5 group"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${warnaMap[k.warna] || warnaMap.indigo}`}>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5a2 2 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                        </div>

                                        <div className="flex gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                                            <Link
                                                href={route('kategori.edit', k.id)}
                                                className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition"
                                                title="Edit"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(k.id, k.nama)}
                                                disabled={deletingId === k.id}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition disabled:cursor-wait disabled:opacity-50"
                                                title="Hapus"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                                        {k.nama}
                                        {!k.is_active && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">
                                                Nonaktif
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                                        {k.deskripsi || 'Tanpa deskripsi'}
                                    </p>

                                    <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-100">
                                        <span className="font-mono text-gray-400 truncate">/{k.slug}</span>
                                        <span className="font-semibold text-perhutani-700 whitespace-nowrap">
                                            {k.jumlah_berita} berita
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {kategoris.links && kategoris.links.length > 3 && (
                            <div className="mt-4 flex items-center justify-center gap-1">
                                {kategoris.links.map((link, i) => {
                                    const label = link.label
                                        .replace('&laquo;', '«')
                                        .replace('&raquo;', '»')
                                        .replace('Previous', '‹')
                                        .replace('Next', '›');

                                    if (!link.url) {
                                        return (
                                            <span
                                                key={i}
                                                className="px-3 py-1.5 text-sm rounded-md border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                                                dangerouslySetInnerHTML={{ __html: label }}
                                            />
                                        );
                                    }
                                    return (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            preserveScroll
                                            className={`px-3 py-1.5 text-sm rounded-md border transition ${
                                                link.active
                                                    ? 'bg-perhutani-700 border-perhutani-700 text-white'
                                                    : 'bg-white border-gray-300 hover:bg-gray-100 text-gray-700'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: label }}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                <div className="mt-4 text-xs text-gray-400 text-center">
                    Total: {kategoris.total} kategori
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
