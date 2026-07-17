import React, { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  Stack,
  Button,
  Tabs,
  Tab
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';
import { ConfirmDialog } from 'src/components/custom-dialog';

export default function IncotermSheetGrid() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteId, setDeleteId] = useState(null);

  // MOCK DATA (Empty for now)
  const reportData = useMemo(() => [], []);

  // Filter Data
  const filteredData = useMemo(() => {
    let filtered = reportData;
    if (filterStatus === 'Active') filtered = filtered.filter((r) => r.IsActive);
    if (filterStatus === 'Inactive') filtered = filtered.filter((r) => !r.IsActive);
    if (searchText) {
      filtered = filtered.filter((r) =>
        (r.Name || '').toLowerCase().includes(searchText.toLowerCase())
      );
    }
    return filtered;
  }, [reportData, searchText, filterStatus]);

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleEdit = (id) => {
    navigate(paths.dashboard.Powertool.Incoterm.edit(id));
  };

  const confirmDelete = () => {
    setDeleteId(null);
    // API Call goes here
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Search Bar */}
            <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 0,
          borderRadius: '12px 12px 0 0',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <TextField
          fullWidth
          placeholder="Search Incoterms..."
          value={searchText}
          onChange={(e) => { setSearchText(e.target.value); setPage(0); }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              height: '48px',
              transition: 'box-shadow 0.2s ease',
              '&:hover fieldset': { borderColor: 'primary.main' },
              '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: '2px' },
              '&.Mui-focused': {
                boxShadow: (th) => `0 0 0 3px ${th.palette.primary.main}14`,
              },
            },
            '& .MuiInputBase-input': {
              fontSize: '0.95rem',
              padding: '8px 14px',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" width={22} sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Tabs */}
      <Paper elevation={0} sx={{ mb: 2, borderRadius: '0 0 12px 12px', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Tabs
          value={filterStatus}
          onChange={(e, val) => { setFilterStatus(val); setPage(0); }}
          sx={{
            px: 2,
            '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
            '& .MuiTab-root': { minHeight: 48, fontWeight: 600, fontSize: '0.875rem', textTransform: 'none' },
          }}
        >
          <Tab value="All" label={<Stack direction="row" spacing={1} alignItems="center"><Iconify icon="mdi:view-list-outline" /><span>All ({reportData.length})</span></Stack>} />
          <Tab value="Active" label={<Stack direction="row" spacing={1} alignItems="center"><Iconify icon="mdi:check-circle-outline" /><span>Active ({reportData.filter(r => r.IsActive).length})</span></Stack>} />
          <Tab value="Inactive" label={<Stack direction="row" spacing={1} alignItems="center"><Iconify icon="mdi:close-circle-outline" /><span>Inactive ({reportData.filter(r => !r.IsActive).length})</span></Stack>} />
        </Tabs>
      </Paper>

      {/* Table */}
      <Paper sx={{ width: '100%', borderRadius: 3, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: 'background.neutral', fontWeight: 600, color: 'text.secondary' }}>ID</TableCell>
                <TableCell sx={{ bgcolor: 'background.neutral', fontWeight: 600, color: 'text.secondary' }}>NAME</TableCell>
                <TableCell sx={{ bgcolor: 'background.neutral', fontWeight: 600, color: 'text.secondary' }}>STATUS</TableCell>
                <TableCell align="center" sx={{ bgcolor: 'background.neutral', fontWeight: 600, color: 'text.secondary' }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <TableRow hover key={row.IncotermId || index}>
                    <TableCell>{row.IncotermId}</TableCell>
                    <TableCell>{row.Name}</TableCell>
                    <TableCell>
                      <Chip label={row.IsActive ? 'Active' : 'Inactive'} color={row.IsActive ? 'success' : 'error'} size="small" variant="soft" />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEdit(row.IncotermId)} sx={{ color: 'primary.main' }}>
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => setDeleteId(row.IncotermId)} sx={{ color: 'error.main' }}>
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">No Incoterms found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </Paper>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Incoterm"
        content="Are you sure you want to delete this item?"
        action={<Button variant="contained" color="error" onClick={confirmDelete}>Delete</Button>}
      />
    </Box>
  );
}