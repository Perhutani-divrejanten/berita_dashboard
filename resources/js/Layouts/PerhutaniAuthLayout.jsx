import { Link } from '@inertiajs/react';

export default function PerhutaniAuthLayout({ children, title, subtitle }) {
    return (
        <div className="min-h-screen flex flex-col lg:flex-row">

            {/* ============================================================
                SISI KIRI: HERO — Foto Gedung + Branding
                ============================================================ */}
            <aside className="relative lg:w-1/2 flex flex-col justify-between overflow-hidden min-h-[560px] lg:min-h-screen">

                {/* Layer 1: Foto Gedung */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: "url('/images/gedung-janten.jpeg')",
                    }}
                />

                {/* Layer 2: Overlay netral (BUKAN hijau) — supaya foto tetap terlihat natural */}
                {/* Gradient dari kiri gelap ke kanan transparan → teks kebaca, foto tetap muncul */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20" />

                {/* Layer 3: Vignette bawah supaya footer info kebaca */}
                <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent" />

                {/* Layer 4: Sedikit tint hijau super tipis (identitas Perhutani tanpa menutup foto) */}
                <div className="absolute inset-0 bg-perhutani-900/15 mix-blend-multiply" />

                {/* Konten di atas semua layer */}
                <div className="relative z-10 flex flex-col justify-between h-full p-8 lg:p-12 text-white">

                    {/* ==== HEADER: Logo + Nama ==== */}
                    <header className="flex items-center gap-3">
                        {/* Logo langsung tanpa lingkaran putih */}
                        <img
                            src="/images/logo-perhutani.png"
                            alt="Logo Perhutani"
                            className="h-12 lg:h-14 w-auto object-contain drop-shadow-lg"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentNode.innerHTML =
                                    '<span style="font-size:32px">Logo</span>';
                            }}
                        />
                        <div className="leading-tight border-l border-white/30 pl-3">
                            <div className="text-base lg:text-lg font-bold tracking-wide">
                                PERHUTANI
                            </div>
                            <div className="text-[10px] lg:text-[11px] text-white/80 tracking-[0.18em]">
                                DIVISI REGIONAL JANTEN
                            </div>
                        </div>
                    </header>

                    {/* ==== TENGAH: Tagline + Deskripsi ==== */}
                    <div className="my-8 lg:my-0 max-w-lg">
                        <h1 className="text-3xl lg:text-5xl font-bold leading-[1.1] mb-4 drop-shadow-md">
                            Mengelola Hutan,
                            <br />
                            <span className="text-emerald-300">Menyejahterakan</span>
                            <br />
                            Masyarakat
                        </h1>

                        <div className="w-16 h-1 bg-emerald-300 rounded mb-5" />

                        <p className="text-white/90 text-sm lg:text-base leading-relaxed drop-shadow-sm max-w-md">
                            Portal berita dan informasi resmi Perhutani Divisi
                            Regional Janten. Kelola dan bagikan kabar terbaru
                            seputar kehutanan, konservasi, dan pemberdayaan
                            masyarakat desa hutan.
                        </p>
                    </div>

                    {/* ==== BAWAH: Info Kantor + Sejak 1961 ==== */}
                    <footer className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
                            {/* Alamat */}
                            <div className="flex items-start gap-2.5 bg-white/15 backdrop-blur-md rounded-lg px-3 py-2.5 border border-white/20">
                                <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-300"
                                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-xs leading-snug text-white">
                                    Jl. Soekarno-Hatta No. 839,
                                    <br />
                                    Bandung, Jawa Barat 40293
                                </span>
                            </div>
                            {/* Telepon */}
                            <div className="flex items-start gap-2.5 bg-white/15 backdrop-blur-md rounded-lg px-3 py-2.5 border border-white/20">
                                <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-300"
                                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="text-xs leading-snug text-white">
                                    (022) 7801001
                                    <br />
                                    <span className="text-white/70">Senin–Jumat, 08.00–16.00 WIB</span>
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <span className="w-10 h-px bg-white/50" />
                            <span className="text-[10px] text-white/70 tracking-[0.22em]">
                                SEJAK 1961
                            </span>
                        </div>
                    </footer>
                </div>
            </aside>

            {/* ============================================================
                SISI KANAN: FORM LOGIN
                ============================================================ */}
            <main className="lg:w-1/2 flex flex-col justify-between px-6 py-10 lg:px-16 lg:py-12 bg-white">
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-full max-w-md">

                        {/* Mobile: Logo kecil di atas form */}
                        <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                            <img
                                src="/images/logo-perhutani.jpeg"
                                alt="Logo"
                                className="h-10 w-auto object-contain"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentNode.innerHTML = '🌳';
                                }}
                            />
                            <div className="text-left leading-tight border-l border-gray-200 pl-3">
                                <div className="font-bold text-perhutani-800 text-sm">PERHUTANI</div>
                                <div className="text-[10px] text-perhutani-700 tracking-[0.16em]">
                                    DIVISI REGIONAL JANTEN
                                </div>
                            </div>
                        </div>

                        {/* Judul Form */}
                        <div className="mb-8">
                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                                {title}
                            </h2>
                            {subtitle && (
                                <p className="mt-1.5 text-sm text-gray-500">{subtitle}</p>
                            )}
                        </div>

                        {/* Form */}
                        <div>{children}</div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-xs text-gray-400 leading-relaxed">
                    <div className="font-medium text-gray-500 mb-0.5">
                        Perhutani Divisi Regional Janten
                    </div>
                    <div>Jl. Soekarno-Hatta No. 839, Bandung, Jawa Barat 40293</div>
                    <div className="mt-3 text-gray-300">
                        &copy; {new Date().getFullYear()} Perhutani. Seluruh hak cipta dilindungi.
                    </div>
                </div>
            </main>
        </div>
    );
}
