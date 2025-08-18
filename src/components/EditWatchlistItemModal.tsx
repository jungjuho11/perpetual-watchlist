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
   InputLabel,
   Select,
   MenuItem,
   Switch,
   Rating,
   Box,
   Typography,
   Avatar,
   Chip,
   FormControlLabel,
} from '@mui/material';
import { Edit, Movie, Tv, Save, Cancel } from '@mui/icons-material';
import { ProcessedWatchlistItem } from '../lib/watchlistApi';
import toast from 'react-hot-toast';

interface EditFormData {
   watched: boolean;
   favorite: boolean;
   dateWatched: string;
   dateAdded: string;
   userRating: number | null;
   priority: number;
   recommendedBy: string;
}

interface EditWatchlistItemModalProps {
   open: boolean;
   onClose: () => void;
   item: ProcessedWatchlistItem | null;
   onSuccess: () => void;
}

const EditWatchlistItemModal: React.FC<EditWatchlistItemModalProps> = ({
   open,
   onClose,
   item,
   onSuccess,
}) => {
   const { control, handleSubmit, watch, reset } = useForm<EditFormData>({
      defaultValues: {
         watched: false,
         favorite: false,
         dateWatched: '',
         dateAdded: '',
         userRating: null,
         priority: 1,
         recommendedBy: '',
      },
   });

   const watchedValue = watch('watched');

   React.useEffect(() => {
      if (open && item) {
         reset({
            watched: item.watched,
            favorite: item.favorite,
            dateWatched: item.dateWatched ? item.dateWatched.toISOString().split('T')[0] : '',
            dateAdded: item.dateAdded ? item.dateAdded.toISOString().split('T')[0] : '',
            userRating: item.userRating,
            priority: item.priority || 1,
            recommendedBy: item.recommendedBy || '',
         });
      }
   }, [open, item, reset]);

   const onSubmit = async (data: EditFormData) => {
      if (!item) return;

      try {
         const payload = {
            watched: data.watched,
            favorite: data.watched ? data.favorite : false,
            dateWatched: data.watched && data.dateWatched ? new Date(data.dateWatched).toISOString() : null,
            dateAdded: data.dateAdded ? new Date(data.dateAdded).toISOString() : null,
            userRating: data.watched && data.userRating ? data.userRating : null,
            priority: !data.watched ? data.priority : null,
            recommendedBy: data.recommendedBy || null,
         };

         const response = await fetch(`/api/watchlist/${item.id}`, {
            method: 'PUT',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
         });

         const result = await response.json();

         if (response.ok) {
            toast.success(`Updated "${item.title}" successfully!`);
            onSuccess();
            onClose();
         } else {
            throw new Error(result.error || 'Failed to update item');
         }
      } catch (error) {
         console.error('Failed to update item:', error);
         toast.error('Failed to update item');
      }
   };



   if (!item) return null;

   return (
      <Dialog
         open={open}
         onClose={onClose}
         maxWidth="md"
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
                  background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%)',
                  border: '1px solid rgba(255, 152, 0, 0.2)'
               }}>
                  <Edit color="warning" sx={{ fontSize: 28 }} />
               </Box>
               <Box>
                  <Typography variant="h5" fontWeight="600" sx={{ mb: 0.5 }}>
                     Edit Watchlist Item
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                     Update all details for this item
                  </Typography>
               </Box>
            </Box>
         </DialogTitle>

         <DialogContent>
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

               </Box>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
               {/* Status and Core Fields */}
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
                     📝 Status & Details
                  </Typography>

                  <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
                     <Controller
                        name="watched"
                        control={control}
                        render={({ field }) => (
                           <FormControlLabel
                              control={
                                 <Switch
                                    checked={field.value}
                                    onChange={field.onChange}
                                    color="primary"
                                 />
                              }
                              label="Watched"
                           />
                        )}
                     />

                     <Controller
                        name="dateAdded"
                        control={control}
                        render={({ field }) => (
                           <TextField
                              {...field}
                              label="Date Added"
                              type="date"
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                           />
                        )}
                     />
                  </Box>
               </Box>

               {/* Watched-specific fields */}
               {watchedValue && (
                  <Box sx={{
                     mb: 4,
                     p: 3,
                     borderRadius: 3,
                     background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(139, 195, 74, 0.05) 100%)',
                     border: '1px solid rgba(76, 175, 80, 0.1)'
                  }}>
                     <Typography variant="h6" sx={{
                        mb: 3,
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                     }}>
                        ✅ Watched Details
                     </Typography>

                     <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
                        <Controller
                           name="dateWatched"
                           control={control}
                           render={({ field }) => (
                              <TextField
                                 {...field}
                                 label="Date Watched"
                                 type="date"
                                 fullWidth
                                 InputLabelProps={{ shrink: true }}
                              />
                           )}
                        />

                        <Controller
                           name="userRating"
                           control={control}
                           render={({ field }) => (
                              <Box>
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
                  </Box>
               )}

               {/* Recommendation Fields */}
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
                     💡 Recommendation Info
                  </Typography>

                  <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
                     <Controller
                        name="recommendedBy"
                        control={control}
                        render={({ field }) => (
                           <TextField
                              {...field}
                              label="Recommended By"
                              fullWidth
                              placeholder="Who recommended this?"
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
               </Box>
            </form>
         </DialogContent>

         <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button
               onClick={onClose}
               variant="outlined"
               size="medium"
               startIcon={<Cancel />}
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
               startIcon={<Save />}
               sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1,
                  background: 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)',
                  boxShadow: '0 4px 14px 0 rgba(255, 152, 0, 0.3)',
                  '&:hover': {
                     background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
                     boxShadow: '0 8px 20px 0 rgba(255, 152, 0, 0.4)',
                     transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontWeight: 600
               }}
            >
               Save Changes
            </Button>
         </DialogActions>
      </Dialog>
   );
};

export default EditWatchlistItemModal;
