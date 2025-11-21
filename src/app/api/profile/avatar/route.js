import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/app/lib/jwt';
import prisma from '@/app/lib/prisma';
import path from 'path';
import fs from 'fs/promises';

export const runtime = 'nodejs'; // allow fs

export async function POST(req) {
  const token = cookies().get('token')?.value;
  const auth = token ? verifySession(token) : null;
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const form = await req.formData();
  const file = form.get('avatar');
  if (!file || typeof file !== 'object' || file.size === 0) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (file.type && !allowed.includes(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = String(file.name).replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const filename = `${Date.now()}-${safeName}`;
  const dir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), buffer);
  const avatarUrl = `/uploads/avatars/${filename}`;

  await prisma.profile.update({
    where: { userId: auth.id },
    data: { avatarUrl },
  });

  return NextResponse.json({ avatarUrl }, { status: 201 });
}