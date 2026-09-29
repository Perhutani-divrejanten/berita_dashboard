export default function WelcomeBanner({ user }) {
    const hour = new Date().getHours();
    let greeting = 'Selamat Pagi';
    if (hour >= 11 && hour < 15) greeting = 'Selamat Siang';
    else if (hour >= 15 && hour < 18) greeting = 'Selamat Sore';
    else if (hour >= 18) greeting = 'Selamat Malam';

        const today = new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(new Date());

        return (
            <section className="relative isolate overflow-hidden rounded-2xl bg-perhutani-950 shadow-lg shadow-perhutani-900/10" aria-label="Ringkasan sambutan dashboard">
                <div className="absolute inset-0 -z-20 bg-cover bg-center" style={{ backgroundImage: "url('/images/gedung-janten.jpeg')" }} aria-hidden="true" />
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(0,67,44,0.96)_0%,rgba(0,82,56,0.88)_42%,rgba(0,45,35,0.48)_100%)]" aria-hidden="true" />
                <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 [clip-path:polygon(38%_0,100%_0,100%_100%,0_100%)]" aria-hidden="true" />

                <div className="relative flex min-h-[210px] items-end p-6 sm:p-8 lg:min-h-[230px] lg:p-10">
                    <div className="max-w-3xl">
                        <div className="mb-5 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100/80">
                            <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_0_4px_rgba(253,224,71,0.15)]" />
                            Ruang kerja redaksi
                            <span className="text-white/30">/</span>
                            {today}
                        </div>
                        <h2 className="max-w-xl text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-[2.15rem] lg:leading-tight">
                            {greeting}, {user.name || user.username}.
                        </h2>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/85 sm:text-[15px]">
                            Selamat datang di ruang kerja Portal Berita Perhutani Janten. Kelola informasi, siapkan naskah, dan pantau publikasi dari satu tempat.
                        </p>
                        <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-white/80">
                            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-black/10 px-3 py-1.5 backdrop-blur-sm">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                                Sistem siap digunakan
                            </span>
                            <span className="hidden text-white/40 sm:inline">Portal Berita Perhutani Janten</span>
                        </div>
                    </div>
                </div>
            </section>
        );
}
