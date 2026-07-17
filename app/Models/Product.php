<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id', 'name', 'slug', 'description', 
        'price_per_day', 'security_deposit', 'image_url', 'images', 'specifications'
    ];

    protected $casts = [
        'specifications' => 'array',
        'images' => 'array',
    ];

    protected $appends = [
        'available_stock',
        'discount_percent',
        'discounted_price_per_day',
    ];

    public function getAvailableStockAttribute()
    {
        if ($this->relationLoaded('inventories')) {
            return $this->inventories->where('status', 'available')->count();
        }
        return $this->inventories()->where('status', 'available')->count();
    }

    public function getDiscountPercentAttribute()
    {
        return $this->available_stock > 20 ? 5 : 0;
    }

    public function getDiscountedPricePerDayAttribute()
    {
        $discount = $this->discount_percent;
        if ($discount > 0) {
            return round($this->price_per_day * (1 - $discount / 100), 2);
        }
        return (float)$this->price_per_day;
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function inventories()
    {
        return $this->hasMany(Inventory::class);
    }
}
