import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Badge from '@/Components/Badge';
import { formatDate } from '@/utils/date';
import { ArticleContent, resolveImageUrl } from '@/utils/article.jsx';

export default function SheetsBeritaShow({ berita }) {
    const isPublished = berita.is_published === true;

    return (
        <AuthenticatedLayout title="Detail Berita">
            <Head title={berita.title || 'Detail Berita'} />

            <div className="max-w-4xl mx-auto">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href={route('sheets-berita.index')}
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-perhutani-700 transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Kembali ke Pusat Berita
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('sheets-berita.history', berita.slug)}
                            className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
                        >
                            Riwayat perubahan
                        </Link>
                        <Link
                            href={route('sheets-berita.edit', berita.slug)}
                            className="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                        >
                            Edit berita
                        </Link>
                    </div>
                </div>

                <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    {berita.image && (
                        <div className="overflow-hidden bg-gray-100">
                            <img
                                src={resolveImageUrl(berita.image)}
                                alt={berita.title || 'Gambar berita'}
                                className="block h-auto w-full object-contain"
                                onError={(event) => { event.currentTarget.style.display = 'none'; }}
                            />
                        </div>
                    )}

                    <div className="p-6 lg:p-8">
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                            <Badge color="indigo" size="sm">{berita.category || 'Tanpa Kategori'}</Badge>
                            {berita.badge && <Badge color="amber" size="sm">{berita.badge}</Badge>}
                            <Badge color={isPublished ? 'green' : 'gray'} size="sm">
                                {isPublished ? 'Terbit' : 'Draf'}
                            </Badge>
                        </div>

                        <h1 className="mb-3 text-2xl font-bold leading-tight text-gray-900 lg:text-3xl">
                            {berita.title || 'Tanpa Judul'}
                        </h1>

                        <div className="mb-6 flex flex-wrap gap-x-4 gap-y-1 border-b border-gray-100 pb-6 text-xs text-gray-500">
                            <span>Penulis: {berita.author || 'Anonim'}</span>
                            <span>Tanggal: {formatDate(berita.date, {
                                day: 'numeric', month: 'long', year: 'numeric',
                            })}</span>
                        </div>

                        {berita.excerpt && (
                            <div className="mb-6 border-l-4 border-perhutani-500 pl-4 text-base font-medium italic leading-relaxed text-gray-700">
                                <ArticleContent content={berita.excerpt} />
                            </div>
                        )}

                        <div className="leading-relaxed text-gray-700">
                            <ArticleContent content={berita.content} />
                        </div>
                    </div>
                </article>
            </div>
        </AuthenticatedLayout>
    );
}
