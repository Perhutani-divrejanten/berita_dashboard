<?php

namespace Tests\Feature;

use App\Console\Commands\PublishScheduledBerita;
use App\Models\Berita;
use App\Models\User;
use App\Services\GoogleSheetsApiService;
use App\Services\GoogleSheetsCsvService;
use Illuminate\Console\OutputStyle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\BufferedOutput;
use Tests\TestCase;

class ScheduledBeritaTest extends TestCase
{
    use RefreshDatabase;

    public function test_sheets_list_is_cached_and_mutations_invalidate_it(): void
    {
        Http::preventStrayRequests();
        Cache::forget('google-sheets:articles:list');
        config([
            'services.google_sheets.exec_url' => 'https://script.google.com/macros/s/test/exec',
            'services.google_sheets.token' => 'secret-token',
        ]);
        Http::fake([
            'https://script.google.com/macros/s/test/exec' => Http::sequence()
                ->push(['success' => true, 'data' => [['slug' => 'old']]])
                ->push(['success' => true])
                ->push(['success' => true, 'data' => [['slug' => 'new']]]),
        ]);
        $sheets = app(GoogleSheetsApiService::class);

        $this->assertSame('old', $sheets->list()['data'][0]['slug']);
        $this->assertSame('old', $sheets->list()['data'][0]['slug']);
        $sheets->create(['title' => 'Berita baru']);
        $this->assertSame('new', $sheets->list()['data'][0]['slug']);

        Http::assertSentCount(3);
        Http::assertSent(fn ($request) => $request->method() === 'POST'
            && $request['token'] === 'secret-token'
            && ! str_contains($request->url(), 'secret-token'));
    }

    public function test_sheets_api_fails_without_credentials_without_sending_a_request(): void
    {
        Http::preventStrayRequests();
        config([
            'services.google_sheets.exec_url' => null,
            'services.google_sheets.token' => null,
        ]);

        $result = app(GoogleSheetsApiService::class)->list();

        $this->assertFalse($result['success']);
        Http::assertNothingSent();
    }

    public function test_dashboard_handles_missing_success_key_in_google_sheets_response(): void
    {
        $this->actingAs(User::factory()->create([
            'role' => 'editor',
            'is_active' => true,
        ]));

        $this->app->instance(GoogleSheetsApiService::class, new class extends GoogleSheetsApiService
        {
            public function list(): array
            {
                return ['data' => [[
                    'slug' => 'contoh-berita',
                    'title' => 'Contoh',
                    'date' => '2026-09-28',
                    'true' => 'TRUE',
                ]]];
            }
        });

        $response = $this->get(route('dashboard'));

        $response->assertOk();
        $response->assertSessionDoesntHaveErrors();
    }

    public function test_sheets_list_keeps_last_successful_result_on_transient_failure(): void
    {
        Http::preventStrayRequests();
        Cache::forget('google-sheets:articles:list');
        config([
            'services.google_sheets.exec_url' => 'https://script.google.com/macros/s/test/exec',
            'services.google_sheets.token' => 'secret-token',
        ]);
        Cache::put('google-sheets:articles:list', [
            'success' => true,
            'data' => [['slug' => 'berita-pertama', 'title' => 'Pertama']],
        ], now()->addMinutes(5));
        Http::fake([
            'https://script.google.com/macros/s/test/exec' => Http::response([
                'success' => false,
                'message' => 'Koneksi Google Sheets gagal.',
            ], 500),
        ]);

        $result = app(GoogleSheetsApiService::class)->list();

        $this->assertTrue($result['success']);
        $this->assertSame('berita-pertama', $result['data'][0]['slug']);
        Http::assertSentCount(0);
    }

    public function test_local_news_sync_uses_the_apps_script_upsert_contract(): void
    {
        Http::preventStrayRequests();
        config([
            'services.google_sheets.write_url' => 'https://script.google.com/macros/s/test/exec',
            'services.google_sheets.write_token' => 'secret-token',
            'filesystems.disks.public.url' => 'https://news.example.test/storage',
        ]);
        Http::fake([
            'https://script.google.com/macros/s/test/exec' => Http::response(['success' => true]),
        ]);
        $berita = new Berita([
            'slug' => 'berita-uji',
            'title' => 'Berita Uji',
            'date' => '2026-09-28',
            'category' => 'Konservasi',
            'image' => 'berita/gambar.webp',
            'is_published' => true,
        ]);

        $this->assertTrue(app(GoogleSheetsCsvService::class)->upsertBerita($berita));

        Http::assertSent(fn ($request) => $request['action'] === 'upsert'
            && $request['slug'] === 'berita-uji'
            && $request['true'] === true
            && $request['image'] === 'https://news.example.test/storage/berita/gambar.webp'
            && ! isset($request['data']));
    }

    public function test_local_news_delete_is_sent_to_google_sheets(): void
    {
        Http::preventStrayRequests();
        config([
            'services.google_sheets.write_url' => 'https://script.google.com/macros/s/test/exec',
            'services.google_sheets.write_token' => 'secret-token',
        ]);
        Http::fake([
            'https://script.google.com/macros/s/test/exec' => Http::response(['success' => true]),
        ]);

        $synced = app(GoogleSheetsCsvService::class)->deleteBerita(new Berita(['slug' => 'berita-hapus']));

        $this->assertTrue($synced);
        Http::assertSent(fn ($request) => $request['action'] === 'delete'
            && $request['slug'] === 'berita-hapus'
            && $request['token'] === 'secret-token');
    }

    public function test_scheduled_sheets_berita_is_published_after_publish_time(): void
    {
        Http::preventStrayRequests();
        config([
            'services.google_sheets.exec_url' => 'https://script.google.com/macros/s/test/exec',
            'services.google_sheets.token' => 'secret-token',
        ]);
        Http::fake([
            'https://script.google.com/macros/s/test/exec*' => Http::sequence()
                ->push(['success' => true, 'data' => [[
                    'slug' => 'berita-terjadwal',
                    'true' => 'FALSE',
                    'publish_at' => now()->subMinute()->format('Y-m-d\\TH:i'),
                ]]])
                ->push(['success' => true]),
        ]);

        $command = app(PublishScheduledBerita::class);
        $command->setOutput(new OutputStyle(new ArrayInput([]), new BufferedOutput));
        $result = $command->handle(app(GoogleSheetsApiService::class));

        $this->assertSame(PublishScheduledBerita::SUCCESS, $result);
        Http::assertSent(fn ($request) => $request->method() === 'POST'
            && $request['action'] === 'update'
            && $request['slug'] === 'berita-terjadwal'
            && $request['true'] === true);
    }

    public function test_scheduled_sheets_berita_stays_draft_before_publish_time(): void
    {
        Http::preventStrayRequests();
        config([
            'services.google_sheets.exec_url' => 'https://script.google.com/macros/s/test/exec',
            'services.google_sheets.token' => 'secret-token',
        ]);
        Http::fake([
            'https://script.google.com/macros/s/test/exec*' => Http::response([
                'success' => true,
                'data' => [[
                    'slug' => 'berita-belum-terbit',
                    'true' => 'FALSE',
                    'publish_at' => now()->addMinute()->format('Y-m-d\\TH:i'),
                ]],
            ]),
        ]);

        $command = app(PublishScheduledBerita::class);
        $command->setOutput(new OutputStyle(new ArrayInput([]), new BufferedOutput));
        $result = $command->handle(app(GoogleSheetsApiService::class));

        $this->assertSame(PublishScheduledBerita::SUCCESS, $result);
        Http::assertSentCount(1);
    }
}
