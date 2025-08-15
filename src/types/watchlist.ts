export interface WatchlistItem {
  id: number;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  watched: boolean;
  dateWatched: Date | null;
  dateAdded: Date;
  userRating: number | null;
  priority: number | null;
  favorite: boolean;
  recommendedBy: string | null;
}
