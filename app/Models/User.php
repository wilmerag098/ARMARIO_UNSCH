<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'name', 'email', 'password', 'university_id', 'address', 'phone', 'role', 'nombre', 'rol',
    'last_name', 'dni', 'position', 'profile_photo_path', 'language', 'panel_theme', 'timezone', 'date_format',
    'notify_reservations', 'notify_returns', 'notify_system', 'status', 'type'
])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    protected $appends = [
        'avatar',
        'nombre',
        'rol'
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function getRolAttribute(): string
    {
        return (string) ($this->role === 'user' ? 'cliente' : $this->role);
    }

    public function setRolAttribute($value): void
    {
        $this->attributes['role'] = $value === 'cliente' ? 'user' : $value;
    }

    public function getNombreAttribute(): string
    {
        return (string) $this->name;
    }

    public function setNombreAttribute($value): void
    {
        $this->attributes['name'] = $value;
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function favorites()
    {
        return $this->belongsToMany(Product::class, 'favoritos');
    }

    public function getAvatarAttribute()
    {
        return $this->profile_photo_path ? asset($this->profile_photo_path) : null;
    }
}
