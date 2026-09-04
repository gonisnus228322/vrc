import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { blobs } = await list();
    const thirtyHoursInMs = 30 * 60 * 60 * 1000;
    const now = Date.now();

    const activeFiles = blobs.map((blob) => {
      const uploadedTime = new Date(blob.uploadedAt).getTime();
      const expiresAt = uploadedTime + thirtyHoursInMs;
      const hoursLeft = Math.max(0, ((expiresAt - now) / (1000 * 60 * 60))).toFixed(1);

      return {
        url: blob.url,
        pathname: blob.pathname,
        size: (blob.size / (1024 * 1024)).toFixed(2) + ' MB',
        uploadedAt: blob.uploadedAt,
        hoursLeft,
      };
    });

    return NextResponse.json({ files: activeFiles });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
