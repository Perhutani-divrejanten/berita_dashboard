import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const actionLabels = {
    created: 'Berita dibuat',
    updated: 'Berita diperbarui',
    deleted: 'Berita dihapus',
};

export default function SheetsBeritaRevisionIndex({ revisions }) {
    return (
        <AuthenticatedLayout title="Riwayat Perubahan Berita">
            <Head title="Riwayat Perubahan Berita" />

            <div className="mx-auto max-w-6xl">
                <div className="mb-5 flex items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Riwayat perubahan berita</h1>
                        <p className="mt-1 text-sm text-gray-500">Seluruh aktivitas pembuatan, penyuntingan, dan penghapusan beserta penggunanya.</p>
                    </div>
                    <Link href={route('sheets-berita.index')} className="text-sm font-semibold text-perhutani-700 hover:text-perhutani-900">
                        Kembali ke berita
                    </Link>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    {revisions.data.length === 0 ? (
                        <p className="px-6 py-12 text-center text-sm text-gray-500">Belum ada perubahan berita.</p>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {revisions.data.map((revision) => (
                                <div key={revision.id} className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-gray-800">{actionLabels[revision.action] || revision.action}</p>
                                        <Link href={route('sheets-berita.show', revision.slug)} className="mt-1 block truncate font-mono text-xs text-perhutani-700 hover:underline">
                                            {revision.slug}
                                        </Link>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Oleh {revision.user?.name || revision.user?.username || revision.user?.email || 'Akun tidak tersedia'}
                                            {revision.user?.role ? ` (${revision.user.role})` : ''}
                                        </p>
                                    </div>
                                    <time className="shrink-0 text-xs text-gray-500">
                                        {revision.created_at ? new Intl.DateTimeFormat('id-ID', {
                                            timeZone: 'Asia/Jakarta', weekday: 'long', day: '2-digit', month: 'long',
                                            year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short',
                                        }).format(new Date(revision.created_at)) : '-'}
                                    </time>
                                </div>
                            ))}
                        </div>
                    )}

                    {revisions.links?.length > 3 && (
                        <div className="flex flex-wrap justify-center gap-1 border-t border-gray-100 px-4 py-4">
                            {revisions.links.map((link, index) => link.url ? (
                                <Link key={index} href={link.url} preserveScroll className={`rounded-md border px-3 py-1.5 text-sm ${link.active ? 'border-perhutani-700 bg-perhutani-700 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                            ) : (
                                <span key={index} className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
