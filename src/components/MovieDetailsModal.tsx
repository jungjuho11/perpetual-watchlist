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
          borderRadius: 4,
          maxHeight: '90vh',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      }}
    >
      <DialogActions sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}>
        <IconButton
          onClick={handleClose}
          sx={{
            bgcolor: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.2)',
              transform: 'scale(1.1)'
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
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
                background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                p: 4,
              }}
            >
              <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start', color: 'white' }}>
                {details.posterUrl && (
                  <Card sx={{
                    flexShrink: 0,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    overflow: 'hidden'
                  }}>
                    <CardMedia
                      component="img"
                      image={details.posterUrl}
                      alt={details.title}
                      sx={{ width: 280, height: 420 }}
                    />
                  </Card>
                )}

                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography
                      variant="h3"
                      component="h1"
                      sx={{
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #fff 0%, #e3f2fd 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {details.title}
                    </Typography>
                    <Chip
                      icon={details.mediaType === 'movie' ? <Movie /> : <Tv />}
                      label={details.mediaType === 'movie' ? 'Movie' : 'TV Show'}
                      size="medium"
                      sx={{
                        background: details.mediaType === 'movie'
                          ? 'linear-gradient(135deg, #1976d2 0%, #9333ea 100%)'
                          : 'linear-gradient(135deg, #9c27b0 0%, #e91e63 100%)',
                        color: 'white',
                        fontWeight: 600,
                        border: 'none',
                        '& .MuiChip-icon': { color: 'white' }
                      }}
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
                        sx={{
                          borderRadius: 3,
                          px: 3,
                          py: 1,
                          borderColor: 'rgba(255,255,255,0.5)',
                          color: 'white',
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                          backdropFilter: 'blur(5px)',
                          fontWeight: 600,
                          '&:hover': {
                            borderColor: '#f5c518',
                            background: 'linear-gradient(135deg, rgba(245, 197, 24, 0.2) 0%, rgba(245, 197, 24, 0.1) 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 14px 0 rgba(245, 197, 24, 0.3)'
                          },
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        IMDb
                      </Button>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
                    {details.genres.map((genre) => (
                      <Chip
                        key={genre}
                        label={genre}
                        size="medium"
                        sx={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                          color: 'white',
                          border: '1px solid rgba(255,255,255,0.3)',
                          fontWeight: 500,
                          backdropFilter: 'blur(5px)'
                        }}
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
            <Box sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
                {/* Left Column - Overview and Details */}
                <Box sx={{
                  flex: 2,
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(5px)'
                }}>
                  <Typography variant="h5" sx={{
                    mb: 2,
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #1976d2 0%, #9333ea 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    📖 Overview
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ lineHeight: 1.7, mb: 3 }}>
                    {details.overview || 'No overview available.'}
                  </Typography>

                  <Divider sx={{ my: 3, opacity: 0.6 }} />

                  <Typography variant="h6" sx={{
                    mb: 2,
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #1976d2 0%, #9333ea 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    🎬 Additional Details
                  </Typography>
                  <Box sx={{
                    p: 2,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {details.mediaType === 'movie' ? 'Director' : 'Creators'}
                    </Typography>
                    <Typography variant="body1" fontWeight="500">
                      {details.director || details.creators?.join(', ') || 'Unknown'}
                    </Typography>
                  </Box>
                </Box>

                {/* Right Column - Cast */}
                <Box sx={{
                  flex: 1,
                  minWidth: { md: 300 },
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)',
                  border: '1px solid rgba(147, 51, 234, 0.1)',
                  backdropFilter: 'blur(5px)'
                }}>
                  <Typography variant="h5" sx={{
                    mb: 3,
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    🎭 Main Cast
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {details.cast.map((actor, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          p: 2,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 14px 0 rgba(147, 51, 234, 0.2)',
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)'
                          }
                        }}
                      >
                        <Avatar
                          src={actor.profileUrl || undefined}
                          alt={actor.name}
                          sx={{
                            width: 50,
                            height: 50,
                            border: '2px solid rgba(147, 51, 234, 0.3)'
                          }}
                        >
                          {actor.name.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight="600" noWrap>
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
