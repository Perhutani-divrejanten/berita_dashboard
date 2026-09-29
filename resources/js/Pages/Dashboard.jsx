import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import WelcomeBanner from '@/Components/WelcomeBanner';
import StatCard from '@/Components/StatCard';
import { Head, usePage, Link, router } from '@inertiajs/react';
import { useEffect } from 'react';

export default function Dashboard() {
    const { auth, stats = {}, recentBeritas = [], sheetsConnected = false } = usePage().props;
    const user = auth.user;

    useEffect(() => {
        const refresh = window.setInterval(() => {
            router.reload({ only: ['stats', 'recentBeritas', 'sheetsConnected'] });
        }, 30000);

        return () => window.clearInterval(refresh);
    }, []);

    return (
        <AuthenticatedLayout title="Dashboard">
            <Head title="Dashboard" />

            <div className="space-y-6 max-w-7xl mx-auto">

                {/* Welcome Banner */}
                <WelcomeBanner user={user} />

                <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${sheetsConnected
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-amber-200 bg-amber-50 text-amber-800'}`}
                >
                    <span className={`h-2 w-2 rounded-full ${sheetsConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {sheetsConnected
                        ? 'Pusat data publikasi terhubung.'
                        : 'Pusat data publikasi belum dapat dihubungi. Data belum tersedia.'}
                </div>

                {/* Stat Cards */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                        Ringkasan
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Total Berita"
                            value={stats.total ?? 0}
                            subtitle="Semua berita"
                            color="perhutani"
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                            }
                        />
                        <StatCard
                            title="Published"
                            value={stats.published ?? 0}
                            subtitle="Sudah terbit"
                            color="blue"
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                        />
                        <StatCard
                            title="Draf"
                            value={stats.draft ?? 0}
                            subtitle="Belum terbit"
                            color="amber"
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            }
                        />
                        <StatCard
                            title="Pengguna"
                            value={stats.users ?? 0}
                            subtitle="User terdaftar"
                            color="purple"
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            }
                        />
                    </div>
                </div>

                {/* Aktivitas / Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Quick Actions */}
                    <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-800 mb-4">
                            Aksi Cepat
                        </h3>
                        <div className="space-y-2">
                            <Link
                                href={route('sheets-berita.create')}
                                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-perhutani-500 hover:bg-perhutani-50 transition group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-perhutani-100 text-perhutani-700 flex items-center justify-center group-hover:bg-perhutani-700 group-hover:text-white transition">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-perhutani-800">
                                    Tambah Berita
                                </span>
                            </Link>

                            <Link
                                href={route('sheets-berita.revisions')}
                                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-perhutani-500 hover:bg-perhutani-50 transition group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center group-hover:bg-perhutani-700 group-hover:text-white transition">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-perhutani-800">
                                    Riwayat Perubahan Berita
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* Aktivitas Terbaru */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-800">
                                Aktivitas Terbaru
                            </h3>
                            <Link href={route('sheets-berita.index')} className="text-xs text-perhutani-700 hover:underline">
                                Lihat semua
                            </Link>
                        </div>

                        {recentBeritas.length === 0 ? (
                            <p className="py-12 text-center text-sm text-gray-500">Belum ada berita.</p>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {recentBeritas.map((berita) => {
                                    const isPublished = berita.is_published === true;

                                    return (
                                    <Link key={berita.slug} href={route('sheets-berita.show', berita.slug)} className="flex items-center justify-between gap-4 py-3 hover:bg-gray-50">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-gray-800">{berita.title}</p>
                                            <p className="text-xs text-gray-500">{berita.category} · {berita.author}</p>
                                        </div>
                                        <span className={`shrink-0 text-xs font-semibold ${isPublished ? 'text-green-600' : 'text-amber-600'}`}>
                                            {isPublished ? 'Terbit' : 'Draf'}
                                        </span>
                                    </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
