// src/app/api/auth/session/route.ts
import { auth } from 'firebase-admin';
import { NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase/admin';

initAdmin();

export async function POST(request: Request) {
  const { idToken } = await request.json();

  try {
    // Modifier la durée à 6 heures (en millisecondes)
    const expiresIn = 60 * 60 * 6 * 1000; // 6 heures
    const sessionCookie = await auth().createSessionCookie(idToken, { expiresIn });

    // Utiliser l'API de Response pour définir le cookie
    const response = NextResponse.json({ status: 'success' }, { status: 200 });
    response.cookies.set({
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn / 1000, // convertir en secondes pour maxAge
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function DELETE() {
  // Utiliser l'API de Response pour supprimer le cookie
  const response = NextResponse.json({ status: 'success' }, { status: 200 });
  response.cookies.delete('session');
  return response;
}