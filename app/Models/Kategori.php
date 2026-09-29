<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Kategori extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'nama',
        'slug',
        'deskripsi',
        'warna',
        'is_active',
        'urutan',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'urutan'    => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Auto-generate slug dari nama
    protected static function booted(): void
    {
        static::creating(function (Kategori $kategori) {
            if (empty($kategori->slug)) {
                $kategori->slug = static::generateUniqueSlug($kategori->nama);
            }
        });

        static::updating(function (Kategori $kategori) {
            if ($kategori->isDirty('nama')) {
                $kategori->slug = static::generateUniqueSlug($kategori->nama, $kategori->id);
            }
        });
    }

    protected static function generateUniqueSlug(string $nama, ?int $ignoreId = null): string
    {
        $base = Str::slug($nama);
        $slug = $base;
        $i = 1;

        while (static::withTrashed()
            ->where('slug', $slug)
            ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
            ->exists()
        ) {
            $slug = $base . '-' . $i++;
        }

        return $slug;
    }

    // Scope: hanya aktif
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Scope: pencarian
    public function scopeSearch($query, ?string $keyword)
    {
        if (!$keyword) return $query;
        return $query->where(function ($query) use ($keyword) {
            $query->where('nama', 'like', "%{$keyword}%")
                ->orWhere('deskripsi', 'like', "%{$keyword}%");
        });
    }

    // Hitung jumlah berita (opsional, kalau nanti pakai relasi)
    public function beritas()
    {
        return $this->hasMany(Berita::class, 'category', 'nama');
    }
}
