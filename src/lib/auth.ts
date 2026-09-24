import { cookies } from 'next/headers';

export interface UserSession {
  id: string;
  cedula: string;
  nombre: string;
  role: 'jefe' | 'master';
  comunidad?: string;
}

const SESSION_COOKIE_NAME = 'sistema_1x10_session';

export async function setSessionCookie(session: UserSession) {
  const cookieStore = cookies();
  const token = Buffer.from(JSON.stringify(session)).toString('base64');
  
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 días
    path: '/',
  });
}

export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    
    if (!token) return null;
    
    const jsonStr = Buffer.from(token, 'base64').toString('utf-8');
    const session: UserSession = JSON.parse(jsonStr);
    return session;
  } catch (error) {
    return null;
  }
}

export async function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
