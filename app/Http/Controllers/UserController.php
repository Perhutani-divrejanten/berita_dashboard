<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('viewAny', User::class);

        $search = trim((string) $request->input('search', ''));
        $role = $request->input('role', 'all');
        $status = $request->input('status', 'all');

        $users = User::query()
            ->withCount('beritas')
            ->whereIn('role', ['admin', 'editor'])
            ->when($search, fn ($query) => $query->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            }))
            ->when(in_array($role, ['admin', 'editor'], true), fn ($query) => $query->where('role', $role))
            ->when($status === 'active', fn ($query) => $query->where('is_active', true))
            ->when($status === 'inactive', fn ($query) => $query->where('is_active', false))
            ->latest('id')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'role' => $role,
                'status' => $status,
            ],
        ]);
    }

    public function create()
    {
        Gate::authorize('create', User::class);

        return Inertia::render('Users/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('create', User::class);

        $validated = $request->validate($this->rules());
        $validated['password'] = Hash::make($validated['password']);
        $validated['is_active'] = $request->boolean('is_active', true);

        User::create($validated);

        return redirect()->route('users.index')->with('success', 'Pengguna berhasil ditambahkan.');
    }

    public function edit(User $user)
    {
        Gate::authorize('update', $user);

        return Inertia::render('Users/Edit', [
            'user' => $user->only(['id', 'username', 'name', 'email', 'role', 'is_active']),
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        Gate::authorize('update', $user);

        $validated = $request->validate($this->rules($user));
        $validated['is_active'] = $request->boolean('is_active', false);

        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        if ($user->is($request->user()) && ! $validated['is_active']) {
            return back()->withErrors(['is_active' => 'Akun Anda sendiri tidak dapat dinonaktifkan.']);
        }

        if ($user->role === 'admin' && $validated['role'] !== 'admin' && User::where('role', 'admin')->count() <= 1) {
            return back()->withErrors(['role' => 'Admin terakhir tidak dapat mengubah role menjadi editor.']);
        }

        $user->update($validated);

        return redirect()->route('users.index')->with('success', 'Pengguna berhasil diperbarui.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        Gate::authorize('delete', $user);

        if ($user->is($request->user())) {
            return back()->with('error', 'Anda tidak dapat menghapus akun sendiri.');
        }

        if ($user->role === 'admin' && User::where('role', 'admin')->count() <= 1) {
            return back()->with('error', 'Admin terakhir tidak dapat dihapus.');
        }

        DB::transaction(fn () => $user->delete());

        return redirect()->route('users.index')->with('success', 'Pengguna berhasil dihapus.');
    }

    private function rules(?User $user = null): array
    {
        return [
            'username' => ['required', 'string', 'max:50', Rule::unique('users', 'username')->ignore($user?->id)],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user?->id)],
            'role' => ['required', Rule::in(['admin', 'editor'])],
            'is_active' => ['boolean'],
            'password' => [$user ? 'nullable' : 'required', 'confirmed', Password::defaults()],
        ];
    }
}
