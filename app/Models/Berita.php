<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;         // ← tambahkan ini
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Berita extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'slug', 'title', 'date', 'publish_at', 'category', 'badge', 'image',
        'excerpt', 'content', 'author', 'is_published', 'views', 'user_id',
    ];

    protected $casts = [
        'date' => 'date',
        'publish_at' => 'datetime',
        'is_published' => 'boolean',
        'views' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }

    public function scopeSearch(Builder $query, ?string $keyword): Builder
    {
        if (! $keyword) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($keyword) {
            $q->where('title', 'like', "%{$keyword}%")
                ->orWhere('excerpt', 'like', "%{$keyword}%")
                ->orWhere('author', 'like', "%{$keyword}%");
        });
    }

    public function scopeByCategory(Builder $query, ?string $category): Builder
    {
        if (! $category || $category === 'all') {
            return $query;
        }

        return $query->where('category', $category);
    }

    protected static function booted(): void
    {
        static::creating(function (Berita $berita) {
            if (empty($berita->slug)) {
                $berita->slug = static::generateUniqueSlug($berita->title);
            }
        });
    }

    protected static function generateUniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $i = 1;

        while (static::withTrashed()
            ->where('slug', $slug)
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->exists()
        ) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }
}
