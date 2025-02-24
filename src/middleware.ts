// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Récupérer le token de session depuis les cookies
  const session = request.cookies.get('session')?.value;

  // Route pour le super admin dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard/super-admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Vérification du rôle (nous ajouterons cette partie après)
  }

  // Routes pour le dashboard admin normal
  if (request.nextUrl.pathname.startsWith('/dashboard') && !request.nextUrl.pathname.startsWith('/dashboard/super-admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Vérification du rôle (nous ajouterons cette partie après)
  }

  // Pour la page login, ne pas rediriger ici
  // Le composant LoginForm gèrera la redirection côté client
  // en fonction du rôle de l'utilisateur

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/dashboard/super-admin/:path*',
    '/login'
  ]
};