import { NextRequest, NextResponse } from 'next/server';

export interface SearchResultItem {
  id: number;
  title: string;
  overview: string;
  posterUrl: string | null;
  releaseDate: string;
  mediaType: 'movie' | 'tv';
  rating: number;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    // Forward the search request to Spring Boot backend
    const response = await fetch(
      `https://perpetual-watchlist-springboot.onrender.com/api/search?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(`Spring Boot search API error: ${response.status} ${response.statusText}`);
    }

    const results: SearchResultItem[] = await response.json();

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Spring Boot search error:', error);
    return NextResponse.json({ error: 'Failed to search movies/shows' }, { status: 500 });
  }
}
