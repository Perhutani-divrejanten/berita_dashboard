<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'username' => ['required', 'string', 'max:50'],
            'password' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'username.required' => 'Username wajib diisi.',
            'password.required' => 'Password wajib diisi.',
        ];
    }

    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $credentials = [
            'username' => $this->input('username'),
            'password' => $this->input('password'),
            'is_active' => 1,
        ];

        $authenticated = Auth::attempt(
            [...$credentials, 'role' => 'admin'],
            $this->boolean('remember')
        ) || Auth::attempt(
            [...$credentials, 'role' => 'editor'],
            $this->boolean('remember')
        );

        if (! $authenticated) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'username' => 'Username atau password salah, atau akun tidak aktif.',
            ]);
        }

        // Update last_login
        $user = Auth::user();
        if ($user instanceof User) {
            $user->update(['last_login' => now()]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'username' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    public function throttleKey(): string
    {
        return Str::transliterate(
            Str::lower($this->string('username')).'|'.$this->ip()
        );
    }
}
