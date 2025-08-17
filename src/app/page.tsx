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
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      {/* Admin Button Row */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        mb: 3,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -20,
          left: -20,
          right: -20,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)'
        }
      }}>
        <AdminButton onAuthChange={handleAuthChange} />
      </Box>

      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography
          variant="h1"
          component="h1"
          sx={{
            mb: 3,
            fontSize: { xs: '3rem', md: '4rem' },
            fontWeight: 700,
            background: 'linear-gradient(135deg, #1976d2 0%, #9333ea 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em'
          }}
        >
          Perpetual Watchlist
        </Typography>

        <Typography
          variant="h5"
          color="text.secondary"
          sx={{
            mb: 6,
            maxWidth: 600,
            mx: 'auto',
            lineHeight: 1.4,
            fontWeight: 400
          }}
        >
          {isAdminLoggedIn
            ? '🎬 Admin Dashboard - Manage your personal watchlist'
            : '🍿 Discover movies and TV shows to add to Juho\'s watchlist'
          }
        </Typography>

        <Box sx={{
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '120%',
            height: '120%',
            background: 'radial-gradient(ellipse at center, rgba(25, 118, 210, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            zIndex: -1
          }
        }}>
          <SearchBar
            isAdmin={isAdminLoggedIn}
            onWatchlistSuccess={handleWatchlistSuccess}
          />
        </Box>
      </Box>

      <Divider sx={{
        my: 5,
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
        height: 2
      }} />

      {/* Watchlist Table */}
      <WatchlistTable
        key={refreshTable}
        onRefresh={() => setRefreshTable(prev => prev + 1)}
        isAdmin={isAdminLoggedIn}
      />
    </Container>
  );
}
