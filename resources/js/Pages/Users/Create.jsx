import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';

export default function UsersCreate() {
    const { data, setData, post, processing, errors } = useForm({
        username: '',
        name: '',
        email: '',
        role: 'editor',
        password: '',
        password_confirmation: '',
        is_active: true,
    });

    const submit = (event) => {
        event.preventDefault();
        post(route('users.store'));
    };

    return (
        <UserForm
            title="Tambah Pengguna"
            data={data}
            setData={setData}
            errors={errors}
            processing={processing}
            submit={submit}
        />
    );
}

export function UserForm({ title, data, setData, errors, processing, submit, editing = false }) {
    const fields = [
        ['username', 'Username'],
        ['name', 'Nama Lengkap'],
        ['email', 'Email'],
    ];

    return (
        <AuthenticatedLayout title={title}>
            <Head title={title} />
            <div className="mx-auto max-w-2xl">
                <PageHeader
                    title={title}
                    subtitle="Kelola identitas, peran, status, dan password pengguna"
                    action={(
                        <Link
                            href={route('users.index')}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700"
                        >
                            Kembali
                        </Link>
                    )}
                />

                <form onSubmit={submit} className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    {fields.map(([key, label]) => (
                        <div key={key}>
                            <label className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</label>
                            <input
                                type={key === 'email' ? 'email' : 'text'}
                                value={data[key]}
                                onChange={(event) => setData(key, event.target.value)}
                                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm ${errors[key] ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                            />
                            {errors[key] && <p className="mt-1 text-xs text-red-600">{errors[key]}</p>}
                        </div>
                    ))}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Peran</label>
                            <select
                                value={data.role}
                                onChange={(event) => setData('role', event.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm"
                            >
                                <option value="admin">Admin</option>
                                <option value="editor">Editor</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Status</label>
                            <label className="flex h-11 items-center gap-3 rounded-lg border border-gray-300 px-3.5 text-sm">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(event) => setData('is_active', event.target.checked)}
                                />
                                Aktif
                            </label>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                {editing ? 'Password Baru (opsional)' : 'Password'}
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(event) => setData('password', event.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm"
                            />
                            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Konfirmasi Password</label>
                            <input
                                type="password"
                                value={data.password_confirmation}
                                onChange={(event) => setData('password_confirmation', event.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end border-t border-gray-100 pt-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-perhutani-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
