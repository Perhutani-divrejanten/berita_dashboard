<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\SheetBeritaRevision;
use App\Services\GoogleSheetsApiService;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(GoogleSheetsApiService $sheets)
    {
        $result = $sheets->list();
        $isSuccess = (bool) ($result['success'] ?? false);
        $beritas = $isSuccess && is_array($result['data'] ?? null)
            ? array_map([$this, 'normalizeBerita'], array_values($result['data']))
            : [];

        usort($beritas, fn (array $first, array $second) =>
            strcmp((string) ($second['date'] ?? ''), (string) ($first['date'] ?? ''))
        );

        $published = array_values(array_filter($beritas, fn (array $berita) => $this->isPublished($berita)));

        $response = Inertia::render('Dashboard', [
            'sheetsConnected' => $isSuccess,
            'stats' => [
                'total' => count($beritas),
                'published' => count($published),
                'draft' => count($beritas) - count($published),
                'users' => User::count(),
            ],
            'recentBeritas' => array_slice($beritas, 0, 5),
        ]);

        if (! $isSuccess) {
            $response->with('error', $result['message'] ?? 'Gagal mengambil data dashboard dari Google Sheets.');
        }

        return $response;
    }

    public function revisions()
    {
        return Inertia::render('SheetsBerita/RevisionIndex', [
            'revisions' => SheetBeritaRevision::with('user:id,name,username,email,role')
                ->latest()
                ->paginate(20),
        ]);
    }

    private function normalizeBerita(array $berita): array
    {
        $value = $berita['true']
            ?? $berita['TRUE']
            ?? $berita['is_published']
            ?? $berita['isPublished']
            ?? false;

        $berita['is_published'] = is_bool($value)
            ? $value
            : in_array(strtoupper(trim((string) $value)), ['TRUE', '1', 'YES', 'YA'], true);

        return $berita;
    }

    private function isPublished(array $berita): bool
    {
        $value = $berita['true']
            ?? $berita['TRUE']
            ?? $berita['is_published']
            ?? $berita['isPublished']
            ?? false;

        if (is_bool($value)) {
            return $value;
        }

        return in_array(strtoupper(trim((string) $value)), ['TRUE', '1', 'YES', 'YA'], true);
    }
}
