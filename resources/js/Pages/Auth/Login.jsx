import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import PerhutaniAuthLayout from '@/Layouts/PerhutaniAuthLayout';

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <PerhutaniAuthLayout
            title="Selamat Datang"
            subtitle="Masuk ke Portal Berita Perhutani Janten"
        >
            <Head title="Masuk" />

            {status && (
                <div className="mb-5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg px-3.5 py-2.5">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                {/* Username */}
                <div>
                    <label
                        htmlFor="username"
                        className="block text-sm font-semibold text-gray-700 mb-1.5"
                    >
                        Username
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </span>
                        <input
                            id="username"
                            type="text"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                            autoComplete="username"
                            autoFocus
                            required
                            placeholder="Masukkan username Anda"
                            className={`w-full pl-11 pr-4 py-3 border rounded-lg text-sm placeholder-gray-400
                                focus:outline-none focus:ring-2 focus:ring-perhutani-600 focus:border-transparent
                                transition
                                ${errors.username
                                    ? 'border-red-400 bg-red-50'
                                    : 'border-gray-300 bg-white hover:border-gray-400'}`}
                        />
                    </div>
                    {errors.username && (
                        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd"
                                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
                            </svg>
                            {errors.username}
                        </p>
                    )}
                </div>

                {/* Password */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label
                            htmlFor="password"
                            className="block text-sm font-semibold text-gray-700"
                        >
                            Password
                        </label>
                    </div>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </span>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            autoComplete="current-password"
                            required
                            placeholder="Masukkan password Anda"
                            className={`w-full pl-11 pr-12 py-3 border rounded-lg text-sm placeholder-gray-400
                                focus:outline-none focus:ring-2 focus:ring-perhutani-600 focus:border-transparent
                                transition
                                ${errors.password
                                    ? 'border-red-400 bg-red-50'
                                    : 'border-gray-300 bg-white hover:border-gray-400'}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-perhutani-700 transition"
                            tabIndex={-1}
                            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                        >
                            {showPassword ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd"
                                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
                            </svg>
                            {errors.password}
                        </p>
                    )}
                </div>

                {/* Remember me */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            id="remember"
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-perhutani-700 focus:ring-perhutani-600 cursor-pointer"
                        />
                        <span className="text-sm text-gray-600">Ingat saya</span>
                    </label>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3 px-4 rounded-lg font-semibold text-sm text-white
                        bg-perhutani-700 hover:bg-perhutani-800 active:bg-perhutani-900
                        focus:outline-none focus:ring-2 focus:ring-perhutani-600 focus:ring-offset-2
                        disabled:opacity-60 disabled:cursor-not-allowed
                        transition shadow-sm hover:shadow"
                >
                    {processing ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Memproses...
                        </span>
                    ) : (
                        'Masuk'
                    )}
                </button>
            </form>

            {/* Info bantuan */}
            <div className="mt-6 text-center text-xs text-gray-400">
                Lupa password? Hubungi administrator IT.
            </div>
        </PerhutaniAuthLayout>
    );
}
