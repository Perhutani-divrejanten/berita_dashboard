import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';

export default function KategoriEdit({ kategori }) {
    if (!kategori) {
        return (
            <AuthenticatedLayout title="Edit Kategori">
                <Head title="Kategori tidak ditemukan" />
                <div className="max-w-2xl mx-auto mt-12">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                        <h2 className="text-lg font-bold text-red-800 mb-2">Kategori Tidak Ditemukan</h2>
                        <Link
                            href={route('kategori.index')}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-perhutani-700 hover:bg-perhutani-800 text-white text-sm font-semibold transition"
                        >
                            ← Kembali
                        </Link>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    const { data, setData, put, processing, errors } = useForm({
        nama:      kategori.nama || '',
        deskripsi: kategori.deskripsi || '',
        warna:     kategori.warna || 'indigo',
        is_active: !!kategori.is_active,
        urutan:    kategori.urutan ?? 0,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('kategori.update', kategori.id));
    };

    const warnaOptions = [
        { value: 'indigo', label: 'Indigo',  preview: 'bg-indigo-500' },
        { value: 'green',  label: 'Hijau',   preview: 'bg-emerald-500' },
        { value: 'blue',   label: 'Biru',    preview: 'bg-blue-500' },
        { value: 'amber',  label: 'Kuning',  preview: 'bg-amber-500' },
        { value: 'red',    label: 'Merah',   preview: 'bg-red-500' },
        { value: 'purple', label: 'Ungu',    preview: 'bg-purple-500' },
        { value: 'gray',   label: 'Abu',     preview: 'bg-gray-500' },
    ];

    return (
        <AuthenticatedLayout title="Edit Kategori">
            <Head title={`Edit: ${kategori.nama}`} />

            <div className="max-w-2xl mx-auto">
                <PageHeader
                    title="Edit Kategori"
                    subtitle={`Identitas URL: ${kategori.slug}`}
                    action={
                        <Link
                            href={route('kategori.index')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg
                                bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold transition"
                        >
                            ← Kembali
                        </Link>
                    }
                />

                <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Nama Kategori <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.nama}
                            onChange={(e) => setData('nama', e.target.value)}
                            className={`w-full px-3.5 py-2.5 text-sm border rounded-lg
                                focus:outline-none focus:ring-2 focus:ring-perhutani-600 focus:border-transparent transition
                                ${errors.nama ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                        />
                        {errors.nama && <p className="mt-1 text-xs text-red-600">{errors.nama}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Deskripsi <span className="text-gray-400 font-normal">(opsional)</span>
                        </label>
                        <textarea
                            value={data.deskripsi}
                            onChange={(e) => setData('deskripsi', e.target.value)}
                            rows={2}
                            maxLength={255}
                            className={`w-full px-3.5 py-2.5 text-sm border rounded-lg resize-none
                                focus:outline-none focus:ring-2 focus:ring-perhutani-600 transition
                                ${errors.deskripsi ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                        />
                        {errors.deskripsi && <p className="mt-1 text-xs text-red-600">{errors.deskripsi}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Warna Badge <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {warnaOptions.map((w) => (
                                <button
                                    key={w.value}
                                    type="button"
                                    onClick={() => setData('warna', w.value)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition text-sm
                                        ${data.warna === w.value
                                            ? 'border-perhutani-700 bg-perhutani-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <span className={`w-4 h-4 rounded-full ${w.preview}`} />
                                    {w.label}
                                </button>
                            ))}
                        </div>
                        {errors.warna && <p className="mt-1 text-xs text-red-600">{errors.warna}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Urutan
                        </label>
                        <input
                            type="number"
                            value={data.urutan}
                            onChange={(e) => setData('urutan', parseInt(e.target.value) || 0)}
                            min="0"
                            className={`w-full px-3.5 py-2.5 text-sm border rounded-lg
                                focus:outline-none focus:ring-2 focus:ring-perhutani-600 transition
                                ${errors.urutan ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                        />
                        {errors.urutan && <p className="mt-1 text-xs text-red-600">{errors.urutan}</p>}
                    </div>

                    <div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-perhutani-700 focus:ring-perhutani-600"
                            />
                            <span className="text-sm text-gray-700">
                                <span className="font-semibold">Aktif</span>
                            </span>
                        </label>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-3 border-t border-gray-100">
                        <Link
                            href={route('kategori.index')}
                            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300
                                hover:bg-gray-50 rounded-lg transition text-center"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 text-sm font-semibold text-white bg-perhutani-700
                                hover:bg-perhutani-800 rounded-lg shadow-sm hover:shadow transition
                                disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
