'use client';

import { Container, Typography, Box, Divider } from '@mui/material';
import SearchBar from '../components/SearchBar';
import WatchlistTable from '../components/WatchlistTable';
import AdminButton from '../components/AdminButton';
import { useState } from 'react';

export default function Home() {
  const [refreshTable, setRefreshTable] = useState(0);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const handleWatchlistSuccess = () => {
    setRefreshTable(prev => prev + 1); // Trigger table refresh
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
            : 'Search for movies and TV shows add them to Juho\'s watchlist.'
          }
        </Typography>
        
        <SearchBar 
          isAdmin={isAdminLoggedIn}
          onWatchlistSuccess={handleWatchlistSuccess}
        />
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
      {/* Watchlist Table */}
      <WatchlistTable 
        key={refreshTable} 
        onRefresh={() => setRefreshTable(prev => prev + 1)}
        isAdmin={isAdminLoggedIn}
      />
    </Container>
  );
}
