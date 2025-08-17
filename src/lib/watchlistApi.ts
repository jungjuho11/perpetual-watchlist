import { WatchlistItem } from '../types/watchlist';
import toast from 'react-hot-toast';

export interface ProcessedWatchlistItem extends Omit<WatchlistItem, 'dateAdded' | 'dateWatched'> {
  dateAdded: Date;
  dateWatched: Date | null;
}

export const fetchWatchlist = async (retryCount = 0): Promise<ProcessedWatchlistItem[]> => {
  try {
    const response = await fetch('/api/watchlist');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.items) {
      // Convert date strings back to Date objects
      const processedItems = result.items.map((item: WatchlistItem & { dateAdded: string; dateWatched: string | null }) => ({
        ...item,
        dateAdded: new Date(item.dateAdded),
        dateWatched: item.dateWatched ? new Date(item.dateWatched) : null,
      }));
      return processedItems;
    } else if (result.error) {
      throw new Error(result.error);
    }
    
    return [];
  } catch (error) {
    console.error(`Failed to fetch watchlist (attempt ${retryCount + 1}):`, error);
    
    // Retry up to 3 times with exponential backoff
    if (retryCount < 2) {
      const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s
      toast.error(`Loading failed, retrying in ${delay / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWatchlist(retryCount + 1);
    } else {
      // After 3 failed attempts, show error
      toast.error('Failed to load watchlist. Please refresh the page.');
      throw error;
    }
  }
};

export const useFetchWatchlist = (
  setData: React.Dispatch<React.SetStateAction<ProcessedWatchlistItem[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const fetchWatchlistData = async () => {
    try {
      setLoading(true);
      const items = await fetchWatchlist();
      setData(items);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return { fetchWatchlistData };
};
