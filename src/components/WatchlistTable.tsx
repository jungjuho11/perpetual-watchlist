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
} from '@mui/material';
import {
  Delete,
  Edit,
  Movie,
  Tv,
  Star,
  StarBorder,
} from '@mui/icons-material';
import { WatchlistItem } from '../types/watchlist';
import toast from 'react-hot-toast';

interface WatchlistTableProps {
  onRefresh?: () => void;
  isAdmin?: boolean;
}

const columnHelper = createColumnHelper<WatchlistItem>();

const WatchlistTable: React.FC<WatchlistTableProps> = ({ onRefresh, isAdmin = false }) => {
  const [data, setData] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [activeTab, setActiveTab] = useState(2); // 0: Watched, 1: Not Watched, 2: All

  // Fetch watchlist data
  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/watchlist');
      const result = await response.json();
      
      if (result.items) {
        // Convert date strings back to Date objects
        const processedItems = result.items.map((item: WatchlistItem & { dateAdded: string; dateWatched: string | null }) => ({
          ...item,
          dateAdded: new Date(item.dateAdded),
          dateWatched: item.dateWatched ? new Date(item.dateWatched) : null,
        }));
        setData(processedItems);
        console.log(processedItems);
      }
    } catch (error) {
      console.error('Failed to fetch watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    
    // Update column filters based on tab selection
    setColumnFilters(prev => {
      const filtered = prev.filter(f => f.id !== 'watched');
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
    
    // Reset pagination when changing tabs
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  // Handle delete item
  const handleDelete = useCallback(async (id: number) => {
    try {
      const itemToDelete = data.find(item => item.id === id);
      const response = await fetch(`/api/watchlist/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setData(prev => prev.filter(item => item.id !== id));
        toast.success(`Removed "${itemToDelete?.title}" from watchlist`);
        if (onRefresh) onRefresh();
      } else {
        toast.error('Failed to delete item from watchlist');
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast.error('Failed to delete item from watchlist');
    }
  }, [data, onRefresh]);

  // Define columns
  const columns = useMemo(
    () => [
      // dont need these columns. commenting it out for now. May want to implemtn hidden columns feature later.
      // columnHelper.accessor('id', {
      //   header: 'ID',
      //   cell: info => (
      //     <Typography variant="body2" color="text.secondary">
      //       {info.getValue()}
      //     </Typography>
      //   ),
      //   size: 60,
      //   enableHiding: true
      // }),
      // columnHelper.accessor('tmdbId', {
      //   header: 'TMDB ID',
      //   cell: info => (
      //     <Typography variant="body2" color="text.secondary">
      //       {info.getValue()}
      //     </Typography>
      //   ),
      //   size: 80,
      // }),
      columnHelper.accessor('title', {
        header: 'Title',
        cell: info => (
          <Typography variant="body2" color="text.secondary">
            {info.getValue()}
          </Typography>
        ),
        size: 200,
      }),
      columnHelper.accessor('mediaType', {
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
        header: 'Watched',
        cell: info => {
         return (
            isAdmin ?  <Checkbox
            checked={info.getValue()}
            color="primary"
            size="small"
            readOnly
          /> : info.getValue() ? 'YES' : 'NO'
         )
        },
      //   cell: info => (
      //     <Checkbox
      //       checked={info.getValue()}
      //       color="primary"
      //       size="small"
      //       readOnly
      //     />
      //   ),
        filterFn: 'equals',
        size: 70,
      }),
      columnHelper.accessor('dateWatched', {
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
        header: 'Date Added',
        cell: info => (
          <Typography variant="body2">
            {info.getValue().toLocaleDateString()}
          </Typography>
        ),
        size: 110,
      }),
      columnHelper.accessor('userRating', {
        header: 'Rating',
        cell: info => {
          const rating = info.getValue();
          return rating ? rating : '-'
        },
        size: 80,
      }),
      columnHelper.accessor('priority', {
        header: 'Priority',
        cell: info => {
          const priority = info.getValue();
          return (
            <Typography variant="body2">
              {priority || '-'}
            </Typography>
          );
        },
        size: 70,
      }),
      columnHelper.accessor('favorite', {
        header: 'Favorite',
        cell: info => (
          <IconButton size="small" disabled>
            {info.getValue() ? (
              <Star color="warning" />
            ) : (
              <StarBorder color="disabled" />
            )}
          </IconButton>
        ),
        filterFn: 'equals',
        size: 80,
      }),
      columnHelper.accessor('recommendedBy', {
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
                <IconButton size="small" color="primary">
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
          size: 100,
        })
      ] : []),
    ],
    [handleDelete, isAdmin]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
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
      {/* Header */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Filter Type</InputLabel>
            <Select
              value={columnFilters.find(f => f.id === 'mediaType')?.value || ''}
              label="Filter Type"
              onChange={(e) => {
                const value = e.target.value;
                setColumnFilters(prev => 
                  value 
                    ? [...prev.filter(f => f.id !== 'mediaType'), { id: 'mediaType', value }]
                    : prev.filter(f => f.id !== 'mediaType')
                );
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="movie">Movies</MenuItem>
              <MenuItem value="tv">TV Shows</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Status Filter Tabs */}
      <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
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
                  <Typography color="text.secondary" sx={{ py: 4 }}>
                    No items in your watchlist yet. Add some movies or TV shows above!
                  </Typography>
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
    </Box>
  );
};

export default WatchlistTable;
