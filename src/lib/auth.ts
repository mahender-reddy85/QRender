import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import type { User } from '@/lib/definitions';

const SESSION_COOKIE_NAME = 'qr_hub_session';

export async function createSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  return sessionCookie?.value || null;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function findUserById(userId: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  return user ? { id: user.id, email: user.email, password: user.password } : null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return user ? { id: user.id, email: user.email, password: user.password } : null;
}

export async function createUser(email: string, password: string): Promise<User> {
  // In a real app, you MUST hash the password.
  // const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password },
  });
  return { id: user.id, email: user.email, password: user.password };
}
