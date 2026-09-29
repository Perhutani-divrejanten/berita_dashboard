<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class DriveImageTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_can_load_public_drive_image_through_the_app(): void
    {
        Http::preventStrayRequests();
        Http::fake([
            'drive.google.com/*' => Http::response('image-bytes', 200, ['Content-Type' => 'image/png']),
        ]);
        /** @var User $staff */
        $staff = User::factory()->create(['role' => 'editor']);

        $response = $this->actingAs($staff)->get(route('sheets-berita.drive-image', 'drive-image-12345678901234567890'));

        $response->assertOk()
            ->assertHeader('Content-Type', 'image/png')
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertSee('image-bytes', false);
    }

    public function test_guest_cannot_proxy_drive_images(): void
    {
        Http::preventStrayRequests();

        $this->get(route('sheets-berita.drive-image', 'drive-image-12345678901234567890'))
            ->assertRedirect(route('login'));

        Http::assertNothingSent();
    }

    public function test_invalid_drive_image_id_is_rejected(): void
    {
        Http::preventStrayRequests();
        /** @var User $staff */
        $staff = User::factory()->create(['role' => 'editor']);

        $this->actingAs($staff)->get('/sheets-berita/drive-image/../../etc/passwd')->assertNotFound();

        Http::assertNothingSent();
    }

    public function test_non_image_drive_response_is_rejected(): void
    {
        Http::preventStrayRequests();
        Http::fake([
            'drive.google.com/*' => Http::response('<html>not an image</html>', 200, ['Content-Type' => 'text/html']),
        ]);
        /** @var User $staff */
        $staff = User::factory()->create(['role' => 'editor']);

        $this->actingAs($staff)->get(route('sheets-berita.drive-image', 'drive-image-12345678901234567890'))
            ->assertNotFound();
    }
}
