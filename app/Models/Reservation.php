<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'order_number', 'start_date', 'end_date', 'total_amount', 'status', 
        'promotion_id', 'discount_amount', 'payment_status', 'payment_method', 
        'guarantee_status', 'guarantee_amount', 'payment_reference'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(ReservationItem::class);
    }

    public function promotion()
    {
        return $this->belongsTo(Promotion::class);
    }
}
