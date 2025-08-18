'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
   useReactTable,
   getCoreRowModel,
   getSortedRowModel,
   getFilteredRowModel,
   getPaginationRowModel,
   flexRender,
   createColumnHelper,
   SortingState,
   ColumnFiltersState,
} from '@tanstack/react-table';
import {
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableHead,
   TableRow,
   Paper,
   IconButton,
   Chip,
   Rating,
   Checkbox,
   Typography,
   Box,
   TablePagination,
   FormControl,
   InputLabel,
   Select,
   MenuItem,
   Tooltip,
   Tabs,
   Tab,
   TextField,
   InputAdornment,
} from '@mui/material';
import {
   Delete,
   Edit,
   Movie,
   Tv,
   Star,
   StarBorder,
   Search,
} from '@mui/icons-material';
import { WatchlistItem } from '../types/watchlist';
import toast from 'react-hot-toast';
import MovieDetailsModal from './MovieDetailsModal';
import { createFilterHandlers, getFilterValues, shouldShowFavoriteFilter } from '../lib/watchlistFilters';
import { useFetchWatchlist, ProcessedWatchlistItem } from '../lib/watchlistApi';
import { useWatchlistActions } from '../lib/watchlistActions';
import EditWatchlistItemModal from './EditWatchlistItemModal';

interface WatchlistTableProps {
   onRefresh?: () => void;
   isAdmin?: boolean;
}

const columnHelper = createColumnHelper<ProcessedWatchlistItem>();

