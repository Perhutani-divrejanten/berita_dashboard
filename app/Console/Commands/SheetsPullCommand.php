<?php

namespace App\Console\Commands;

use App\Models\Berita;
use App\Services\GoogleSheetsCsvService;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class SheetsPullCommand extends Command
{
    protected $signature = 'sheets:pull {--dry-run : Preview tanpa simpan}';
    protected $description = 'Tarik berita dari Google Sheets ke MySQL';

    public function handle(GoogleSheetsCsvService $service): int
    {
        $this->info('🔄 Mulai tarik data dari Google Sheets...');

        $rows = $service->fetchRows();

        if (empty($rows)) {
            $this->error('❌ Tidak ada data dari Sheets.');
            return self::FAILURE;
        }

        $this->info('📥 Dapat ' . count($rows) . ' baris dari Sheets.');
        $this->newLine();

        $inserted = 0;
        $updated = 0;
        $skipped = 0;
        $errors = 0;
        $dryRun = $this->option('dry-run');

        foreach ($rows as $row) {
            try {
                // Skip baris tanpa slug/title
                if (empty($row['slug']) || empty($row['title'])) {
                    $skipped++;
                    continue;
                }

                $data = [
                    'slug'         => trim($row['slug']),
                    'title'        => trim($row['title']),
                    'date'         => $this->parseDate($row['date'] ?? null),
                    'category'     => trim($row['category'] ?? 'Umum'),
                    'badge'        => !empty($row['badge']) ? trim($row['badge']) : null,
                    'image'        => !empty($row['image']) ? trim($row['image']) : null,
                    'excerpt'      => Str::limit(trim($row['excerpt'] ?? ''), 500, ''),
                    'content'      => trim($row['content'] ?? ''),
                    'author'       => trim($row['author'] ?? 'Admin'),
                    'is_published' => $this->parseBool($row['TRUE'] ?? $row['true'] ?? false),
                ];

                if ($dryRun) {
                    $this->line("  [DRY] {$data['slug']}");
                    continue;
                }

                $existing = Berita::where('slug', $data['slug'])->first();

                if ($existing) {
                    if ($this->hasChanges($existing, $data)) {
                        $existing->update($data);
                        $updated++;
                        $this->line("  ♻️  Update: {$data['slug']}");
                    } else {
                        $skipped++;
                    }
                } else {
                    Berita::create($data);
                    $inserted++;
                    $this->line("  ✅ Insert: {$data['slug']}");
                }
            } catch (\Exception $e) {
                $errors++;
                $this->error("  ❌ Error pada slug '{$row['slug']}': " . $e->getMessage());
            }
        }

        if (!$dryRun) {
            $this->newLine();
            $this->info('📊 Hasil sync:');
            $this->table(
                ['Status', 'Jumlah'],
                [
                    ['✅ Insert baru', $inserted],
                    ['♻️  Update', $updated],
                    ['⏭️  Skip (sama)', $skipped],
                    ['❌ Error', $errors],
                ]
            );
        }

        return self::SUCCESS;
    }

    protected function parseDate(?string $date): string
    {
        if (!$date) return now()->toDateString();

        try {
            // Handle format "20/09/2026" atau "2026-09-20" atau "Sep 20, 2026"
            return \Carbon\Carbon::parse($date)->toDateString();
        } catch (\Exception $e) {
            return now()->toDateString();
        }
    }

    protected function parseBool($value): bool
    {
        if (is_bool($value)) return $value;
        $v = strtoupper(trim((string) $value));
        return in_array($v, ['TRUE', '1', 'YES', 'YA']);
    }

    protected function hasChanges(Berita $existing, array $data): bool
    {
        foreach ($data as $key => $value) {
            $old = $existing->$key;
            // Normalize date
            if ($key === 'date' && $old instanceof \Carbon\Carbon) {
                $old = $old->toDateString();
            }
            if ((string) $old !== (string) $value) {
                return true;
            }
        }
        return false;
    }
}
