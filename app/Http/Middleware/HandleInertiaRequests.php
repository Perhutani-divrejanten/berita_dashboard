<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? [
                    'id'         => $request->user()->id,
                    'username'   => $request->user()->username,
                    'name'       => $request->user()->name,
                    'jabatan'    => $request->user()->jabatan,
                    'email'      => $request->user()->email,
                    'role'       => $request->user()->role,
                    'is_active'  => $request->user()->is_active,
                    'profile_photo_url' => $request->user()->profile_photo_url,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
            ],
        ]);
    }
}
