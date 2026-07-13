<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;
use Illuminate\Http\JsonResponse;

class RegisterResponse implements RegisterResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function toResponse($request)
    {
        if ($request->wantsJson() && !$request->hasHeader('X-Inertia')) {
            return new JsonResponse('', 201);
        }

        $user = auth()->user();
        if ($user && $user->rol === 'admin') {
            return redirect('/admin/dashboard');
        }

        return redirect('/');
    }
}
