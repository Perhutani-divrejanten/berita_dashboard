<?php

namespace App\Console\Commands;

use App\Services\GoogleSheetsApiService;
use Carbon\Carbon;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('sheets:publish-scheduled')]
#[Description('Terbitkan berita Google Sheets yang sudah mencapai waktu jadwal')]
class PublishScheduledBerita extends Command
{
    public function handle(GoogleSheetsApiService $sheets): int
    {
        $result = $sheets->list();

        if (! ($result['success'] ?? false)) {
            $this->error($result['message'] ?? 'Gagal mengambil berita dari Google Sheets.');

            return self::FAILURE;
        }

        $published = 0;

        foreach (($result['data'] ?? []) as $berita) {
            $slug = $berita['slug'] ?? null;
            $publishAt = $berita['publish_at'] ?? $berita['publishAt'] ?? null;

            if (! $slug || ! $publishAt || $this->isPublished($berita)) {
                continue;
            }

            try {
                $isDue = Carbon::parse($publishAt, config('app.timezone'))->isPast();
            } catch (\Throwable) {
                continue;
            }

            if (! $isDue) {
                continue;
            }

            $updated = $sheets->update($slug, ['true' => true]);

            if ($updated['success'] ?? false) {
                $published++;
                $this->info("Berita diterbitkan: {$slug}");
            } else {
                $this->warn("Gagal menerbitkan: {$slug}");
            }
        }

        $this->info("Total berita diterbitkan: {$published}");

        return self::SUCCESS;
    }

    protected function isPublished(array $berita): bool
    {
        $value = $berita['true'] ?? $berita['TRUE'] ?? $berita['is_published'] ?? false;

        return is_bool($value)
            ? $value
            : in_array(strtoupper(trim((string) $value)), ['TRUE', '1', 'YES', 'YA'], true);
    }
}
