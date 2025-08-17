import { ColumnFiltersState } from '@tanstack/react-table';

export interface FilterState {
  searchQuery: string;
  activeTab: number;
  columnFilters: ColumnFiltersState;
  columnVisibility: Record<string, boolean>;
}

export const shouldShowFavoriteFilter = (activeTab: number): boolean => {
  // Hide favorite filter on "Not Watched" tab (tab 1)
  return activeTab !== 1;
};

export interface FilterHandlers {
  handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  handleMediaTypeChange: (value: string) => void;
  handleFavoriteChange: (value: string) => void;
}

export const createFilterHandlers = (
  setSearchQuery: (query: string) => void,
  setActiveTab: (tab: number) => void,
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>,
  setColumnVisibility: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
  setPagination: React.Dispatch<React.SetStateAction<{ pageIndex: number; pageSize: number }>>
): FilterHandlers => {
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
    
    // Update column filters for title search
    setColumnFilters(prev => {
      const filtered = prev.filter(f => f.id !== 'title');
      if (value.trim()) {
        return [...filtered, { id: 'title', value }];
      }
      return filtered;
    });
    
    // Reset pagination when searching
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    
    // Update column filters based on tab selection (preserve other filters like title search)
    setColumnFilters(prev => {
      let filtered = prev.filter(f => f.id !== 'watched');
      
      // Clear favorite filter when switching to "Not Watched" tab
      if (newValue === 1) {
        filtered = filtered.filter(f => f.id !== 'favorite');
      }
      
      if (newValue === 0) {
        // Watched
        return [...filtered, { id: 'watched', value: true }];
      } else if (newValue === 1) {
        // Not Watched
        return [...filtered, { id: 'watched', value: false }];
      } else {
        // All - no filter
        return filtered;
      }
    });
    
    // Update column visibility based on tab selection
    setColumnVisibility((prev) => {
      if (newValue === 0) {
        // Tab 0: Watched - hide 'watched' and 'priority' columns
        return { ...prev, watched: false, priority: false, dateWatched: true, favorite: true };
      } else if (newValue === 1) {
        // Tab 1: Not Watched - hide 'watched', 'dateWatched', and 'favorite' columns
        return { ...prev, watched: false, dateWatched: false, favorite: false, priority: true };
      } else {
        // Tab 2: All - show all columns
        return { ...prev, watched: true, priority: true, dateWatched: true, favorite: true };
      }
    });
    
    // Reset pagination when changing tabs
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  const handleMediaTypeChange = (value: string) => {
    setColumnFilters(prev => 
      value 
        ? [...prev.filter(f => f.id !== 'mediaType'), { id: 'mediaType', value }]
        : prev.filter(f => f.id !== 'mediaType')
    );
    
    // Reset pagination when filtering
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  const handleFavoriteChange = (value: string) => {
    setColumnFilters(prev => {
      const filtered = prev.filter(f => f.id !== 'favorite');
      if (value === 'true') {
        return [...filtered, { id: 'favorite', value: true }];
      } else if (value === 'false') {
        return [...filtered, { id: 'favorite', value: false }];
      } else {
        // All - no filter
        return filtered;
      }
    });
    
    // Reset pagination when filtering
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  return {
    handleSearchChange,
    handleTabChange,
    handleMediaTypeChange,
    handleFavoriteChange,
  };
};

// Helper function to get current filter values from columnFilters
export const getFilterValues = (columnFilters: ColumnFiltersState) => {
  return {
    mediaType: columnFilters.find(f => f.id === 'mediaType')?.value || '',
    favorite: columnFilters.find(f => f.id === 'favorite')?.value,
  };
};
