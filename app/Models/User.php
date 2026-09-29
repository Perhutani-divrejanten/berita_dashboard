<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // kalau pakai Sanctum

class User extends Authenticatable implements MustVerifyEmail
{
    use CanResetPassword, HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'username',
        'name',
        'jabatan',
        'email',
        'profile_photo_path',
        'password',
        'role',
        'is_active',
        'last_login',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login'        => 'datetime',
        'password'          => 'hashed',
        'is_active'         => 'boolean',
    ];

    protected $appends = ['profile_photo_url'];

    public function getProfilePhotoUrlAttribute(): ?string
    {
        return $this->profile_photo_path
            ? asset('storage/' . $this->profile_photo_path)
            : null;
    }

    public function beritas()
    {
        return $this->hasMany(Berita::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}
