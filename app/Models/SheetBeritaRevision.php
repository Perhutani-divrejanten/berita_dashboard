<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class SheetBeritaRevision extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'slug',
        'action',
        'user_id',
        'snapshot',
        'changes',
        'created_at',
    ];

    protected $casts = [
        'snapshot' => 'array',
        'changes' => 'array',
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
