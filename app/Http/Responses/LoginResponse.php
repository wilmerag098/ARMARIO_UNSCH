<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Illuminate\Support\Facades\Auth;

class LoginResponse implements LoginResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function toResponse($request)
    {
        $user = Auth::user();

        if ($request->wantsJson() && !$request->hasHeader('X-Inertia')) {
            return response()->json(['two_factor' => false]);
        }

        if ($user && $user->rol === 'admin') {
            return redirect('/admin/dashboard');
        }

        if ($user && $user->rol === 'cliente') {
            return redirect('/');
        }

        return redirect()->intended('/');
    }
}
