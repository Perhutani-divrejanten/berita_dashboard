<?php

namespace Tests\Feature\Kategori;

use App\Models\Berita;
use App\Models\Kategori;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KategoriCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_rename_category_and_existing_news_follow_the_new_name(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $kategori = Kategori::create([
            'nama' => 'Lingkungan',
            'deskripsi' => 'Berita lingkungan',
            'warna' => 'green',
            'is_active' => true,
            'urutan' => 1,
        ]);
        $berita = Berita::factory()->create([
            'user_id' => $user->id,
            'category' => 'Lingkungan',
        ]);

        $response = $this->actingAs($user)->put(route('kategori.update', $kategori), [
            'nama' => 'Konservasi Lingkungan',
            'deskripsi' => 'Berita lingkungan',
            'warna' => 'green',
            'is_active' => true,
            'urutan' => 1,
        ]);

        $response->assertRedirect(route('kategori.index'));
        $this->assertDatabaseHas('kategoris', [
            'id' => $kategori->id,
            'nama' => 'Konservasi Lingkungan',
            'slug' => 'konservasi-lingkungan',
        ]);
        $this->assertDatabaseHas('beritas', [
            'id' => $berita->id,
            'category' => 'Konservasi Lingkungan',
        ]);
    }

    public function test_category_cannot_be_deleted_while_it_is_used_by_news(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $kategori = Kategori::create([
            'nama' => 'Produksi',
            'warna' => 'indigo',
            'is_active' => true,
            'urutan' => 1,
        ]);
        Berita::factory()->create([
            'user_id' => $user->id,
            'category' => $kategori->nama,
        ]);

        $response = $this->actingAs($user)->delete(route('kategori.destroy', $kategori));

        $response->assertRedirect(route('kategori.index'));
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('kategoris', ['id' => $kategori->id, 'deleted_at' => null]);
    }
}
