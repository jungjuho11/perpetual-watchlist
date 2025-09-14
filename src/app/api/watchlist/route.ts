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
    
    // Forward the request to Spring Boot backend
    const response = await fetch('https://perpetual-watchlist-springboot.onrender.com/api/watchlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error adding to watchlist via Spring Boot:', error);
    return NextResponse.json(
      { error: 'Failed to add item to watchlist' },
      { status: 500 }
    );
  }
}

// juhotodo we need to replace this with the new endpoint that is being hosted on Render
export async function GET() {
  try {
    const response = await fetch('https://perpetual-watchlist-springboot.onrender.com/api/watchlist');
    
    if (!response.ok) {
      throw new Error(`Spring Boot API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching watchlist from Spring Boot:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch watchlist', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
