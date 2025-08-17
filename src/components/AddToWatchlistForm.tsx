'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Rating,
  Select,
  MenuItem,
  InputLabel,
  Box,
  Typography,
  Avatar,
  Chip,
} from '@mui/material';
import { Movie, Tv } from '@mui/icons-material';
import { SearchResultItem } from '../app/api/search/route';
import toast from 'react-hot-toast';

interface FormData {
  watched: boolean;
  favorite: boolean;
  dateWatched: string;
  userRating: number | null;
  priority: number;
  recommendedBy: string;
}

interface AddToWatchlistFormProps {
  open: boolean;
  onClose: () => void;
  item: SearchResultItem | null;
  isAdmin: boolean;
  onSuccess: () => void;
}

const AddToWatchlistForm: React.FC<AddToWatchlistFormProps> = ({
  open,
  onClose,
  item,
  isAdmin,
  onSuccess,
}) => {
  const { control, handleSubmit, watch, reset, setValue } = useForm<FormData>({
    defaultValues: {
      watched: false,
      favorite: false,
      dateWatched: '',
      userRating: null,
      priority: 1,
      recommendedBy: '',
    },
  });

  const watchedValue = watch('watched');

  React.useEffect(() => {
    if (open) {
      reset({
        watched: false,
        favorite: false,
        dateWatched: '',
        userRating: null,
        priority: 1,
        recommendedBy: '',
      });
    }
  }, [open, reset]);

  const onSubmit = async (data: FormData) => {
    if (!item) return;

    try {
      const payload = {
        tmdbId: item.id,
        mediaType: item.mediaType,
        title: item.title,
        overview: item.overview,
        posterUrl: item.posterUrl,
        releaseDate: item.releaseDate,
        rating: item.rating,
        watched: isAdmin ? data.watched : false,
        favorite: isAdmin && data.watched ? data.favorite : false,
        dateWatched: isAdmin && data.watched && data.dateWatched ? new Date(data.dateWatched).toISOString() : null,
        userRating: isAdmin && data.watched && data.userRating ? data.userRating : null,
        priority: !isAdmin ? data.priority : null,
        recommendedBy: !isAdmin && data.recommendedBy ? data.recommendedBy : null,
      };

      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Added "${item.title}" to your watchlist!`);
        onSuccess();
        onClose();
      } else if (response.status === 409) {
        toast.error(`"${item.title}" is already in your watchlist!`);
      } else {
        throw new Error(result.error || 'Failed to add to watchlist');
      }
    } catch (error) {
      console.error('Failed to add to watchlist:', error);
      toast.error('Failed to add item to watchlist');
    }
  };

  const formatReleaseYear = (releaseDate: string) => {
    return releaseDate ? new Date(releaseDate).getFullYear() : '';
  };

  if (!item) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            p: 1.5,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%)',
            border: '1px solid rgba(25, 118, 210, 0.2)'
          }}>
            {item?.mediaType === 'movie' ? (
              <Movie color="primary" sx={{ fontSize: 28 }} />
            ) : (
              <Tv color="primary" sx={{ fontSize: 28 }} />
            )}
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="600" sx={{ mb: 0.5 }}>
              Add to Watchlist
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isAdmin ? 'Configure your watchlist entry' : 'Recommend this to Juho'}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Item Preview */}
        <Box sx={{
          display: 'flex',
          gap: 2,
          mb: 4,
          p: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(5px)'
        }}>
          <Avatar
            src={item.posterUrl || undefined}
            alt={item.title}
            variant="rounded"
            sx={{ width: 60, height: 90 }}
          >
            {item.mediaType === 'movie' ? <Movie /> : <Tv />}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="subtitle1" fontWeight="600">
                {item.title}
              </Typography>
              <Chip
                label={item.mediaType === 'movie' ? 'Movie' : 'TV Show'}
                size="small"
                sx={{
                  background: item.mediaType === 'movie'
                    ? 'linear-gradient(135deg, #1976d2 0%, #9333ea 100%)'
                    : 'linear-gradient(135deg, #9c27b0 0%, #e91e63 100%)',
                  color: 'white',
                  fontWeight: 600,
                  border: 'none'
                }}
              />
            </Box>

            {formatReleaseYear(item.releaseDate) && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {formatReleaseYear(item.releaseDate)} {item.rating > 0 && `• ⭐ ${item.rating}`}
              </Typography>
            )}

            <Typography variant="body2" color="text.secondary" sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {item.overview || 'No description available.'}
            </Typography>
          </Box>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Admin Fields */}
          {isAdmin && (
            <Box sx={{
              mb: 4,
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)',
              border: '1px solid rgba(25, 118, 210, 0.1)'
            }}>
              <Typography variant="h6" sx={{
                mb: 3,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #1976d2 0%, #9333ea 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                🎬 Admin Options
              </Typography>

              <Controller
                name="watched"
                control={control}
                render={({ field }) => (
                  <FormControl component="fieldset" sx={{ mb: 2 }}>
                    <FormLabel component="legend">Status</FormLabel>
                    <RadioGroup
                      {...field}
                      value={field.value.toString()}
                      onChange={(e) => {
                        const isWatched = e.target.value === 'true';
                        field.onChange(isWatched);
                        if (!isWatched) {
                          setValue('favorite', false);
                          setValue('dateWatched', '');
                          setValue('userRating', null);
                        }
                      }}
                      row
                    >
                      <FormControlLabel value="false" control={<Radio />} label="Not Watched" />
                      <FormControlLabel value="true" control={<Radio />} label="Watched" />
                    </RadioGroup>
                  </FormControl>
                )}
              />

              {/* Watched-specific fields */}
              {watchedValue && (
                <Box sx={{
                  ml: 2,
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(5px)'
                }}>
                  <Controller
                    name="dateWatched"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Date Watched"
                        type="date"
                        fullWidth
                        sx={{ mb: 2 }}
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />

                  <Controller
                    name="userRating"
                    control={control}
                    render={({ field }) => (
                      <Box sx={{ mb: 2 }}>
                        <Typography component="legend" variant="body2" sx={{ mb: 1 }}>
                          Your Rating
                        </Typography>
                        <Rating
                          {...field}
                          value={field.value || 0}
                          onChange={(_, newValue) => field.onChange(newValue)}
                          max={10}
                          size="large"
                        />
                      </Box>
                    )}
                  />

                  <Controller
                    name="favorite"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={field.onChange}
                            color="warning"
                          />
                        }
                        label="Mark as Favorite"
                      />
                    )}
                  />
                </Box>
              )}
            </Box>
          )}

          {/* Regular User Fields */}
          {!isAdmin && (
            <Box sx={{
              mb: 4,
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)',
              border: '1px solid rgba(147, 51, 234, 0.1)'
            }}>
              <Typography variant="h6" sx={{
                mb: 3,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                💡 Recommendation Details
              </Typography>

              <Controller
                name="recommendedBy"
                control={control}
                rules={{ required: 'Please enter your name' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Recommended By"
                    fullWidth
                    sx={{ mb: 2 }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    placeholder="Your name"
                  />
                )}
              />

              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select {...field} label="Priority">
                      <MenuItem value={0}>Low Priority</MenuItem>
                      <MenuItem value={1}>Medium Priority</MenuItem>
                      <MenuItem value={2}>High Priority</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Box>
          )}
        </form>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="medium"
          sx={{
            borderRadius: 3,
            px: 3,
            py: 1,
            borderColor: 'rgba(255,255,255,0.3)',
            color: 'text.secondary',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            '&:hover': {
              borderColor: 'rgba(255,255,255,0.5)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          size="medium"
          sx={{
            borderRadius: 3,
            px: 4,
            py: 1,
            background: 'linear-gradient(135deg, #1976d2 0%, #9333ea 100%)',
            boxShadow: '0 4px 14px 0 rgba(25, 118, 210, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1565c0 0%, #7c3aed 100%)',
              boxShadow: '0 8px 20px 0 rgba(25, 118, 210, 0.4)',
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            fontWeight: 600
          }}
        >
          Add to Watchlist
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddToWatchlistForm;
