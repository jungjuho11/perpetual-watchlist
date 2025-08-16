export interface WatchlistItem {
  id: number;
  tmdbId: number;
  title?: string | null;
  posterImage?: string | null;
  mediaType: 'movie' | 'tv';
  watched: boolean;
  dateWatched: Date | null;
  dateAdded: Date;
  userRating: number | null;
  priority: number | null;
  favorite: boolean;
  recommendedBy: string | null;
}
