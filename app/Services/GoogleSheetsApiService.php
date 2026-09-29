<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GoogleSheetsApiService
{
    protected ?string $url;

    protected ?string $token;

    public function __construct()
    {
        $this->url = config('services.google_sheets.exec_url');
        $this->token = config('services.google_sheets.token');
    }

    protected function call(array $payload): array
    {
        if (! $this->url || ! $this->token) {
            return ['success' => false, 'message' => 'Integrasi Google Sheets belum dikonfigurasi.'];
        }

        $payload['token'] = $this->token;

        try {
            $response = Http::connectTimeout(3)
                ->timeout(10)
                ->asJson()
                ->acceptJson()
                ->withOptions([
                    'allow_redirects' => [
                        'max' => 5,
                        'strict' => false,
                        'referer' => true,
                    ],
                ])
                ->post($this->url, $payload);

            if (! $response->successful()) {
                return ['success' => false, 'message' => 'HTTP Error: '.$response->status()];
            }

            $json = $response->json();
            if (is_string($json)) {
                $json = json_decode($json, true);
            }

            return is_array($json) ? $json : ['success' => false, 'message' => 'Response tidak valid'];

        } catch (\Throwable $e) {
            Log::error('GoogleSheetsApiService error: '.$e->getMessage());

            return ['success' => false, 'message' => 'Koneksi Google Sheets gagal.'];
        }
    }

    public function list(): array
    {
        $cacheKey = 'google-sheets:articles:list';
        $ttl = max(1, (int) config('services.google_sheets.cache_ttl', 15));
        $stale = Cache::get($cacheKey);

        if (is_array($stale) && ($stale['success'] ?? false) === true && is_array($stale['data'] ?? null)) {
            return $stale;
        }

        $result = $this->call(['action' => 'list']);

        if (($result['success'] ?? false) === true && is_array($result['data'] ?? null)) {
            Cache::put($cacheKey, $result, now()->addSeconds($ttl));

            return $result;
        }

        if (is_array($stale) && ($stale['success'] ?? false) === true && is_array($stale['data'] ?? null)) {
            return $stale;
        }

        Cache::forget($cacheKey);

        return $result;
    }

    public function get(string $slug): array
    {
        return $this->call(['action' => 'get', 'slug' => $slug]);
    }

    public function create(array $data): array
    {
        $result = $this->call(array_merge(['action' => 'create'], $data));

        if ($result['success'] ?? false) {
            Cache::forget('google-sheets:articles:list');
        }

        return $result;
    }

    public function update(string $slug, array $data): array
    {
        $result = $this->call(array_merge(['action' => 'update', 'slug' => $slug], $data));

        if ($result['success'] ?? false) {
            Cache::forget('google-sheets:articles:list');
        }

        return $result;
    }

    public function delete(string $slug): array
    {
        $result = $this->call(['action' => 'delete', 'slug' => $slug]);

        if ($result['success'] ?? false) {
            Cache::forget('google-sheets:articles:list');
        }

        return $result;
    }
}
