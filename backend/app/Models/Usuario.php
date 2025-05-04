<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';

    protected $fillable = [
        'nombre',
        'apellidos',
        'email',
        'password',
        'google_id',
        'avatar',
        'rol',
        'telefono',
        'documento_identidad',
        'primera_visita',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];
}
