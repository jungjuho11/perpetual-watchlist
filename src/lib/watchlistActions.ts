import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { ProcessedWatchlistItem } from './watchlistApi';

export interface WatchlistActionHandlers {
  handleDelete: (id: number) => Promise<void>;
  handleToggleWatched: (id: number, currentWatched: boolean) => Promise<void>;
  handleToggleFavorite: (id: number, currentFavorite: boolean) => Promise<void>;
  handleOpenDetails: (tmdbId: number, mediaType: 'movie' | 'tv', title: string) => void;
}

export const createWatchlistActionHandlers = (
  data: ProcessedWatchlistItem[],
  setData: React.Dispatch<React.SetStateAction<ProcessedWatchlistItem[]>>,
  setSelectedItem: React.Dispatch<React.SetStateAction<{
    tmdbId: number;
    mediaType: 'movie' | 'tv';
    title: string;
  } | null>>,
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>
): WatchlistActionHandlers => {

  const handleDelete = useCallback(async (id: number) => {
    try {
      const itemToDelete = data.find(item => item.id === id);
      const response = await fetch(`/api/watchlist/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setData(prev => prev.filter(item => item.id !== id));
        toast.success(`Deleted "${itemToDelete?.title}" from watchlist`);
      } else {
        toast.error('Failed to delete item');
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast.error('Failed to delete item');
    }
  }, [data, setData]);

  const handleToggleWatched = useCallback(async (id: number, currentWatched: boolean) => {
    const newWatchedStatus = !currentWatched;
    
    // Optimistic update
    setData(prev => prev.map(item => 
      item.id === id ? { 
        ...item, 
        watched: newWatchedStatus,
        // Clear related fields if marking as unwatched
        dateWatched: newWatchedStatus ? item.dateWatched : null,
        userRating: newWatchedStatus ? item.userRating : null,
        favorite: newWatchedStatus ? item.favorite : false,
      } : item
    ));

    try {
      const updateData: any = { watched: newWatchedStatus };
      
      // If marking as unwatched, clear related fields
      if (!newWatchedStatus) {
        updateData.dateWatched = null;
        updateData.userRating = null;
        updateData.favorite = false;
      }

      const response = await fetch(`/api/watchlist/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const itemTitle = data.find(item => item.id === id)?.title;
        toast.success(`Marked "${itemTitle}" as ${newWatchedStatus ? 'watched' : 'not watched'}`);
      } else {
        // Revert optimistic update on error
        setData(prev => prev.map(item => 
          item.id === id ? { ...item, watched: currentWatched } : item
        ));
        toast.error('Failed to update watched status');
      }
    } catch (error) {
      console.error('Failed to update watched status:', error);
      // Revert optimistic update on error
      setData(prev => prev.map(item => 
        item.id === id ? { ...item, watched: currentWatched } : item
      ));
      toast.error('Failed to update watched status');
    }
  }, [data, setData]);

  const handleToggleFavorite = useCallback(async (id: number, currentFavorite: boolean) => {
    const newFavoriteStatus = !currentFavorite;
    
    // Optimistic update
    setData(prev => prev.map(item => 
      item.id === id ? { ...item, favorite: newFavoriteStatus } : item
    ));

    try {
      const response = await fetch(`/api/watchlist/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorite: newFavoriteStatus }),
      });

      if (response.ok) {
        const itemTitle = data.find(item => item.id === id)?.title;
        toast.success(`${newFavoriteStatus ? 'Added' : 'Removed'} "${itemTitle}" ${newFavoriteStatus ? 'to' : 'from'} favorites`);
      } else {
        // Revert optimistic update on error
        setData(prev => prev.map(item => 
          item.id === id ? { ...item, favorite: currentFavorite } : item
        ));
        toast.error('Failed to update favorite status');
      }
    } catch (error) {
      console.error('Failed to update favorite status:', error);
      // Revert optimistic update on error
      setData(prev => prev.map(item => 
        item.id === id ? { ...item, favorite: currentFavorite } : item
      ));
      toast.error('Failed to update favorite status');
    }
  }, [data, setData]);

  const handleOpenDetails = useCallback((tmdbId: number, mediaType: 'movie' | 'tv', title: string) => {
    setSelectedItem({ tmdbId, mediaType, title });
    setModalOpen(true);
  }, [setSelectedItem, setModalOpen]);

  return {
    handleDelete,
    handleToggleWatched,
    handleToggleFavorite,
    handleOpenDetails,
  };
};
