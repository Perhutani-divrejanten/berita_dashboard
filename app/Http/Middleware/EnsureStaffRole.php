<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureStaffRole
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user?->is_active) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login');
        }

        if (! in_array($user->role, ['admin', 'editor'], true)) {
            abort(403, 'Akses hanya tersedia untuk admin dan editor.');
        }

        return $next($request);
    }
}
