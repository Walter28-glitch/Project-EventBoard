import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { cookies } from 'next/headers';
import { verifySession } from '@/app/lib/jwt';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

export async function DELETE(req, { params }) {
  const token = cookies().get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized (no cookie)' }, { status: 401 });
  const auth = verifySession(token);
  if (!auth) return NextResponse.json({ error: 'Unauthorized (bad token)' }, { status: 401 });

  const eventId = Number(params.id);
  if (!Number.isInteger(eventId) || eventId <= 0) {
    return NextResponse.json({ error: 'Invalid event id' }, { status: 400 });
  }

  const ev = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, organizerId: true, posterUrl: true },
  });

  if (!ev) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (ev.organizerId !== auth.id) {
    return NextResponse.json({ error: 'Forbidden: not your event' }, { status: 403 });
  }

  await prisma.$transaction([
    prisma.comment.deleteMany({ where: { eventId } }),
    prisma.rSVP.deleteMany({ where: { eventId } }),
    prisma.event.delete({ where: { id: eventId } }),
  ]);

  if (ev.posterUrl) {
    const filePath = path.join(process.cwd(), 'public', ev.posterUrl.replace(/^\//, ''));
    try {
      await fs.unlink(filePath);
    } catch (e) {}
  }

  return NextResponse.json({ ok: true });
}