<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Validation\Rules\Password;

#[Signature('users:create-admin')]
#[Description('Create an administrator account using hidden password prompts')]
class CreateAdminUser extends Command
{
    public function handle(): int
    {
        $attributes = [
            'username' => trim((string) $this->ask('Username')),
            'name' => trim((string) $this->ask('Name')),
            'email' => trim((string) $this->ask('Email')),
            'password' => $this->secret('Password'),
            'password_confirmation' => $this->secret('Confirm password'),
        ];

        $validator = validator($attributes, [
            'username' => ['required', 'string', 'max:50', 'alpha_dash', 'unique:users,username'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'lowercase', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        if ($validator->fails()) {
            $this->components->error('Admin tidak dibuat; data tidak valid.');
            $this->components->bulletList($validator->errors()->all());

            return self::FAILURE;
        }

        User::create([
            ...$validator->validated(),
            'role' => 'admin',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $this->components->info('Akun admin berhasil dibuat.');

        return self::SUCCESS;
    }
}
