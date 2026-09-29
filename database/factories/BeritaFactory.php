<?php

namespace Database\Factories;

use App\Models\Berita;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BeritaFactory extends Factory
{
    protected $model = Berita::class;

    public function definition(): array
    {
        $title = fake()->sentence(6);
        $isPublished = fake()->boolean(66);

        return [
            'user_id'      => User::factory(),
            'title'        => $title,
            'date'         => fake()->date(),
            'category'     => fake()->randomElement(['Hutan', 'Konservasi', 'CSR', 'Produksi', 'Wisata']),
            'excerpt'      => fake()->text(180),
            'content'      => fake()->paragraphs(6, true),
            'author'       => fake()->name(),
            'is_published' => $isPublished,
            'views'        => fake()->numberBetween(0, 5000),
        ];
    }
}
