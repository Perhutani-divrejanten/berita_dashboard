<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_page_is_displayed(): void
    {
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get('/profile');

        $response->assertOk();
    }

    public function test_profile_information_can_be_updated(): void
    {
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $user->refresh();

        $this->assertSame('Test User', $user->name);
        $this->assertSame('test@example.com', $user->email);
        $this->assertNull($user->email_verified_at);
    }

    public function test_email_verification_status_is_unchanged_when_the_email_address_is_unchanged(): void
    {
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => $user->email,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $this->assertNotNull($user->refresh()->email_verified_at);
    }

    public function test_profile_photo_can_be_uploaded(): void
    {
        Storage::fake('public');
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/profile', [
            '_method' => 'PATCH',
            'name' => $user->name,
            'email' => $user->email,
            'profile_photo' => UploadedFile::fake()->image('avatar.jpg', 200, 200),
        ]);

        $response->assertSessionHasNoErrors()->assertRedirect('/profile');

        $path = $user->refresh()->profile_photo_path;
        $this->assertNotNull($path);
        $this->assertTrue(Storage::disk('public')->exists($path));
        $this->assertStringEndsWith('/storage/'.$path, $user->profile_photo_url);
    }

    public function test_user_can_delete_their_account(): void
    {
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->delete('/profile', [
                'password' => 'password',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/');

        $this->assertGuest();
        $this->assertNull($user->fresh());
    }

    public function test_last_admin_cannot_delete_their_own_account(): void
    {
        /** @var User $admin */
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)
            ->from('/profile')
            ->delete('/profile', ['password' => 'password']);

        $response->assertRedirect('/profile')->assertSessionHasErrors('account');
        $this->assertAuthenticatedAs($admin);
        $this->assertNotNull($admin->fresh());
    }

    public function test_correct_password_must_be_provided_to_delete_account(): void
    {
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->from('/profile')
            ->delete('/profile', [
                'password' => 'wrong-password',
            ]);

        $response
            ->assertSessionHasErrors('password')
            ->assertRedirect('/profile');

        $this->assertNotNull($user->fresh());
    }
}
