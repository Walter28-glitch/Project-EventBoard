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

  const { status } = await req.json().catch(() => ({}));
  const valid = ['GOING', 'INTERESTED', 'CANCELED'];
  if (!valid.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const rsvp = await prisma.rSVP.upsert({
    where: { userId_eventId: { userId: auth.id, eventId } },
    update: { status },
    create: { userId: auth.id, eventId, status },
  });

  return NextResponse.json({ rsvp });
}