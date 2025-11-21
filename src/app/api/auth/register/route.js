import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/app/lib/prisma';
import { registerSchema } from '@/app/lib/validators';
import { signSession } from '@/app/lib/jwt';

export async function POST(req) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 409 });

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: { email: data.email, name: data.name, passwordHash, profile: { create: {} } },
      select: { id: true, email: true, name: true },
    });

    const token = signSession(user);
    const res = NextResponse.json({ user }, { status: 201 });
    res.cookies.set('token', token, {
      httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, path: '/',
    });
    return res;
  } catch (err) {
    const message = err?.errors?.[0]?.message || 'Invalid input';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}