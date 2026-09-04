import { list, del } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { blobs } = await list();
    const thirtyHoursInMs = 30 * 60 * 60 * 1000;
    const now = Date.now();

    const expiredBlobs = blobs.filter((blob) => {
      const uploadedTime = new Date(blob.uploadedAt).getTime();
      return now - uploadedTime > thirtyHoursInMs;
    });

    const urlsToDelete = expiredBlobs.map((blob) => blob.url);
    if (urlsToDelete.length > 0) {
      await del(urlsToDelete);
    }

    return NextResponse.json({
      message: `Cleaned up ${urlsToDelete.length} expired file(s).`,
      deleted: urlsToDelete,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
