<?php

namespace Database\Seeders;

use App\Models\Berita;
use App\Models\User;
use Illuminate\Database\Seeder;

class BeritaSeeder extends Seeder
{
    public function run(): void
    {
        $authorId = User::query()
            ->whereIn('role', ['admin', 'editor'])
            ->value('id');

        $data = [
            [
                'slug' => 'penanaman-10000-bibit-hutan-lindung',
                'title' => 'Penanaman 10.000 Bibit Pohon di Kawasan Hutan Lindung',
                'date' => '2026-09-15',
                'category' => 'Konservasi',
                'badge' => 'Baru',
                'image' => null,
                'excerpt' => 'Perhutani Janten menanam 10.000 bibit pohon di kawasan hutan lindung untuk pelestarian lingkungan.',
                'content' => 'Perhutani Divisi Regional Janten melaksanakan program penanaman 10.000 bibit pohon di kawasan hutan lindung. Kegiatan ini melibatkan masyarakat desa hutan dan berbagai pemangku kepentingan. Tujuan utama adalah memulihkan ekosistem hutan yang terdampak alih fungsi lahan.',
                'author' => 'Mega Admin',
                'is_published' => true,
                'views' => 245,
                'user_id' => $authorId,
            ],
            [
                'slug' => 'program-csr-desa-sekitar-hutan',
                'title' => 'Program CSR Perhutani untuk Desa Sekitar Hutan',
                'date' => '2026-09-14',
                'category' => 'CSR',
                'badge' => 'Penting',
                'image' => null,
                'excerpt' => 'Program CSR menyasar pemberdayaan ekonomi masyarakat desa sekitar hutan.',
                'content' => 'Perhutani Janten meluncurkan program CSR yang berfokus pada pemberdayaan ekonomi masyarakat desa hutan. Program ini mencakup pelatihan keterampilan, bantuan modal usaha, dan pendampingan berkelanjutan.',
                'author' => 'Mega Admin',
                'is_published' => true,
                'views' => 189,
                'user_id' => $authorId,
            ],
            [
                'slug' => 'pelatihan-petani-hutan-agroforestri',
                'title' => 'Pelatihan Petani Hutan tentang Agroforestri Modern',
                'date' => '2026-09-13',
                'category' => 'Pelatihan',
                'badge' => null,
                'image' => null,
                'excerpt' => 'Pelatihan agroforestri modern untuk tingkatkan produktivitas lahan hutan.',
                'content' => 'Sebanyak 50 petani hutan mengikuti pelatihan agroforestri modern yang diselenggarakan Perhutani Janten. Pelatihan ini mengajarkan teknik bercocok tanam yang ramah lingkungan dan produktif.',
                'author' => 'Budi Santoso',
                'is_published' => false,
                'views' => 0,
                'user_id' => $authorId,
            ],
        ];

        foreach ($data as $item) {
            Berita::updateOrCreate(['slug' => $item['slug']], $item);
        }

        $this->command->info('Seeder selesai: '.count($data).' berita.');
    }
}
