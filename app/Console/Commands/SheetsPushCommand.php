<?php

namespace App\Console\Commands;

use App\Models\Berita;
use App\Services\GoogleSheetsCsvService;
use Illuminate\Console\Command;

class SheetsPushCommand extends Command
{
    protected $signature = 'sheets:push {--dry-run : Tampilkan data tanpa mengirim}';
    protected $description = 'Kirim seluruh berita dari MySQL ke Google Sheets';

    public function handle(GoogleSheetsCsvService $service): int
    {
        $beritas = Berita::query()->orderBy('id')->get();

        if ($beritas->isEmpty()) {
            $this->warn('Tidak ada berita di database.');
            return self::SUCCESS;
        }

        $this->info("Menyiapkan {$beritas->count()} berita untuk Google Sheets...");
        $success = 0;
        $failed = 0;

        foreach ($beritas as $berita) {
            if ($this->option('dry-run')) {
                $this->line("[DRY] {$berita->slug}");
                continue;
            }

            if ($service->upsertBerita($berita)) {
                $success++;
                $this->line("[OK] {$berita->slug}");
            } else {
                $failed++;
                $this->error("[GAGAL] {$berita->slug}");
            }
        }

        $this->table(
            ['Status', 'Jumlah'],
            [
                ['Terkirim', $success],
                ['Gagal', $failed],
                ['Total', $beritas->count()],
            ]
        );

        return $failed > 0 ? self::FAILURE : self::SUCCESS;
    }
}
