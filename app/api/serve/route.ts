import { get } from '@vercel/blob';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get('pathname');
  if (!pathname) {
    return NextResponse.json({ error: 'Missing pathname' }, { status: 400 });
  }

  try {
    const result = await get(pathname, {
      access: 'private',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (!result) {
      return new NextResponse('File not found', { status: 404 });
    }

    return new NextResponse(result.stream, {
      headers: {
        'Cache-Control': 'private, no-cache',
        'Content-Type': result.blob.contentType,
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
