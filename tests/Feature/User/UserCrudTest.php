<?php

namespace Tests\Feature\User;

use App\Models\Berita;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_access_user_management(): void
    {
        /** @var User $user */
        $user = User::factory()->create(['role' => 'editor']);

        $this->actingAs($user)->get(route('users.index'))->assertForbidden();
    }

    public function test_admin_can_create_user_with_hashed_password(): void
    {
        /** @var User $admin */
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post(route('users.store'), [
            'username' => 'editor-baru',
            'name' => 'Editor Baru',
            'email' => 'editor-baru@example.test',
            'role' => 'editor',
            'is_active' => true,
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response->assertRedirect(route('users.index'));
        $user = User::where('username', 'editor-baru')->firstOrFail();
        $this->assertTrue(Hash::check('Password123!', $user->password));
        $this->assertSame('editor', $user->role);
    }

    public function test_deleting_user_preserves_news_and_clears_owner_relation(): void
    {
        /** @var User $admin */
        $admin = User::factory()->create(['role' => 'admin']);
        /** @var User $author */
        $author = User::factory()->create(['role' => 'editor']);
        $berita = Berita::factory()->create(['user_id' => $author->id]);

        $response = $this->actingAs($admin)->delete(route('users.destroy', $author));

        $response->assertRedirect(route('users.index'));
        $this->assertNull($author->fresh());
        $this->assertDatabaseHas('beritas', ['id' => $berita->id, 'user_id' => null]);
    }

    public function test_admin_cannot_delete_themselves(): void
    {
        /** @var User $admin */
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->delete(route('users.destroy', $admin));

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertNotNull($admin->fresh());
    }

    public function test_last_admin_cannot_demote_themselves(): void
    {
        /** @var User $admin */
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)
            ->from(route('users.edit', $admin))
            ->put(route('users.update', $admin), [
                'username' => $admin->username,
                'name' => $admin->name,
                'email' => $admin->email,
                'role' => 'editor',
                'is_active' => true,
            ]);

        $response->assertRedirect(route('users.edit', $admin))->assertSessionHasErrors('role');
        $this->assertSame('admin', $admin->fresh()->role);
    }
}
