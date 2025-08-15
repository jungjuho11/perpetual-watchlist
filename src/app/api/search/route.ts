import { NextRequest, NextResponse } from 'next/server';

// TMDB API configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export interface TMDBSearchResult {
  id: number;
  title?: string; // for movies
  name?: string; // for TV shows
  overview: string;
  poster_path: string | null;
  release_date?: string; // for movies
  first_air_date?: string; // for TV shows
  media_type: 'movie' | 'tv';
  vote_average: number;
}

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

  if (!TMDB_API_KEY) {
    return NextResponse.json({ error: 'TMDB API key not configured' }, { status: 500 });
  }

  try {
    // Search for both movies and TV shows
    const response = await fetch(
      `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from TMDB');
    }

    const data = await response.json();
    
    // Filter and format results
    const results: SearchResultItem[] = data.results
      .filter((item: TMDBSearchResult) => 
        (item.media_type === 'movie' || item.media_type === 'tv') && 
        (item.title || item.name)
      )
      .slice(0, 10) // Limit to 10 results
      .map((item: TMDBSearchResult) => ({
        id: item.id,
        title: item.title || item.name || '',
        overview: item.overview,
        posterUrl: item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : null,
        releaseDate: item.release_date || item.first_air_date || '',
        mediaType: item.media_type,
        rating: Math.round(item.vote_average * 10) / 10,
      }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('TMDB search error:', error);
    return NextResponse.json({ error: 'Failed to search movies/shows' }, { status: 500 });
  }
}