const WatchlistTable: React.FC<WatchlistTableProps> = ({ onRefresh, isAdmin = false }) => {
   const [data, setData] = useState<ProcessedWatchlistItem[]>([]);
   const [loading, setLoading] = useState(true);
   const [sorting, setSorting] = useState<SortingState>([]);
   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
   const [pagination, setPagination] = useState({
      pageIndex: 0,
      pageSize: 10,
   });
   const [activeTab, setActiveTab] = useState(2); // 0: Watched, 1: Not Watched, 2: All
   const [columnVisibility, setColumnVisibility] = useState({});
   const [searchQuery, setSearchQuery] = useState('');
   const [modalOpen, setModalOpen] = useState(false);
   const [selectedItem, setSelectedItem] = useState<{
      tmdbId: number;
      mediaType: 'movie' | 'tv';
      title: string;
   } | null>(null);
   const [editModalOpen, setEditModalOpen] = useState(false);
   const [editingItem, setEditingItem] = useState<ProcessedWatchlistItem | null>(null);

   // Use fetch watchlist helper
   const { fetchWatchlistData } = useFetchWatchlist(setData, setLoading);

   useEffect(() => {
      fetchWatchlistData();
   }, []);

   // Create filter handlers using the helper
   const filterHandlers = createFilterHandlers(
      setSearchQuery,
      setActiveTab,
      setColumnFilters,
      setColumnVisibility,
      setPagination
   );

   const { handleSearchChange, handleTabChange, handleMediaTypeChange, handleFavoriteChange } = filterHandlers;

   // Create action handlers using the custom hook
   const { handleDelete, handleToggleWatched, handleToggleFavorite, handleOpenDetails } = useWatchlistActions(
      data,
      setData,
      setSelectedItem,
      setModalOpen
   );



   // Handle closing movie details modal
   const handleCloseDetails = useCallback(() => {
      setModalOpen(false);
      setSelectedItem(null);
   }, []);

   // Handle opening edit modal
   const handleOpenEdit = useCallback((item: ProcessedWatchlistItem) => {
      setEditingItem(item);
      setEditModalOpen(true);
   }, []);

   // Handle closing edit modal
   const handleCloseEdit = useCallback(() => {
      setEditModalOpen(false);
      setEditingItem(null);
   }, []);

   // Handle edit success
   const handleEditSuccess = useCallback(() => {
      fetchWatchlistData();
   }, [fetchWatchlistData]);

   // Define all columns
   const allColumns = useMemo(() => [
      columnHelper.accessor('title', {
         id: 'title',
         header: 'Title',
         cell: info => (
            <Typography
               variant="body2"
               sx={{
                  color: 'primary.main',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  '&:hover': {
                     color: 'primary.dark',
                  }
               }}
               onClick={() => handleOpenDetails(
                  info.row.original.tmdbId,
                  info.row.original.mediaType,
                  info.getValue() || ''
               )}
            >
               {info.getValue()}
            </Typography>
         ),
         filterFn: 'includesString',
         size: 200,
      }),
      columnHelper.accessor('mediaType', {
         id: 'mediaType',
         header: 'Type',
         cell: info => {
            const type = info.getValue();
            return (
               <Chip
                  icon={type === 'movie' ? <Movie /> : <Tv />}
                  label={type === 'movie' ? 'Movie' : 'TV Show'}
                  color={type === 'movie' ? 'primary' : 'secondary'}
                  size="small"
                  variant="outlined"
               />
            );
         },
         filterFn: 'equals',
         size: 100,
      }),
      columnHelper.accessor('watched', {
         id: 'watched',
         header: 'Watched',
         cell: info => {
            return (
               isAdmin ? (
                  <Checkbox
                     checked={info.getValue()}
                     color="primary"
                     size="small"
                     onChange={() => handleToggleWatched(info.row.original.id, info.getValue())}
                     sx={{ cursor: 'pointer' }}
                  />
               ) : (
                  info.getValue() ? 'YES' : 'NO'
               )
            )
         },
         filterFn: 'equals',
         size: 70,
      }),
      columnHelper.accessor('favorite', {
         id: 'favorite',
         header: 'Favorite',
         cell: info => (
            <IconButton
               size="small"
               disabled={!isAdmin}
               onClick={isAdmin ? () => handleToggleFavorite(info.row.original.id, info.getValue()) : undefined}
               sx={{
                  cursor: isAdmin ? 'pointer' : 'default',
                  '&:hover': isAdmin ? { backgroundColor: 'action.hover' } : {}
               }}
            >
               {info.getValue() ? (
                  <Star color="warning" />
               ) : (
                  <StarBorder color={isAdmin ? 'action' : 'disabled'} />
               )}
            </IconButton>
         ),
         filterFn: 'equals',
         size: 80,
      }),
      columnHelper.accessor('dateWatched', {
         id: 'dateWatched',
         header: 'Date Watched',
         cell: info => {
            const date = info.getValue();
            return (
               <Typography variant="body2">
                  {date ? date.toLocaleDateString() : '-'}
               </Typography>
            );
         },
         size: 110,
      }),
      columnHelper.accessor('dateAdded', {
         id: 'dateAdded',
         header: 'Date Added',
         cell: info => (
            <Typography variant="body2">
               {info.getValue().toLocaleDateString()}
            </Typography>
         ),
         size: 110,
      }),
      columnHelper.accessor('userRating', {
         id: 'userRating',
         header: 'Rating',
         cell: info => {
            const rating = info.getValue();
            return rating ? rating : '-'
         },
         size: 80,
      }),
      columnHelper.accessor('priority', {
         id: 'priority',
         header: 'Priority',
         cell: info => {
            const priority = info.getValue();
            return (
               <Typography variant="body2">
                  {priority === 0 ? 'Low' : priority === 1 ? 'Medium' : priority === 2 ? 'High' : '-'}
               </Typography>
            );
         },
         size: 70,
      }),

      columnHelper.accessor('recommendedBy', {
         id: 'recommendedBy',
         header: 'Recommended By',
         cell: info => (
            <Typography variant="body2">
               {info.getValue() || '-'}
            </Typography>
         ),
         size: 140,
      }),
      // Only show actions column for admin users
      ...(isAdmin ? [
         columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: info => (
               <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Edit">
                     <IconButton
                        size="small"
                        color="warning"
                        onClick={() => handleOpenEdit(info.row.original)}
                     >
                        <Edit />
                     </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                     <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(info.row.original.id)}
                     >
                        <Delete />
                     </IconButton>
                  </Tooltip>
               </Box>
            ),
            size: 120,
         })
      ] : []),
   ], [handleDelete, handleToggleWatched, handleToggleFavorite, handleOpenDetails, handleOpenEdit, isAdmin]);

   // Use all columns (visibility is handled by columnVisibility state)
   const columns = useMemo(() => {
      return allColumns;
   }, [allColumns]);

   const table = useReactTable({
      data,
      columns,
      state: {
         sorting,
         columnFilters,
         pagination,
         columnVisibility,
      },
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      onPaginationChange: setPagination,
      onColumnVisibilityChange: setColumnVisibility,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
   });

   // Get filtered data count for display
   const filteredCount = table.getFilteredRowModel().rows.length;

   if (loading) {
      return (
         <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography>Loading watchlist...</Typography>
         </Box>
      );
   }

   return (
      <Box sx={{ width: '100%' }}>


         {/* Status Filter Tabs */}
         <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'center' }}>
            <Tabs
               value={activeTab}
               onChange={handleTabChange}
               centered
               sx={{
                  '& .MuiTab-root': {
                     textTransform: 'none',
                     fontWeight: 600,
                     fontSize: '1rem',
                     minWidth: 120,
                  }
               }}
            >
               <Tab label="Watched" />
               <Tab label="Not Watched" />
               <Tab label="All" />
            </Tabs>
         </Box>

         <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
               <TextField
                  size="small"
                  placeholder="Search by title..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  InputProps={{
                     startAdornment: (
                        <InputAdornment position="start">
                           <Search sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                     ),
                  }}
                  sx={{ minWidth: 200 }}
               />
               <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Filter Type</InputLabel>
                  <Select
                     value={getFilterValues(columnFilters).mediaType || ''}
                     label="Filter Type"
                     onChange={(e) => handleMediaTypeChange(e.target.value as string)}
                  >
                     <MenuItem value="">All</MenuItem>
                     <MenuItem value="movie">Movies</MenuItem>
                     <MenuItem value="tv">TV Shows</MenuItem>
                  </Select>
               </FormControl>
               {shouldShowFavoriteFilter(activeTab) && (
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                     <InputLabel>Favorites</InputLabel>
                     <Select
                        value={getFilterValues(columnFilters).favorite === true ? 'true' : getFilterValues(columnFilters).favorite === false ? 'false' : ''}
                        label="Favorites"
                        onChange={(e) => handleFavoriteChange(e.target.value as string)}
                     >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="true">Favorites Only</MenuItem>
                        <MenuItem value="false">Non-Favorites</MenuItem>
                     </Select>
                  </FormControl>
               )}
            </Box>
         </Box>

         {/* Table */}
         <TableContainer component={Paper} sx={{ mb: 2, overflow: 'auto' }}>
            <Table size="small" stickyHeader sx={{ '& .MuiTableCell-root': { px: 1.5, py: 1 } }}>
               <TableHead>
                  {table.getHeaderGroups().map(headerGroup => (
                     <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                           <TableCell
                              key={header.id}
                              sx={{
                                 cursor: header.column.getCanSort() ? 'pointer' : 'default',
                                 userSelect: 'none',
                                 fontWeight: 'bold',
                                 width: header.getSize(),
                              }}
                              onClick={header.column.getToggleSortingHandler()}
                           >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                 {flexRender(header.column.columnDef.header, header.getContext())}
                                 {header.column.getCanSort() && (
                                    <Box component="span" sx={{ opacity: 0.6 }}>
                                       {{
                                          asc: ' 🔼',
                                          desc: ' 🔽',
                                       }[header.column.getIsSorted() as string] ?? ' ↕️'}
                                    </Box>
                                 )}
                              </Box>
                           </TableCell>
                        ))}
                     </TableRow>
                  ))}
               </TableHead>
               <TableBody>
                  {table.getRowModel().rows.length === 0 ? (
                     <TableRow>
                        <TableCell colSpan={columns.length} align="center">
                           <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                              <img
                                 src="/where-is-it.gif"
                                 alt="Where is it?"
                                 style={{
                                    maxWidth: '200px',
                                    maxHeight: '200px',
                                    borderRadius: '8px'
                                 }}
                              />
                              <Typography color="text.secondary" variant="h5">
                                 I know what you&apos;re thinking...
                              </Typography>
                              <Typography color="text.secondary" variant="h5">
                                 Where is it? Has this guy really never watched <strong>[insert movie or tv show here]</strong>?
                              </Typography>
                              <Typography color="text.secondary" variant="h5">
                                 You might be right!
                              </Typography>
                              <Typography color="text.secondary" variant="h5">
                                 But also, I might have not added in a database yet or sometimes it takes some time for Supabase to wake up. 🤷‍♂️
                              </Typography>
                           </Box>
                        </TableCell>
                     </TableRow>
                  ) : (
                     table.getRowModel().rows.map(row => (
                        <TableRow
                           key={row.id}
                           hover
                           sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                           {row.getVisibleCells().map(cell => (
                              <TableCell key={cell.id}>
                                 {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                           ))}
                        </TableRow>
                     ))
                  )}
               </TableBody>
            </Table>
         </TableContainer>

         {/* Pagination */}
         <TablePagination
            component="div"
            count={filteredCount}
            page={pagination.pageIndex}
            onPageChange={(_, newPage) => setPagination(prev => ({ ...prev, pageIndex: newPage }))}
            rowsPerPage={pagination.pageSize}
            onRowsPerPageChange={(e) => setPagination(prev => ({ ...prev, pageSize: parseInt(e.target.value, 10), pageIndex: 0 }))}
            rowsPerPageOptions={[5, 10, 25, 50]}
         />

         <MovieDetailsModal
            open={modalOpen}
            onClose={handleCloseDetails}
            tmdbId={selectedItem?.tmdbId || null}
            mediaType={selectedItem?.mediaType || null}
            title={selectedItem?.title || ''}
         />

         <EditWatchlistItemModal
            open={editModalOpen}
            onClose={handleCloseEdit}
            item={editingItem}
            onSuccess={handleEditSuccess}
         />
      </Box>
   );
};

export default WatchlistTable;
