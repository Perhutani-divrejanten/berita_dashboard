import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const actionLabels = {
    created: 'Berita dibuat',
    updated: 'Berita diperbarui',
    deleted: 'Berita dihapus',
};

const fieldLabels = {
    title: 'Judul',
    date: 'Tanggal berita',
    category: 'Kategori',
    badge: 'Badge',
    image: 'Gambar',
    excerpt: 'Ringkasan',
    content: 'Isi berita',
    author: 'Penulis',
    true: 'Status publikasi',
    is_published: 'Status publikasi',
};

const formatValue = (value) => {
    if (value === null || value === undefined || value === '') return '(kosong)';
    if (typeof value === 'boolean') return value ? 'Terbit' : 'Draf';

    const text = String(value);
    return text.length > 180 ? `${text.slice(0, 180)}...` : text;
};

const formatDateTime = (value) => value
    ? new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
    }).format(new Date(value))
    : '-';

export default function SheetsBeritaHistory({ slug, revisions = [] }) {
    return (
        <AuthenticatedLayout title="Riwayat Perubahan Berita">
            <Head title="Riwayat Perubahan Berita" />

            <div className="mx-auto max-w-5xl">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <Link
                        href={route('sheets-berita.show', slug)}
                        className="inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-perhutani-700"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Kembali ke berita
                    </Link>
                    <span className="max-w-[55%] truncate font-mono text-xs text-gray-400">{slug}</span>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-6 py-5">
                        <h1 className="text-lg font-bold text-gray-900">Riwayat perubahan</h1>
                        <p className="mt-1 text-sm text-gray-500">Catatan perubahan dan pengguna yang melakukan setiap tindakan.</p>
                    </div>

                    {revisions.length === 0 ? (
                        <p className="px-6 py-12 text-center text-sm text-gray-500">Belum ada riwayat untuk berita ini.</p>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {revisions.map((revision) => {
                                const user = revision.user;
                                const changes = Object.entries(revision.changes || {});

                                return (
                                    <div key={revision.id} className="px-6 py-5">
                                        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                                            <div>
                                                <p className="font-semibold text-gray-800">
                                                    {actionLabels[revision.action] || revision.action}
                                                </p>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Oleh {user?.name || user?.username || user?.email || 'Akun tidak tersedia'}
                                                    {user?.role ? ` (${user.role})` : ''}
                                                </p>
                                            </div>
                                            <time dateTime={revision.created_at || undefined} className="text-right text-xs text-gray-500">
                                                <span className="font-semibold text-gray-600">Waktu perubahan</span><br />
                                                {formatDateTime(revision.created_at)}
                                            </time>
                                        </div>

                                        {changes.length > 0 && (
                                            <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
                                                {changes.map(([field, change]) => (
                                                    <div key={field} className="grid grid-cols-1 gap-2 border-b border-gray-100 px-3 py-3 text-xs last:border-b-0 sm:grid-cols-[140px_1fr] sm:items-start">
                                                        <span className="font-semibold text-gray-600">{fieldLabels[field] || field}</span>
                                                        <div className="min-w-0 space-y-1">
                                                            <div className="break-words text-gray-400"><span className="font-semibold">Sebelum:</span> {formatValue(change?.before)}</div>
                                                            <div className="break-words text-gray-700"><span className="font-semibold">Sesudah:</span> {formatValue(change?.after)}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
