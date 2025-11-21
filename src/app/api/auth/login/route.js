import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/app/lib/prisma';
import { loginSchema } from '@/app/lib/validators';
import { signSession } from '@/app/lib/jwt';

export async function POST(req) {
  try {
    const body = await req.json();
    const data = loginSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });

    const ok = await bcrypt.compare(data.password, user.passwordHash);
    if (!ok) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });

    const publicUser = { id: user.id, email: user.email, name: user.name };
    const token = signSession(publicUser);
    const res = NextResponse.json({ user: publicUser }, { status: 200 });
    res.cookies.set('token', token, {
      httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, path: '/',
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
}