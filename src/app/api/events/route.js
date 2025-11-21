import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { cookies } from 'next/headers';
import { verifySession } from '@/app/lib/jwt';
import path from 'path';
import fs from 'fs/promises';

export const runtime = 'nodejs'; // needed for file system access

export async function GET() {
  const events = await prisma.event.findMany({
    orderBy: { startAt: 'asc' },
    include: {
      category: true,
      venue: true,
      organizer: { select: { id: true, name: true } },
      comments: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' }
      },
      rsvps: true,
    },
  });
  return NextResponse.json({ events });
}

export async function POST(req) {
  const token = cookies().get('token')?.value;
  const auth = token ? verifySession(token) : null;
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const form = await req.formData();
  const title = String(form.get('title') || '').trim();
  const description = String(form.get('description') || '').trim();
  const startAtStr = String(form.get('startAt') || '');
  const endAtStr = String(form.get('endAt') || '');
  const categoryId = Number(form.get('categoryId'));
  const venueId = Number(form.get('venueId'));
  const file = form.get('poster');

  if (!title || !description || !startAtStr || !endAtStr || !categoryId || !venueId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const startAt = new Date(startAtStr);
  const endAt = new Date(endAtStr);
  if (isNaN(startAt.getTime()) || isNaN(endAt.getTime())) {
    return NextResponse.json({ error: 'Invalid dates' }, { status: 400 });
  }

  let posterUrl = null;
  if (file && typeof file === 'object' && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = String(file.name).replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const filename = `${Date.now()}-${safeName}`;
    const dir = path.join(process.cwd(), 'public', 'uploads', 'posters');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, filename), buffer);
    posterUrl = `/uploads/posters/${filename}`;
  }

  const event = await prisma.event.create({
    data: {
      title,
      description,
      startAt,
      endAt,
      categoryId,
      venueId,
      organizerId: auth.id,
      posterUrl,
    },
  });

  return NextResponse.json({ event }, { status: 201 });
}