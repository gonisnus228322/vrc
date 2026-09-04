import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { blobs } = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return NextResponse.json(blobs);
  } catch (error) {
    console.error('Error fetching blobs:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to list files' },
      { status: 500 }
    );
  }
}
