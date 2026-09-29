<?php

namespace App\Http\Controllers;

use App\Models\Kategori;
use App\Services\GoogleSheetsApiService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class KategoriController extends Controller
{
    /**
     * Daftar kategori
     */
    public function index(Request $request, GoogleSheetsApiService $sheets)
    {
        $search = $request->input('search');
        $status = $request->input('status'); // all | active | inactive

        $query = Kategori::query()->search($search);

        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        $kategoris = $query
            ->orderBy('urutan')
            ->orderBy('nama')
            ->paginate(12)
            ->withQueryString();

        $sheetResult = $sheets->list();
        $sheetIsSuccess = (bool) ($sheetResult['success'] ?? false);
        $sheetRows = $sheetIsSuccess && is_array($sheetResult['data'] ?? null)
            ? $sheetResult['data']
            : [];
        $sheetCategoryCounts = [];

        foreach ($sheetRows as $row) {
            foreach (explode(',', (string) ($row['category'] ?? '')) as $category) {
                $category = mb_strtolower(trim($category));
                if ($category !== '') {
                    $sheetCategoryCounts[$category] = ($sheetCategoryCounts[$category] ?? 0) + 1;
                }
            }
        }

        // Hitung jumlah berita dari Google Sheets, bukan database lokal.
        $kategoris->getCollection()->transform(function ($kategori) {
            $kategori->jumlah_berita = 0;
            return $kategori;
        });

        $kategoris->getCollection()->transform(function ($kategori) use ($sheetCategoryCounts) {
            $kategori->jumlah_berita = $sheetCategoryCounts[mb_strtolower($kategori->nama)] ?? 0;
            return $kategori;
        });

        return Inertia::render('Kategori/Index', [
            'kategoris' => $kategoris,
            'sheetsConnected' => $sheetIsSuccess,
            'filters'   => [
                'search' => $search ?? '',
                'status' => $status ?? 'all',
            ],
        ]);
    }

    /**
     * Form tambah
     */
    public function create()
    {
        return Inertia::render('Kategori/Create');
    }

    /**
     * Simpan
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama'      => 'required|string|min:3|max:50|unique:kategoris,nama',
            'deskripsi' => 'nullable|string|max:255',
            'warna'     => 'required|string|in:indigo,green,blue,amber,red,purple,gray',
            'is_active' => 'boolean',
            'urutan'    => 'integer|min:0',
        ], [
            'nama.required' => 'Nama kategori wajib diisi.',
            'nama.min'      => 'Nama kategori minimal 3 karakter.',
            'nama.max'      => 'Nama kategori maksimal 50 karakter.',
            'nama.unique'   => 'Nama kategori sudah digunakan.',
            'warna.in'      => 'Warna tidak valid.',
        ]);

        $validated['is_active'] = $request->boolean('is_active', true);
        $validated['urutan'] = $validated['urutan'] ?? 0;

        Kategori::create($validated);

        return redirect()
            ->route('kategori.index')
            ->with('success', 'Kategori berhasil ditambahkan.');
    }

    /**
     * Edit form
     */
    public function edit(Kategori $kategori)
    {
        return Inertia::render('Kategori/Edit', [
            'kategori' => $kategori,
        ]);
    }

    /**
     * Update
     */
    public function update(Request $request, Kategori $kategori)
    {
        $validated = $request->validate([
            'nama'      => [
                'required', 'string', 'min:3', 'max:50',
                Rule::unique('kategoris', 'nama')->ignore($kategori->id),
            ],
            'deskripsi' => 'nullable|string|max:255',
            'warna'     => 'required|string|in:indigo,green,blue,amber,red,purple,gray',
            'is_active' => 'boolean',
            'urutan'    => 'integer|min:0',
        ], [
            'nama.required' => 'Nama kategori wajib diisi.',
            'nama.unique'   => 'Nama kategori sudah digunakan.',
            'warna.in'      => 'Warna tidak valid.',
        ]);

        $validated['is_active'] = $request->boolean('is_active', true);
        $validated['urutan'] = $validated['urutan'] ?? 0;

        $oldName = $kategori->nama;

        DB::transaction(function () use ($kategori, $validated, $oldName): void {
            $kategori->update($validated);

            if ($oldName !== $kategori->nama) {
                \App\Models\Berita::where('category', $oldName)
                    ->update(['category' => $kategori->nama]);
            }
        });

        return redirect()
            ->route('kategori.index')
            ->with('success', 'Kategori berhasil diperbarui.');
    }

    /**
     * Hapus (soft delete)
     */
    public function destroy(Kategori $kategori)
    {
        // Cek apakah masih ada berita yang pakai kategori ini
        $jumlah = \App\Models\Berita::where('category', $kategori->nama)->count();

        if ($jumlah > 0) {
            return redirect()
                ->route('kategori.index')
                ->with('error', "Kategori \"{$kategori->nama}\" masih dipakai oleh {$jumlah} berita. Pindahkan berita dulu.");
        }

        $kategori->delete();

        return redirect()
            ->route('kategori.index')
            ->with('success', 'Kategori berhasil dihapus.');
    }

    /**
     * Restore
     */
    public function restore(int $id)
    {
        $kategori = Kategori::withTrashed()->findOrFail($id);
        $kategori->restore();

        return redirect()
            ->route('kategori.index')
            ->with('success', 'Kategori berhasil dipulihkan.');
    }
}
