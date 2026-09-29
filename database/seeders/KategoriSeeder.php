<?php

namespace Database\Seeders;

use App\Models\Kategori;
use Illuminate\Database\Seeder;

class KategoriSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['nama' => 'Konservasi', 'deskripsi' => 'Pelestarian hutan & lingkungan',      'warna' => 'green',  'urutan' => 1],
            ['nama' => 'CSR',        'deskripsi' => 'Tanggung jawab sosial perusahaan',     'warna' => 'blue',   'urutan' => 2],
            ['nama' => 'Pelatihan',  'deskripsi' => 'Pelatihan & pengembangan SDM',         'warna' => 'amber',  'urutan' => 3],
            ['nama' => 'Produksi',   'deskripsi' => 'Hasil hutan & produksi',               'warna' => 'indigo', 'urutan' => 4],
            ['nama' => 'Wisata',     'deskripsi' => 'Wisata alam & edukasi',                'warna' => 'purple', 'urutan' => 5],
            ['nama' => 'Riset',      'deskripsi' => 'Penelitian & inovasi kehutanan',       'warna' => 'gray',   'urutan' => 6],
            ['nama' => 'Teknologi',  'deskripsi' => 'Teknologi informasi kehutanan',        'warna' => 'indigo', 'urutan' => 7],
        ];

        foreach ($data as $item) {
            Kategori::updateOrCreate(['nama' => $item['nama']], $item);
        }

        $this->command->info('Seeder selesai: ' . count($data) . ' kategori.');
    }
}
