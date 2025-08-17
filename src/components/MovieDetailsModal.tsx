'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Chip,
  Card,
  CardMedia,
  CircularProgress,
  IconButton,
  Divider,
} from '@mui/material';
import { Close, Star, AccessTime, CalendarToday, Movie, Tv } from '@mui/icons-material';

interface DetailedInfo {
  id: number;
  title: string;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string;
  runtime?: number;
  seasons?: number;
  episodes?: number;
  rating: number;
  voteCount: number;
  genres: string[];
  director?: string;
  creators?: string[];
  cast: {
    name: string;
    character: string;
    profileUrl: string | null;
  }[];
  imdbId: string | null;
  mediaType: 'movie' | 'tv';
}

interface MovieDetailsModalProps {
  open: boolean;
  onClose: () => void;
  tmdbId: number | null;
  mediaType: 'movie' | 'tv' | null;
  title: string;
}

const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({
  open,
  onClose,
  tmdbId,
  mediaType,
  title,
}) => {
  const [details, setDetails] = useState<DetailedInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && tmdbId && mediaType) {
      fetchDetails();
    }
  }, [open, tmdbId, mediaType]);

  const fetchDetails = async () => {
    if (!tmdbId || !mediaType) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/details?tmdbId=${tmdbId}&mediaType=${mediaType}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch details');
      }
      
      const data: DetailedInfo = await response.json();
      setDetails(data);
    } catch (err) {
      console.error('Error fetching details:', err);
      setError('Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDetails(null);
    setError(null);
    onClose();
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatReleaseDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          maxHeight: '90vh',
        }
      }}
    >
      <DialogActions sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
        <IconButton onClick={handleClose} sx={{ bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}>
          <Close />
        </IconButton>
      </DialogActions>

      <DialogContent sx={{ p: 0 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="error" variant="h6">
              {error}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Unable to load details for &quot;{title}&quot;
            </Typography>
          </Box>
        )}

        {details && (
          <Box>
            {/* Header Section */}
            <Box
              sx={{
                backgroundColor: 'grey.900',
                p: 4,
              }}
            >
              <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start', color: 'white' }}>
                {details.posterUrl && (
                  <Card sx={{ flexShrink: 0 }}>
                    <CardMedia
                      component="img"
                      image={details.posterUrl}
                      alt={details.title}
                      sx={{ width: 280, height: 420 }}
                    />
                  </Card>
                )}
                
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="h3" component="h1" fontWeight="bold">
                      {details.title}
                    </Typography>
                    <Chip
                      icon={details.mediaType === 'movie' ? <Movie /> : <Tv />}
                      label={details.mediaType === 'movie' ? 'Movie' : 'TV Show'}
                      size="small"
                      variant="outlined"
                      sx={{ color: 'white', borderColor: 'white' }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Star sx={{ color: 'gold', fontSize: 28 }} />
                      <Typography variant="h5">
                        {details.rating}/10
                      </Typography>
                      <Typography variant="body1" color="grey.300">
                        ({details.voteCount.toLocaleString()} votes)
                      </Typography>
                    </Box>
                    
                    {details.imdbId && (
                      <Button
                        variant="outlined"
                        size="medium"
                        href={`https://www.imdb.com/title/${details.imdbId}`}
                        target="_blank"
                        sx={{ color: 'white', borderColor: 'white' }}
                      >
                        IMDb
                      </Button>
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                    {details.genres.map((genre) => (
                      <Chip
                        key={genre}
                        label={genre}
                        size="medium"
                        variant="filled"
                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                      />
                    ))}
                  </Box>

                  {/* Quick Details */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday fontSize="small" color="action" />
                      <Typography variant="body1">
                        {formatReleaseDate(details.releaseDate)}
                      </Typography>
                    </Box>
                    
                    {details.runtime && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime fontSize="small" color="action" />
                        <Typography variant="body1">
                          {formatRuntime(details.runtime)}
                        </Typography>
                      </Box>
                    )}
                    
                    {details.seasons && (
                      <Typography variant="body1">
                        {details.seasons} Seasons • {details.episodes} Episodes
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Content Section */}
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                {/* Left Column - Overview and Details */}
                <Box sx={{ flex: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Overview
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {details.overview || 'No overview available.'}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="h6" gutterBottom>
                    Additional Details
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                      <Typography variant="body2" color="text.secondary">
                        {details.mediaType === 'movie' ? 'Director' : 'Creators'}
                      </Typography>
                      <Typography variant="body1">
                        {details.director || details.creators?.join(', ') || 'Unknown'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Right Column - Cast */}
                <Box sx={{ flex: 1, minWidth: { md: 300 } }}>
                  <Typography variant="h6" gutterBottom>
                    Main Cast
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {details.cast.map((actor, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={actor.profileUrl || undefined}
                          alt={actor.name}
                          sx={{ width: 50, height: 50 }}
                        >
                          {actor.name.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight="medium" noWrap>
                            {actor.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {actor.character}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MovieDetailsModal;
