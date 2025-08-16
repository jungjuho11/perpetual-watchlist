'use client';

import { Container, Typography, Box, Alert, Divider } from '@mui/material';
import SearchBar from '../components/SearchBar';
import WatchlistTable from '../components/WatchlistTable';
import AdminButton from '../components/AdminButton';
import { SearchResultItem } from './api/search/route';
import { useState } from 'react';

export default function Home() {
  const [notification, setNotification] = useState<string | null>(null);
  const [refreshTable, setRefreshTable] = useState(0);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

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
        setRefreshTable(prev => prev + 1); // Trigger table refresh
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

  const handleAuthChange = (isAdmin: boolean) => {
    setIsAdminLoggedIn(isAdmin);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box /> {/* Spacer */}
          <Typography variant="h2" component="h1">
            Perpetual Watchlist
          </Typography>
          <AdminButton onAuthChange={handleAuthChange} />
        </Box>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          {isAdminLoggedIn 
            ? 'Admin Dashboard - Manage your watchlist' 
            : 'Track movies and TV shows you want to watch'
          }
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
      
      <Divider sx={{ my: 4 }} />
      
      {/* Watchlist Table */}
      <WatchlistTable 
        key={refreshTable} 
        onRefresh={() => setRefreshTable(prev => prev + 1)}
        isAdmin={isAdminLoggedIn}
      />
      
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {isAdminLoggedIn
            ? 'You can edit ratings, mark as watched, and delete items.'
            : 'Search for movies and TV shows above to add them to your watchlist.'
          }
        </Typography>
      </Box>
    </Container>
  );
}
