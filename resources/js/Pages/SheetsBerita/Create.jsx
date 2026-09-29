import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import ImageUpload from '@/Components/ImageUpload';
import CategoryMultiSelect from '@/Components/CategoryMultiSelect';
import RichTextEditor from '@/Components/RichTextEditor';

export default function SheetsBeritaCreate({ categories = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        title:    '',
        date:     new Date().toISOString().split('T')[0],
        publish_at: '',
        category: '',
        badge:    '',
        image:    null,   // sekarang File, bukan string URL
        image_url: '',
        excerpt:  '',
        content:  '',
        author:   '',
        true:     true,   // ← default TRUE (terbit)
    });

    const submit = (e) => {
        e.preventDefault();
        // POST dengan FormData (otomatis karena ada file)
        post(route('sheets-berita.store'), {
            forceFormData: true,
        });
    };

    const inputClass = "w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-perhutani-600 focus:border-transparent";

    return (
        <AuthenticatedLayout title="Tambah Berita">
            <Head title="Tambah Berita" />

            <div className="mx-auto max-w-4xl">
                <PageHeader
                    title="Tambah Berita"
                    subtitle="Lengkapi informasi berikut untuk menyiapkan berita sebelum dipublikasikan."
                    back={{ href: route('sheets-berita.index'), label: 'Kembali' }}
                />

                <form onSubmit={submit} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5 lg:px-8">
                        <p className="text-xs font-semibold uppercase tracking-wider text-perhutani-700">Konten baru</p>
                        <p className="mt-1 text-sm text-gray-500">Lengkapi informasi utama, pilih kategori, lalu simpan berita.</p>
                    </div>

                    <div className="space-y-6 p-6 lg:p-8">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Judul *</label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className={inputClass}
                            placeholder="Contoh: Sinergi Perhutani dengan Kepolisian"
                            required
                        />
                        <InputError message={errors.title} className="mt-1" />
                        <p className="text-xs text-gray-400 mt-1">Identitas URL akan dibuat otomatis oleh sistem.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Jadwal Terbit (opsional)</label>
                        <input
                            type="datetime-local"
                            value={data.publish_at}
                            onChange={(e) => setData('publish_at', e.target.value)}
                            className={inputClass}
                        />
                        <InputError message={errors.publish_at} className="mt-1" />
                        <p className="text-xs text-gray-400 mt-1">Berita akan tetap menjadi draf hingga jadwal terbit tiba.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal *</label>
                            <input
                                type="date"
                                value={data.date}
                                onChange={(e) => setData('date', e.target.value)}
                                className={inputClass}
                                required
                            />
                            <InputError message={errors.date} className="mt-1" />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Kategori *</label>
                            <CategoryMultiSelect
                                value={data.category}
                                onChange={(value) => setData('category', value)}
                                categories={categories}
                                error={errors.category}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Badge</label>
                            <input
                                type="text"
                                value={data.badge}
                                onChange={(e) => setData('badge', e.target.value)}
                                className={inputClass}
                                placeholder="Label kecil (opsional)"
                            />
                            <InputError message={errors.badge} className="mt-1" />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Penulis *</label>
                            <input
                                type="text"
                                value={data.author}
                                onChange={(e) => setData('author', e.target.value)}
                                className={inputClass}
                                placeholder="Nama penulis"
                                required
                            />
                            <InputError message={errors.author} className="mt-1" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Status Publikasi *
                        </label>
                        <select
                            value={data.true ? 'true' : 'false'}
                            onChange={(e) => setData('true', e.target.value === 'true')}
                            className={inputClass}
                        >
                            <option value="true">Terbit</option>
                            <option value="false">Draf</option>
                        </select>
                        <InputError message={errors.true} className="mt-1" />
                        <p className="text-xs text-gray-400 mt-1">
                            Berita draf tidak akan ditampilkan di halaman publik.
                        </p>
                    </div>

                    {/* Upload gambar — pakai komponen ImageUpload */}
                    <ImageUpload
                        value={data.image}
                        onChange={(file) => setData('image', file)}
                        error={errors.image}
                        label="Gambar Berita"
                    />
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Atau URL gambar publik</label>
                        <input
                            type="url"
                            value={data.image_url}
                            onChange={(e) => setData('image_url', e.target.value)}
                            className={inputClass}
                            placeholder="https://drive.google.com/file/d/.../view"
                        />
                        <InputError message={errors.image_url} className="mt-1" />
                        <p className="mt-1 text-xs text-gray-400">Gunakan tautan gambar publik agar dapat ditampilkan di seluruh kanal publikasi.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Ringkasan</label>
                        <RichTextEditor
                            value={data.excerpt}
                            onChange={(value) => setData('excerpt', value)}
                            error={errors.excerpt}
                            placeholder="Ringkasan singkat berita"
                            minHeight="min-h-20"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Isi Berita *</label>
                        <RichTextEditor
                            value={data.content}
                            onChange={(value) => setData('content', value)}
                            error={errors.content}
                            placeholder="Isi lengkap berita..."
                            minHeight="min-h-80"
                        />
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
                        <PrimaryButton disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan Berita'}
                        </PrimaryButton>
                        <Link href={route('sheets-berita.index')}>
                            <SecondaryButton type="button">Batal</SecondaryButton>
                        </Link>
                    </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
