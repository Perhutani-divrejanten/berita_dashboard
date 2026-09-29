import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import ImageUpload from '@/Components/ImageUpload';
import CategoryMultiSelect from '@/Components/CategoryMultiSelect';
import { resolveImageUrl } from '@/utils/article.jsx';
import RichTextEditor from '@/Components/RichTextEditor';

export default function SheetsBeritaEdit({ berita, categories = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        _method:  'put',   // Laravel method spoofing
        title:    berita.title    ?? '',
        date:     berita.date ? String(berita.date).slice(0, 10) : '',
        publish_at: berita.publish_at ? String(berita.publish_at).slice(0, 16) : '',
        category: berita.category ?? '',
        badge:    berita.badge    ?? '',
        image:    null,    // File baru (kalau user upload)
        image_url: berita.image ?? '',
        excerpt:  berita.excerpt  ?? '',
        content:  berita.content  ?? '',
        author:   berita.author   ?? '',
        true:     berita.true === true || berita.true === 'TRUE' || berita.true === 'true',  // ← konversi ke boolean
    });

    const submit = (e) => {
        e.preventDefault();
        // POST + _method=put + forceFormData (karena ada file)
        post(route('sheets-berita.update', berita.slug), {
            forceFormData: true,
        });
    };

    const inputClass = "w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-perhutani-600 focus:border-transparent";

    return (
        <AuthenticatedLayout title="Edit Berita">
            <Head title="Edit Berita" />

            <div className="max-w-3xl mx-auto">
                <PageHeader
                    title="Edit Berita"
                    subtitle="Perbarui informasi berita, lalu simpan perubahan."
                    back={{ href: route('sheets-berita.index'), label: 'Kembali' }}
                />

                <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Identitas URL (tidak dapat diubah)</label>
                        <input
                            type="text"
                            value={berita.slug}
                            disabled
                            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Judul *</label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className={inputClass}
                            required
                        />
                        <InputError message={errors.title} className="mt-1" />
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
                    </div>

                    {/* Upload gambar — tampilkan gambar lama sebagai existingUrl */}
                    <ImageUpload
                        value={data.image}
                        onChange={(file) => setData('image', file)}
                        error={errors.image}
                        existingUrl={resolveImageUrl(berita.image)}
                        label="Gambar Berita"
                    />
                    <p className="text-xs text-gray-400 -mt-2">
                        Kosongkan kalau tidak ingin mengganti gambar.
                    </p>
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

                    <div className="flex items-center gap-3 pt-2">
                        <PrimaryButton disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </PrimaryButton>
                        <Link href={route('sheets-berita.index')}>
                            <SecondaryButton type="button">Batal</SecondaryButton>
                        </Link>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
