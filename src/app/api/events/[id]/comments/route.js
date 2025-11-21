import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { cookies } from 'next/headers';
import { verifySession } from '@/app/lib/jwt';

export async function POST(req, { params }) {
  const token = cookies().get('token')?.value;
  const auth = token ? verifySession(token) : null;
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const eventId = Number(params.id);
  if (!eventId) return NextResponse.json({ error: 'Invalid event id' }, { status: 400 });

  const { content } = await req.json().catch(() => ({}));
  if (!content || String(content).trim().length < 1) {
    return NextResponse.json({ error: 'Comment required' }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: { content: String(content).trim(), eventId, userId: auth.id },
  });

  return NextResponse.json({ comment }, { status: 201 });
}