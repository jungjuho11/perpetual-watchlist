'use client';

import { Container, Typography, Box, Alert } from '@mui/material';
import SearchBar from '../components/SearchBar';
import { SearchResultItem } from './api/search/route';
import { useState } from 'react';

export default function Home() {
  const [notification, setNotification] = useState<string | null>(null);

  const handleAddToWatchlist = async (item: SearchResultItem) => {
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tmdbId: item.id,
          mediaType: item.mediaType,
          title: item.title,
          overview: item.overview,
          posterUrl: item.posterUrl,
          releaseDate: item.releaseDate,
          rating: item.rating,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNotification(`Added "${item.title}" to your watchlist!`);
      } else if (response.status === 409) {
        setNotification(`"${item.title}" is already in your watchlist!`);
      } else {
        throw new Error(data.error || 'Failed to add to watchlist');
      }
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Failed to add to watchlist:', error);
      setNotification('Failed to add item to watchlist');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Perpetual Watchlist
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Track movies and TV shows you want to watch
        </Typography>
        
        {notification && (
          <Alert 
            severity="success" 
            sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}
            onClose={() => setNotification(null)}
          >
            {notification}
          </Alert>
        )}
        
        <SearchBar onAddToWatchlist={handleAddToWatchlist} />
      </Box>
      
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Search for movies and TV shows above to add them to your watchlist.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Your watchlist and viewing history will be saved automatically.
        </Typography>
      </Box>
    </Container>
  );
}
