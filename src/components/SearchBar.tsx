'use client';

import React, { useState, useMemo } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  Avatar,
  Chip,
  CircularProgress,
  Paper,
  IconButton,
} from '@mui/material';
import { Search, Add, Movie, Tv } from '@mui/icons-material';
import { debounce } from '@mui/material/utils';
import { SearchResultItem } from '../app/api/search/route';
import AddToWatchlistForm from './AddToWatchlistForm';
import ContactGateModal from './ContactGateModal';

interface SearchBarProps {
  isAdmin: boolean;
  onWatchlistSuccess: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ isAdmin, onWatchlistSuccess }) => {
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SearchResultItem | null>(null);
  const [contactGateOpen, setContactGateOpen] = useState(false);

  const debouncedSearch = useMemo(
    () => debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (data.results) {
          setSearchResults(data.results);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const handleInputChange = (event: React.SyntheticEvent, newInputValue: string) => {
    setInputValue(newInputValue);
    debouncedSearch(newInputValue);
  };

  const handleAddToWatchlist = (item: SearchResultItem) => {
    setSelectedItem(item);
    
    // If not admin, show contact gate first
    if (!isAdmin) {
      setContactGateOpen(true);
    } else {
      setFormOpen(true);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedItem(null);
  };

  const handleFormSuccess = () => {
    onWatchlistSuccess();
  };

  const handleContactGateClose = () => {
    setContactGateOpen(false);
    setSelectedItem(null);
  };

  const handleContactGateProceed = () => {
    setContactGateOpen(false);
    setFormOpen(true);
  };

  const formatReleaseYear = (releaseDate: string) => {
    return releaseDate ? new Date(releaseDate).getFullYear() : '';
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
      <Autocomplete
        freeSolo
        options={searchResults}
        loading={loading}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        getOptionLabel={(option) => typeof option === 'string' ? option : option.title}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search for movies and TV shows..."
            variant="outlined"
            fullWidth
            InputProps={{
              ...params.InputProps,
              startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        )}

        renderOption={(props, option) => (
          <Paper elevation={0} sx={{ mb: 1 }}>
            <Box
              component="li"
              {...props}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <Avatar
                src={option.posterUrl || undefined}
                alt={option.title}
                variant="rounded"
                sx={{ width: 60, height: 90 }}
              >
                {option.mediaType === 'movie' ? <Movie /> : <Tv />}
              </Avatar>
              
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="subtitle1" noWrap>
                    {option.title}
                  </Typography>
                  <Chip
                    label={option.mediaType === 'movie' ? 'Movie' : 'TV Show'}
                    size="small"
                    color={option.mediaType === 'movie' ? 'primary' : 'secondary'}
                    variant="outlined"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {formatReleaseYear(option.releaseDate) && (
                    <Typography variant="body2" color="text.secondary">
                      {formatReleaseYear(option.releaseDate)}
                    </Typography>
                  )}
                  {option.rating > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      ⭐ {option.rating}
                    </Typography>
                  )}
                </Box>
                
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {option.overview || 'No description available.'}
                </Typography>
              </Box>
              
              <IconButton
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToWatchlist(option);
                }}
                sx={{ alignSelf: 'flex-start' }}
              >
                <Add />
              </IconButton>
            </Box>
          </Paper>
        )}
        PaperComponent={({ children }) => (
          <Paper elevation={8} sx={{ mt: 1, borderRadius: 2 }}>
            {children}
          </Paper>
        )}
        ListboxProps={{
          sx: {
            maxHeight: 400,
            '& .MuiAutocomplete-option': {
              padding: 0,
            },
          },
        }}
        noOptionsText={
          inputValue.trim() ? (
            <Typography sx={{ p: 2 }}>No movies or shows found</Typography>
          ) : (
            <Typography sx={{ p: 2 }}>Start typing to search...</Typography>
          )
        }
      />
      
      <ContactGateModal
        open={contactGateOpen}
        onClose={handleContactGateClose}
        onProceed={handleContactGateProceed}
        movieTitle={selectedItem?.title || ''}
      />
      
      <AddToWatchlistForm
        open={formOpen}
        onClose={handleFormClose}
        item={selectedItem}
        isAdmin={isAdmin}
        onSuccess={handleFormSuccess}
      />
    </Box>
  );
};

export default SearchBar;
