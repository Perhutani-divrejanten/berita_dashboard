<?php

namespace App\Http\Controllers;

use App\Models\Kategori;
use App\Models\SheetBeritaRevision;
use App\Services\GoogleSheetsApiService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class BeritaSheetsController extends Controller
{
    protected GoogleSheetsApiService $sheets;

    public function __construct(GoogleSheetsApiService $sheets)
    {
        $this->sheets = $sheets;
    }

    /** Daftar berita dari Google Sheets */
    public function index()
    {
        $result = $this->sheets->list();
        $isSuccess = (bool) ($result['success'] ?? false);
        $berita = $isSuccess ? ($result['data'] ?? []) : [];
        $berita = is_array($berita) ? array_map([$this, 'normalizeBerita'], $berita) : [];
        usort($berita, static function (array $first, array $second): int {
            return strcmp($second['date'] ?? '', $first['date'] ?? '');
        });

        $response = Inertia::render('SheetsBerita/Index', [
            'berita' => $berita,
        ]);

        if (! $isSuccess) {
            $response->with('error', $result['message'] ?? 'Gagal mengambil berita dari Google Sheets.');
        }

        return $response;
    }

    /** Form tambah */
    public function create()
    {
        return Inertia::render('SheetsBerita/Create', [
            'categories' => $this->activeCategories(),
        ]);
    }

    public function driveImage(string $fileId): Response
    {
        if (! preg_match('/^[A-Za-z0-9_-]{20,200}$/D', $fileId)) {
            abort(404);
        }

        try {
            $image = Http::connectTimeout(3)
                ->timeout(10)
                ->get('https://drive.google.com/uc', [
                    'export' => 'view',
                    'id' => $fileId,
                ]);
        } catch (\Throwable) {
            abort(404);
        }

        $contentType = strtolower(trim(explode(';', $image->header('Content-Type') ?? '')[0]));
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        if (! $image->successful() || ! in_array($contentType, $allowedTypes, true) || strlen($image->body()) > 5 * 1024 * 1024) {
            abort(404);
        }

        return response($image->body(), 200, [
            'Content-Type' => $contentType,
            'Cache-Control' => 'private, max-age=21600',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    /** Detail berita dari Google Sheets */
    public function show(string $slug)
    {
        $result = $this->sheets->get($slug);
        $isSuccess = (bool) ($result['success'] ?? false);

        if (! $isSuccess || ! is_array($result['data'] ?? null)) {
            return redirect()->route('sheets-berita.index')
                ->with('error', $result['message'] ?? 'Berita tidak ditemukan');
        }

        return Inertia::render('SheetsBerita/Show', [
            'berita' => $this->normalizeBerita($result['data']),
            'revisions' => SheetBeritaRevision::with('user:id,name,username,email,role')
                ->where('slug', $slug)
                ->latest()
                ->get(),
        ]);
    }

    /** Riwayat perubahan berita */
    public function history(string $slug)
    {
        return Inertia::render('SheetsBerita/History', [
            'slug' => $slug,
            'revisions' => SheetBeritaRevision::with('user:id,name,username,email,role')
                ->where('slug', $slug)
                ->latest()
                ->get(),
        ]);
    }

    /** Simpan berita baru */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'date' => 'required|string',
            'publish_at' => 'nullable|date_format:Y-m-d\\TH:i',
            'category' => 'required|string|max:255',
            'badge' => 'nullable|string|max:100',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|extensions:jpg,jpeg,png,webp|max:2048',
            'image_url' => 'nullable|url|max:2000',
            'excerpt' => 'nullable|string',
            'content' => 'required|string',
            'author' => 'required|string|max:100',
            'true' => 'required|boolean',  // ← TAMBAH INI
        ]);

        $validated = $this->preparePublicationData($validated);

        // URL publik menjadi sumber utama agar dapat dibaca oleh 101 website.
        if ($request->filled('image_url')) {
            $validated['image'] = trim($validated['image_url']);
        } elseif ($request->hasFile('image')) {
            $file = $request->file('image');
            $path = $file->store('berita', 'public');
            $validated['image'] = asset('storage/'.$path);
        } else {
            $validated['image'] = '';
        }
        unset($validated['image_url']);

        $result = $this->sheets->create($validated);
        $isSuccess = (bool) ($result['success'] ?? false);

        if ($isSuccess) {
            $createdSlug = $result['data']['slug'] ?? $result['slug'] ?? Str::slug($validated['title']);
            $this->recordRevision($createdSlug, 'created', null, $validated);

            return redirect()->route('sheets-berita.index')
                ->with('success', $result['message']);
        }

        return back()->withInput()
            ->with('error', $result['message'] ?? 'Gagal menambah berita');
    }

    /** Form edit */
    public function edit(string $slug)
    {
        $result = $this->sheets->get($slug);
        $isSuccess = (bool) ($result['success'] ?? false);

        if (! $isSuccess) {
            return redirect()->route('sheets-berita.index')
                ->with('error', 'Berita tidak ditemukan');
        }

        return Inertia::render('SheetsBerita/Edit', [
            'berita' => $result['data'],
            'categories' => $this->activeCategories($result['data']['category'] ?? null),
        ]);
    }

    /** Simpan update */
    public function update(Request $request, string $slug)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'date' => 'required|string',
            'publish_at' => 'nullable|date_format:Y-m-d\\TH:i',
            'category' => 'required|string|max:255',
            'badge' => 'nullable|string|max:100',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|extensions:jpg,jpeg,png,webp|max:2048',
            'image_url' => 'nullable|url|max:2000',
            'excerpt' => 'nullable|string',
            'content' => 'required|string',
            'author' => 'required|string|max:100',
            'true' => 'required|boolean',  // ← TAMBAH INI
        ]);

        $validated = $this->preparePublicationData($validated);

        // Ambil data lama untuk tahu gambar lama
        $existing = $this->sheets->get($slug);
        $existingIsSuccess = (bool) ($existing['success'] ?? false);
        $oldImageUrl = $existingIsSuccess ? ($existing['data']['image'] ?? '') : '';
        $oldData = $existingIsSuccess && is_array($existing['data'] ?? null)
            ? $this->normalizeBerita($existing['data'])
            : [];

        $newImagePath = null;

        // URL publik menjadi sumber utama jika diisi bersama file baru.
        if ($request->filled('image_url')) {
            $validated['image'] = trim($validated['image_url']);
        } elseif ($request->hasFile('image')) {
            $file = $request->file('image');
            $newImagePath = $file->store('berita', 'public');
            $validated['image'] = asset('storage/'.$newImagePath);
        } else {
            // Tidak upload gambar baru → pertahankan URL lama
            $validated['image'] = $oldImageUrl;
        }
        unset($validated['image_url']);

        $result = $this->sheets->update($slug, $validated);
        $isSuccess = (bool) ($result['success'] ?? false);

        if ($isSuccess) {
            if ($newImagePath) {
                // Gambar lama aman dihapus setelah Sheets berhasil diperbarui.
                $this->deleteLocalImage($oldImageUrl);
            }

            $this->recordRevision($slug, 'updated', $oldData, $validated);

            return redirect()->route('sheets-berita.index')
                ->with('success', $result['message']);
        }

        if ($newImagePath) {
            Storage::disk('public')->delete($newImagePath);
        }

        return back()->withInput()
            ->with('error', $result['message'] ?? 'Gagal update berita');
    }

    /** Hapus berita */
    public function destroy(string $slug)
    {
        // Ambil data untuk hapus gambar
        $existing = $this->sheets->get($slug);
        $existingIsSuccess = (bool) ($existing['success'] ?? false);
        $oldData = $existingIsSuccess && is_array($existing['data'] ?? null)
            ? $this->normalizeBerita($existing['data'])
            : [];
        if ($existingIsSuccess) {
            $this->deleteLocalImage($existing['data']['image'] ?? '');
        }

        $result = $this->sheets->delete($slug);
        $isSuccess = (bool) ($result['success'] ?? false);

        if ($isSuccess) {
            $this->recordRevision($slug, 'deleted', $oldData, null);

            return redirect()->route('sheets-berita.index')
                ->with('success', $result['message']);
        }

        return redirect()->route('sheets-berita.index')
            ->with('error', $result['message'] ?? 'Gagal hapus berita');
    }

    /**
     * Hapus gambar lokal kalau URL-nya mengarah ke storage kita
     */
    protected function deleteLocalImage(?string $url): void
    {
        if (! $url) {
            return;
        }

        // Hanya hapus kalau URL mengandung "/storage/berita/"
        if (! str_contains($url, '/storage/berita/')) {
            return;
        }

        // Ambil path relatif: "berita/xxx.jpg"
        $path = 'berita/'.basename(parse_url($url, PHP_URL_PATH));

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    protected function normalizeBerita(array $berita): array
    {
        $value = $berita['true']
            ?? $berita['TRUE']
            ?? $berita['is_published']
            ?? $berita['isPublished']
            ?? false;
        $published = is_bool($value)
            ? $value
            : in_array(strtoupper(trim((string) $value)), ['TRUE', '1', 'YES', 'YA'], true);

        $berita['true'] = $published;
        $berita['is_published'] = $published;
        $berita['date'] = $this->normalizeDate($berita['date'] ?? null);
        $berita['publish_at'] = $this->normalizePublishAt($berita['publish_at'] ?? null);

        return $berita;
    }

    protected function normalizeDate($value): string
    {
        if (! $value) {
            return '';
        }

        $rawDate = trim((string) $value);

        try {
            // Google Sheets may return a date-only value as its serial number.
            if (is_numeric($rawDate) && (float) $rawDate > 0 && (float) $rawDate < 100000) {
                return Carbon::create(1899, 12, 30)
                    ->addDays((int) floor((float) $rawDate))
                    ->toDateString();
            }

            if (preg_match('/^(\d{1,2})\s*([\/-])\s*(\d{1,2})\s*\2\s*(\d{4})/', $rawDate, $matches)) {
                return Carbon::createFromDate(
                    (int) $matches[4],
                    (int) $matches[3],
                    (int) $matches[1]
                )->toDateString();
            }

            if (preg_match('/^(\d{4})\s*([\/-])\s*(\d{1,2})\s*\2\s*(\d{1,2})/', $rawDate, $matches)) {
                return Carbon::createFromDate(
                    (int) $matches[1],
                    (int) $matches[2],
                    (int) $matches[3]
                )->toDateString();
            }

            // Google Sheets sering mengirim tanggal lokal sebagai ISO UTC.
            // Konversi ke zona waktu aplikasi sebelum mengambil tanggal kalender.
            return Carbon::parse($rawDate)
                ->setTimezone('Asia/Jakarta')
                ->toDateString();
        } catch (\Throwable) {
            return $rawDate;
        }
    }

    protected function normalizePublishAt($value): string
    {
        if (! $value) {
            return '';
        }

        try {
            return Carbon::parse((string) $value, config('app.timezone'))
                ->setTimezone(config('app.timezone'))
                ->format('Y-m-d\\TH:i');
        } catch (\Throwable) {
            return (string) $value;
        }
    }

    protected function preparePublicationData(array $validated): array
    {
        if (! empty($validated['publish_at'])) {
            $publishAt = Carbon::createFromFormat(
                'Y-m-d\\TH:i',
                $validated['publish_at'],
                config('app.timezone')
            );

            $validated['publish_at'] = $publishAt->format('Y-m-d\\TH:i');
            $validated['true'] = $publishAt->isPast() && (bool) $validated['true'];
        }

        return $validated;
    }

    protected function activeCategories(?string $current = null): array
    {
        $categories = Kategori::query()
            ->active()
            ->orderBy('urutan')
            ->orderBy('nama')
            ->pluck('nama')
            ->values()
            ->all();

        $currentCategories = collect(explode(',', (string) $current))
            ->map(fn ($category) => trim($category))
            ->filter()
            ->all();

        return array_values(array_unique([...$categories, ...$currentCategories]));
    }

    protected function recordRevision(string $slug, string $action, ?array $before, ?array $after): void
    {
        $before ??= [];
        $after ??= [];
        $changes = [];

        foreach (array_unique(array_merge(array_keys($before), array_keys($after))) as $field) {
            if (($before[$field] ?? null) !== ($after[$field] ?? null)) {
                $changes[$field] = [
                    'before' => $before[$field] ?? null,
                    'after' => $after[$field] ?? null,
                ];
            }
        }

        SheetBeritaRevision::create([
            'slug' => $slug,
            'action' => $action,
            'user_id' => Auth::id(),
            'snapshot' => $after ?: $before,
            'changes' => $changes,
        ]);
    }
}
