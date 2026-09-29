import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;
    const [previewUrl, setPreviewUrl] = useState(user.profile_photo_url || null);

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            jabatan: user.jabatan || '',
            email: user.email,
            profile_photo: null,
        });

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setData('profile_photo', file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    useEffect(() => () => {
        if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    }, [previewUrl]);

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Profile Information
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Kelola identitas, jabatan, email, dan foto profil akun Anda.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div className="overflow-hidden rounded-xl border border-perhutani-100 bg-gradient-to-br from-perhutani-50 via-white to-emerald-50 p-4 sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-perhutani-700 ring-4 ring-perhutani-50">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview foto profil" className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
                                {(user.name || user.username || '?').slice(0, 1).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div>
                        <InputLabel htmlFor="profile_photo" value="Foto profil" />
                        <input
                            id="profile_photo"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handlePhotoChange}
                            className="mt-2 block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-perhutani-50 file:px-3 file:py-2 file:font-semibold file:text-perhutani-700 hover:file:bg-perhutani-100"
                        />
                        <p className="mt-1 text-xs text-gray-500">JPG, PNG, atau WEBP. Maksimal 2 MB.</p>
                        <InputError className="mt-2" message={errors.profile_photo} />
                    </div>
                    </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="name" value="Nama lengkap" />

                        <TextInput
                            id="name"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            isFocused
                            autoComplete="name"
                        />

                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="jabatan" value="Jabatan" />
                        <TextInput
                            id="jabatan"
                            className="mt-1 block w-full"
                            value={data.jabatan}
                            onChange={(e) => setData('jabatan', e.target.value)}
                            placeholder="Contoh: Kepala Divisi Regional"
                            autoComplete="organization-title"
                        />
                        <p className="mt-1 text-xs text-gray-500">Jabatan akan tampil di profil dan menu akun.</p>
                        <InputError className="mt-2" message={errors.jabatan} />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">
                            Saved.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
