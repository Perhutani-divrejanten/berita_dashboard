<?php

namespace App\Services;

use App\Models\Berita;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GoogleSheetsCsvService
{
    /**
     * Simpan atau perbarui berita melalui Google Apps Script Web App.
     */
    public function upsertBerita(Berita $berita): bool
    {
        $url = config('services.google_sheets.write_url');
        $token = config('services.google_sheets.write_token');

        if (! $url || ! $token || str_contains($url, 'DEPLOYMENT_ID')) {
            Log::warning('GOOGLE_SHEETS_WRITE_URL belum diset; sinkronisasi dilewati.');

            return false;
        }

        try {
            $attributes = $berita->getAttributes();
            $data = [
                'slug' => $attributes['slug'] ?? null,
                'title' => $attributes['title'] ?? null,
                'date' => $attributes['date'] ?? null,
                'category' => $attributes['category'] ?? null,
                'badge' => $attributes['badge'] ?? null,
                'image' => $this->publicImageUrl($attributes['image'] ?? null),
                'excerpt' => $attributes['excerpt'] ?? null,
                'content' => $attributes['content'] ?? null,
                'author' => $attributes['author'] ?? null,
                'true' => (bool) ($attributes['is_published'] ?? false),
                'publish_at' => $attributes['publish_at'] ?? null,
            ];

            $response = $this->sendToSheets($url, $token, array_merge(['action' => 'upsert'], $data));
            $result = $response->json();

            if ($response->successful() && ($result['success'] ?? false) === true) {
                Cache::forget('google-sheets:articles:list');

                return true;
            }

            Log::warning('Google Sheets menolak sinkronisasi berita.', [
                'status' => $response->status(),
                'body' => $result ?: $response->body(),
                'slug' => $attributes['slug'] ?? null,
            ]);
        } catch (ConnectionException $e) {
            Log::warning('Google Sheets tidak dapat dihubungi.', [
                'message' => $e->getMessage(),
                'slug' => $attributes['slug'] ?? null,
            ]);
        }

        return false;
    }

    public function deleteBerita(Berita $berita): bool
    {
        $url = config('services.google_sheets.write_url');
        $token = config('services.google_sheets.write_token');

        if (! $url || ! $token || str_contains($url, 'DEPLOYMENT_ID')) {
            Log::warning('GOOGLE_SHEETS_WRITE_URL belum diset; penghapusan sinkronisasi dilewati.');

            return false;
        }

        try {
            $response = $this->sendToSheets($url, $token, [
                'action' => 'delete',
                'slug' => $berita->slug,
            ]);
            $result = $response->json();

            if ($response->successful() && ($result['success'] ?? false) === true) {
                Cache::forget('google-sheets:articles:list');

                return true;
            }

            Log::warning('Google Sheets menolak penghapusan berita.', [
                'status' => $response->status(),
                'slug' => $berita->slug,
            ]);
        } catch (ConnectionException $e) {
            Log::warning('Google Sheets tidak dapat dihubungi untuk menghapus berita.', [
                'message' => $e->getMessage(),
                'slug' => $berita->slug,
            ]);
        }

        return false;
    }

    protected function publicImageUrl(?string $image): ?string
    {
        if (! $image || filter_var($image, FILTER_VALIDATE_URL)) {
            return $image;
        }

        return rtrim((string) config('filesystems.disks.public.url'), '/').'/'.ltrim($image, '/');
    }

    protected function sendToSheets(string $url, string $token, array $payload)
    {
        return Http::asJson()
            ->acceptJson()
            ->connectTimeout(3)
            ->timeout(10)
            ->withOptions([
                'allow_redirects' => [
                    'max' => 5,
                    'strict' => true,
                    'referer' => true,
                ],
                'verify' => config('services.google_sheets.ca_bundle') ?: true,
            ])
            ->post($url, array_merge(['token' => $token], $payload));
    }

    /**
     * Ambil data dari Google Sheets CSV
     *
     * @return array Array of associative array
     */
    public function fetchRows(): array
    {
        $url = config('services.google_sheets.csv_url');

        if (! $url) {
            Log::error('GOOGLE_SHEETS_CSV_URL belum diset di .env');

            return [];
        }

        try {
            $response = Http::connectTimeout(3)
                ->timeout(10)
                ->withUserAgent('Laravel-Sheets-Sync/1.0')
                ->get($url);

            if (! $response->successful()) {
                Log::error('Gagal ambil CSV dari Google Sheets.', ['status' => $response->status()]);

                return [];
            }

            return $this->parseCsv($response->body());
        } catch (\Exception $e) {
            Log::error('Error baca Sheets: '.$e->getMessage());

            return [];
        }
    }

    /**
     * Parse CSV menjadi array associative
     */
    protected function parseCsv(string $csv): array
    {
        $lines = preg_split('/\r\n|\r|\n/', trim($csv));
        if (count($lines) < 2) {
            return [];
        }

        // Header (baris 1)
        $header = str_getcsv(array_shift($lines));
        $header = array_map('trim', $header);

        $rows = [];
        foreach ($lines as $line) {
            if (trim($line) === '') {
                continue;
            }

            $data = str_getcsv($line);

            // Skip kalau jumlah kolom tidak match
            if (count($data) < count($header)) {
                continue;
            }

            $row = [];
            foreach ($header as $i => $col) {
                $row[$col] = $data[$i] ?? null;
            }
            $rows[] = $row;
        }

        return $rows;
    }
}
