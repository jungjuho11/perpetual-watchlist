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
  Grid,
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
              Unable to load details for "{title}"
            </Typography>
          </Box>
        )}

        {details && (
          <Box>
            {/* Backdrop Header */}
            <Box
              sx={{
                position: 'relative',
                height: 300,
                backgroundImage: details.backdropUrl ? `url(${details.backdropUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: 'grey.900',
                display: 'flex',
                alignItems: 'flex-end',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(transparent 0%, rgba(0,0,0,0.7) 100%)',
                }}
              />
              
              <Box sx={{ position: 'relative', p: 3, color: 'white', width: '100%' }}>
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-end' }}>
                  {details.posterUrl && (
                    <Card sx={{ flexShrink: 0 }}>
                      <CardMedia
                        component="img"
                        image={details.posterUrl}
                        alt={details.title}
                        sx={{ width: 120, height: 180 }}
                      />
                    </Card>
                  )}
                  
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h4" component="h1" fontWeight="bold">
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
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Star sx={{ color: 'gold' }} />
                        <Typography variant="h6">
                          {details.rating}/10
                        </Typography>
                        <Typography variant="body2" color="grey.300">
                          ({details.voteCount.toLocaleString()} votes)
                        </Typography>
                      </Box>
                      
                      {details.imdbId && (
                        <Button
                          variant="outlined"
                          size="small"
                          href={`https://www.imdb.com/title/${details.imdbId}`}
                          target="_blank"
                          sx={{ color: 'white', borderColor: 'white' }}
                        >
                          IMDb
                        </Button>
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {details.genres.map((genre) => (
                        <Chip
                          key={genre}
                          label={genre}
                          size="small"
                          variant="filled"
                          sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Content Section */}
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {/* Left Column - Overview and Details */}
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" gutterBottom>
                    Overview
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {details.overview || 'No overview available.'}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="h6" gutterBottom>
                    Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CalendarToday fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Release Date
                        </Typography>
                      </Box>
                      <Typography variant="body1">
                        {formatReleaseDate(details.releaseDate)}
                      </Typography>
                    </Grid>
                    
                    {details.runtime && (
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <AccessTime fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            Runtime
                          </Typography>
                        </Box>
                        <Typography variant="body1">
                          {formatRuntime(details.runtime)}
                        </Typography>
                      </Grid>
                    )}
                    
                    {details.seasons && (
                      <>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Seasons
                          </Typography>
                          <Typography variant="body1">
                            {details.seasons}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Episodes
                          </Typography>
                          <Typography variant="body1">
                            {details.episodes}
                          </Typography>
                        </Grid>
                      </>
                    )}
                    
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        {details.mediaType === 'movie' ? 'Director' : 'Creators'}
                      </Typography>
                      <Typography variant="body1">
                        {details.director || details.creators?.join(', ') || 'Unknown'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Right Column - Cast */}
                <Grid item xs={12} md={4}>
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
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MovieDetailsModal;
