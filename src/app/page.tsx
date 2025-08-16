'use client';

import { Container, Typography, Box, Divider } from '@mui/material';
import SearchBar from '../components/SearchBar';
import WatchlistTable from '../components/WatchlistTable';
import AdminButton from '../components/AdminButton';
import { SearchResultItem } from './api/search/route';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Home() {
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
        toast.success(`Added "${item.title}" to your watchlist!`);
        setRefreshTable(prev => prev + 1); // Trigger table refresh
      } else if (response.status === 409) {
        toast.error(`"${item.title}" is already in your watchlist!`);
      } else {
        throw new Error(data.error || 'Failed to add to watchlist');
      }
    } catch (error) {
      console.error('Failed to add to watchlist:', error);
      toast.error('Failed to add item to watchlist');
    }
  };

  const handleAuthChange = (isAdmin: boolean) => {
    setIsAdminLoggedIn(isAdmin);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 2, px: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
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
        
        <SearchBar onAddToWatchlist={handleAddToWatchlist} />
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
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
            : 'Search for movies and TV shows above to add them to Juho\'s watchlist.'
          }
        </Typography>
      </Box>
    </Container>
  );
}
