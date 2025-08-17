import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Global variable to cache the Prisma client instance
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma || new PrismaClient({
  log: ['warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// add movie or tv show to watchlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      tmdbId, 
      mediaType, 
      title, 
      overview, 
      posterUrl, 
      releaseDate, 
      rating,
      watched = false,
      favorite = false,
      dateWatched,
      userRating,
      priority,
      recommendedBy
    } = body;

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
        title,
        posterImage: posterUrl,
        watched,
        favorite,
        dateWatched: dateWatched ? new Date(dateWatched) : null,
        userRating,
        priority,
        recommendedBy,
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
    // Ensure Prisma connection is healthy
    await prisma.$connect();
    
    const watchlistItems = await prisma.watchlistItem.findMany({
      orderBy: {
        dateAdded: 'desc',
      },
    });

    return NextResponse.json({ items: watchlistItems });
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    
    // Try to disconnect and reconnect if there's a connection issue
    try {
      await prisma.$disconnect();
      await prisma.$connect();
    } catch (connectionError) {
      console.error('Prisma connection error:', connectionError);
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch watchlist', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
