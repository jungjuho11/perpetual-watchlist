import { NextRequest, NextResponse } from 'next/server';

// TMDB API configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export interface TMDBMovieDetails {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number;
  vote_average: number;
  vote_count: number;
  genres: { id: number; name: string }[];
  production_companies: { id: number; name: string; logo_path: string | null }[];
  credits: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
      order: number;
    }[];
    crew: {
      id: number;
      name: string;
      job: string;
      department: string;
    }[];
  };
  external_ids: {
    imdb_id: string | null;
  };
}

export interface TMDBTVDetails {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  last_air_date: string;
  number_of_seasons: number;
  number_of_episodes: number;
  vote_average: number;
  vote_count: number;
  genres: { id: number; name: string }[];
  production_companies: { id: number; name: string; logo_path: string | null }[];
  created_by: {
    id: number;
    name: string;
    profile_path: string | null;
  }[];
  credits: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
      order: number;
    }[];
    crew: {
      id: number;
      name: string;
      job: string;
      department: string;
    }[];
  };
  external_ids: {
    imdb_id: string | null;
  };
}

export interface DetailedInfo {
  id: number;
  title: string;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string;
  runtime?: number; // for movies
  seasons?: number; // for TV shows
  episodes?: number; // for TV shows
  rating: number;
  voteCount: number;
  genres: string[];
  director?: string; // for movies
  creators?: string[]; // for TV shows
  cast: {
    name: string;
    character: string;
    profileUrl: string | null;
  }[];
  imdbId: string | null;
  mediaType: 'movie' | 'tv';
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tmdbId = searchParams.get('tmdbId');
  const mediaType = searchParams.get('mediaType');

  if (!tmdbId || !mediaType) {
    return NextResponse.json({ error: 'tmdbId and mediaType parameters are required' }, { status: 400 });
  }

  if (mediaType !== 'movie' && mediaType !== 'tv') {
    return NextResponse.json({ error: 'mediaType must be either "movie" or "tv"' }, { status: 400 });
  }

  if (!TMDB_API_KEY) {
    return NextResponse.json({ error: 'TMDB API key not configured' }, { status: 500 });
  }

  try {
    // Fetch detailed information with credits and external IDs
    const response = await fetch(
      `${TMDB_BASE_URL}/${mediaType}/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits,external_ids`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from TMDB');
    }

    const data: TMDBMovieDetails | TMDBTVDetails = await response.json();
    
    // Format the response
    const isMovie = mediaType === 'movie';
    const movieData = data as TMDBMovieDetails;
    const tvData = data as TMDBTVDetails;

    const detailedInfo: DetailedInfo = {
      id: data.id,
      title: isMovie ? movieData.title : tvData.name,
      overview: data.overview,
      posterUrl: data.poster_path ? `${TMDB_IMAGE_BASE_URL}${data.poster_path}` : null,
      backdropUrl: data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : null,
      releaseDate: isMovie ? movieData.release_date : tvData.first_air_date,
      rating: Math.round(data.vote_average * 10) / 10,
      voteCount: data.vote_count,
      genres: data.genres.map(genre => genre.name),
      cast: data.credits.cast
        .slice(0, 10) // Top 10 cast members
        .map(actor => ({
          name: actor.name,
          character: actor.character,
          profileUrl: actor.profile_path ? `${TMDB_IMAGE_BASE_URL}${actor.profile_path}` : null,
        })),
      imdbId: data.external_ids.imdb_id,
      mediaType,
    };

    // Add movie-specific fields
    if (isMovie) {
      detailedInfo.runtime = movieData.runtime;
      // Find director
      const director = movieData.credits.crew.find(person => person.job === 'Director');
      detailedInfo.director = director?.name;
    } else {
      // Add TV-specific fields
      detailedInfo.seasons = tvData.number_of_seasons;
      detailedInfo.episodes = tvData.number_of_episodes;
      detailedInfo.creators = tvData.created_by.map(creator => creator.name);
    }

    return NextResponse.json(detailedInfo);
  } catch (error) {
    console.error('TMDB details error:', error);
    return NextResponse.json({ error: 'Failed to fetch details' }, { status: 500 });
  }
}
