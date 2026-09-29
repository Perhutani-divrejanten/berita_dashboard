import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import Badge from '@/Components/Badge';
import EmptyState from '@/Components/EmptyState';
import { formatDate, normalizeDate } from '@/utils/date';
import { resolveImageUrl } from '@/utils/article.jsx';

const normalizeText = (value) => String(value || '').trim().toLocaleLowerCase('id-ID');

export default function SheetsBeritaIndex({ berita }) {
    const [deletingSlug, setDeletingSlug] = useState(null);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        category: 'all',
        author: 'all',
        month: 'all',
        year: 'all',
    });
    const perPage = 10;

    const categories = useMemo(() => Array.from(new Set(berita
        .flatMap((item) => String(item.category || '').split(','))
        .map((category) => category.trim())
        .filter(Boolean))).sort((first, second) => first.localeCompare(second)), [berita]);

    const authors = useMemo(() => Array.from(new Set(berita
        .map((item) => String(item.author || '').trim())
        .filter(Boolean))).sort((first, second) => first.localeCompare(second)), [berita]);

    const years = useMemo(() => Array.from(new Set(berita
        .map((item) => normalizeDate(item.date).slice(0, 4))
        .filter((year) => /^\d{4}$/.test(year))))
        .sort((first, second) => second.localeCompare(first)), [berita]);

    const filteredBerita = useMemo(() => berita.filter((item) => {
        const date = normalizeDate(item.date);
        const published = item.is_published === true;
        const search = normalizeText(filters.search);
        const searchable = [item.slug, item.title, item.excerpt, item.content, item.category, item.author]
            .map(normalizeText)
            .join(' ');

        if (search && !searchable.includes(search)) return false;
        if (filters.status === 'published' && !published) return false;
        if (filters.status === 'draft' && published) return false;
        const itemCategories = String(item.category || '')
            .split(',')
            .map(normalizeText)
            .filter(Boolean);

        if (filters.category !== 'all' && !itemCategories.includes(normalizeText(filters.category))) return false;
        if (filters.author !== 'all' && normalizeText(item.author) !== normalizeText(filters.author)) return false;
        if (filters.month !== 'all' && date.slice(5, 7) !== filters.month) return false;
        if (filters.year !== 'all' && date.slice(0, 4) !== filters.year) return false;

        return true;
    }), [berita, filters]);

    const totalPages = Math.max(1, Math.ceil(filteredBerita.length / perPage));
    const safePage = Math.min(page, totalPages);
    const visibleBerita = filteredBerita.slice((safePage - 1) * perPage, safePage * perPage);

    const updateFilter = (name, value) => {
        setPage(1);
        setFilters((current) => ({ ...current, [name]: value }));
    };

    const handleDelete = (slug, title) => {
        if (!confirm(`Hapus berita "${title}"?\n\nTindakan ini tidak bisa dibatalkan.`)) {
            return;
        }

        router.delete(route('sheets-berita.destroy', slug), {
            preserveScroll: true,
            onStart: () => setDeletingSlug(slug),
            onFinish: () => setDeletingSlug(null),
        });
    };

    return (
        <AuthenticatedLayout title="Pusat Berita">
            <Head title="Pusat Berita" />

            <div className="max-w-7xl mx-auto">
                <PageHeader
                    title="Pusat Berita"
                    subtitle="Kelola berita yang terhubung dengan pusat data publikasi."
                    action={{
                        href: route('sheets-berita.create'),
                        label: 'Tambah Berita',
                        icon: (
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        ),
                    }}
                />

                {/* Info banner */}
                <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg px-4 py-3 text-sm flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <strong>Pusat data publikasi.</strong> Perubahan berita akan tersimpan dan diteruskan ke kanal publikasi yang terhubung.
                    </div>
                </div>

                <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <h2 className="text-sm font-semibold text-gray-800">Filter berita</h2>
                        <button
                            type="button"
                            onClick={() => {
                                setPage(1);
                                setFilters({ search: '', status: 'all', category: 'all', author: 'all', month: 'all', year: 'all' });
                            }}
                            className="text-xs font-semibold text-perhutani-700 hover:text-perhutani-900"
                        >
                            Reset filter
                        </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <input
                            type="search"
                            value={filters.search}
                            onChange={(event) => updateFilter('search', event.target.value)}
                            placeholder="Cari judul, isi, kategori..."
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm lg:col-span-3"
                        />
                        <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
                            <option value="all">Semua status</option>
                            <option value="published">Sudah terbit</option>
                            <option value="draft">Draf</option>
                        </select>
                        <select value={filters.category} onChange={(event) => updateFilter('category', event.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
                            <option value="all">Semua kategori</option>
                            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                        </select>
                        <select value={filters.author} onChange={(event) => updateFilter('author', event.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
                            <option value="all">Semua penulis</option>
                            {authors.map((author) => <option key={author} value={author}>{author}</option>)}
                        </select>
                        <select value={filters.month} onChange={(event) => updateFilter('month', event.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
                            <option value="all">Semua bulan</option>
                            {Array.from({ length: 12 }, (_, index) => {
                                const month = String(index + 1).padStart(2, '0');
                                return <option key={month} value={month}>{new Date(2000, index).toLocaleString('id-ID', { month: 'long' })}</option>;
                            })}
                        </select>
                        <select value={filters.year} onChange={(event) => updateFilter('year', event.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
                            <option value="all">Semua tahun</option>
                            {years.map((year) => <option key={year} value={year}>{year}</option>)}
                        </select>
                    </div>
                </div>

                {/* Tabel */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {filteredBerita.length === 0 ? (
                        <EmptyState
                            title={berita.length === 0 ? 'Belum ada berita' : 'Tidak ada berita yang cocok'}
                            description={berita.length === 0 ? 'Mulai dengan menambahkan berita pertama.' : 'Coba ubah atau reset filter pencarian.'}
                            action={
                                berita.length === 0 ? (
                                    <Link href={route('sheets-berita.create')} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-perhutani-700 hover:bg-perhutani-800 text-white text-sm font-semibold transition">
                                        Tambah Berita Pertama
                                    </Link>
                                ) : null
                            }
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Judul</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Kategori</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Penulis</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Tanggal</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {visibleBerita.map((b) => (
                                        <tr key={b.slug} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                                                        {b.image ? (
                                                            <img
                                                                src={resolveImageUrl(b.image)}
                                                                alt={b.title}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none';
                                                                    e.currentTarget.parentNode.innerHTML = '<div style="font-size:20px;text-align:center;line-height:48px">📰</div>';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">📰</div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-medium text-gray-800 max-w-md truncate">{b.title}</div>
                                                        <div className="text-xs text-gray-400 md:hidden mt-0.5">
                                                            {b.category} • {b.author}
                                                        </div>
                                                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                                            <span className={`text-[10px] font-semibold ${b.is_published ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                                {b.is_published ? 'Terbit' : 'Draf'}
                                                            </span>
                                                            {b.badge && <span className="text-[10px] font-semibold text-perhutani-700">{b.badge}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell">
                                                <Badge color="indigo" size="sm">{b.category}</Badge>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">{b.author}</td>
                                            <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">
                                                {formatDate(b.date)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link
                                                        href={route('sheets-berita.show', b.slug)}
                                                        title="Lihat berita"
                                                        aria-label={`Lihat berita: ${b.title}`}
                                                        className="p-1.5 text-gray-400 hover:text-perhutani-700 hover:bg-perhutani-50 rounded transition"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                    </Link>
                                                    <Link
                                                        href={route('sheets-berita.edit', b.slug)}
                                                        title="Edit berita"
                                                        aria-label={`Edit berita: ${b.title}`}
                                                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        title="Hapus berita"
                                                        aria-label={`Hapus berita: ${b.title}`}
                                                        onClick={() => handleDelete(b.slug, b.title)}
                                                        disabled={deletingSlug === b.slug}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50 disabled:cursor-wait"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 01-1-1h-4a1 1 0 01-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
                                Menampilkan <span className="font-semibold">{filteredBerita.length}</span> dari <span className="font-semibold">{berita.length}</span> berita
                            </div>
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between gap-3 border-t border-gray-200 px-4 py-3">
                                    <button
                                        type="button"
                                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                                        disabled={safePage === 1}
                                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Sebelumnya
                                    </button>
                                    <span className="text-sm text-gray-500">Halaman {safePage} dari {totalPages}</span>
                                    <button
                                        type="button"
                                        onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                                        disabled={safePage === totalPages}
                                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Berikutnya
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
