import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Global variable to cache the Prisma client instance
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// add movie or tv show to watchlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tmdbId, mediaType, title } = body;

    // Validate required fields
    if (!tmdbId || !mediaType || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: tmdbId, mediaType, title' },
        { status: 400 }
      );
    }

    // Check if item already exists in watchlist
    const existingItem = await prisma.watchlistItem.findFirst({
      where: {
        tmdbId: tmdbId,
        mediaType: mediaType,
      },
    });

    if (existingItem) {
      return NextResponse.json(
        { error: 'Item already exists in watchlist', item: existingItem },
        { status: 409 }
      );
    }

    // Add new item to watchlist
    const newItem = await prisma.watchlistItem.create({
      data: {
        tmdbId,
        mediaType,
        watched: false,
        favorite: false,
        title,
        // Note: We could extend the schema to store additional TMDB data
        // For now, we'll just store the essentials
      },
    });

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return NextResponse.json(
      { error: 'Failed to add item to watchlist' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const watchlistItems = await prisma.watchlistItem.findMany({
      orderBy: {
        dateAdded: 'desc',
      },
    });

    return NextResponse.json({ items: watchlistItems });
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch watchlist' },
      { status: 500 }
    );
  }
}
