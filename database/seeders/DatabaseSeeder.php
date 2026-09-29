<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            BeritaSeeder::class,
            KategoriSeeder::class,
        ]);

        $this->command->info('Seeder selesai: berita dan kategori.');
    }
}
