import { NextResponse } from 'next/server';
import { clearSessionCookie, getSession } from '@/lib/auth';

export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ success: true, message: 'Sesión cerrada exitosamente.' });
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, user: null }, { status: 401 });
  }
  return NextResponse.json({ success: true, user: session });
}
