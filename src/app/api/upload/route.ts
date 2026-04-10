import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifySessionToken } from '@/lib/session';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];

export async function POST(request: Request): Promise<NextResponse> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;
  if (!sessionToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const adminId = verifySessionToken(sessionToken);
  if (!adminId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const admin = await prisma.admin.findUnique({ where: { id: adminId }, select: { id: true, active: true } });
  if (!admin || !admin.active) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const rawFilename = searchParams.get('filename');

  if (!rawFilename || !request.body) {
    return NextResponse.json({ message: 'No filename or file body provided.' }, { status: 400 });
  }

  // Sanitize filename: strip directory separators and dangerous characters
  const filename = rawFilename.replace(/[/\\:*?"<>|]/g, '').replace(/\.\./g, '');
  if (!filename) {
    return NextResponse.json({ message: 'Invalid filename.' }, { status: 400 });
  }

  const contentType = request.headers.get('content-type');
  if (contentType && !ALLOWED_TYPES.some(t => contentType.startsWith(t))) {
    return NextResponse.json({ message: 'File type not allowed.' }, { status: 400 });
  }

  const blob = await put(filename, request.body, {
    access: 'public',
  });

  return NextResponse.json(blob);
}
