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
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          Add to Watchlist
        </Typography>
      </DialogTitle>
      
      <DialogContent dividers>
        {/* Item Preview */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
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
              <Typography variant="subtitle1" fontWeight="bold">
                {item.title}
              </Typography>
              <Chip
                label={item.mediaType === 'movie' ? 'Movie' : 'TV Show'}
                size="small"
                color={item.mediaType === 'movie' ? 'primary' : 'secondary'}
                variant="outlined"
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
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                Admin Options
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
                <Box sx={{ ml: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
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
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                Recommendation Details
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
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit(onSubmit)} 
          variant="contained" 
          color="primary"
        >
          Add to Watchlist
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddToWatchlistForm;
