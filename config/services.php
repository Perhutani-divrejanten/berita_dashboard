<?php

return [

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // ============ GOOGLE SHEETS ============
    'google_sheets' => [
        'csv_url' => env('GOOGLE_SHEETS_CSV_URL'),
        'write_url' => env('GOOGLE_SHEETS_WRITE_URL'),
        'write_token' => env('GOOGLE_SHEETS_WRITE_TOKEN'),
        'ca_bundle' => env('GOOGLE_SHEETS_CA_BUNDLE'),
        'exec_url' => env('GOOGLE_SHEETS_EXEC_URL'),
        'token' => env('GOOGLE_SHEETS_TOKEN'),
        'cache_ttl' => (int) env('GOOGLE_SHEETS_CACHE_TTL', 15),
    ],

];
