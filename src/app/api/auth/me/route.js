import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/app/lib/jwt';
import prisma from '@/app/lib/prisma';

export async function GET() {
  const token = cookies().get('token')?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 401 });

  const payload = verifySession(token);
  if (!payload) return NextResponse.json({ user: null }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true, email: true, name: true, profile: true },
  });
  return NextResponse.json({ user });
}