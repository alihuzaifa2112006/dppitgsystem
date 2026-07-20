import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  Tab,
  LinearProgress,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { Get, Delete } from 'src/api/apibasemethods';
import { useSnackbar } from 'src/components/snackbar';

export default function OfficeSheetGrid() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteId, setDeleteId] = useState(null);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOffices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await Get('Office/GetAll');
      if (res.status === 200) {
        setOffices(res?.data?.Data || res?.data || []);
      }
    } catch (error) {
      console.error('Error fetching offices:', error);
      enqueueSnackbar('Error fetching offices', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchOffices();
  }, [fetchOffices]);

  // Filter Data
  const filteredData = useMemo(() => {
    let filtered = offices;
    if (filterStatus === 'Active') filtered = filtered.filter((r) => r.IsActive);
    if (filterStatus === 'Inactive') filtered = filtered.filter((r) => !r.IsActive);
    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter((r) =>
        (r.OfficeName || r.Name || '').toLowerCase().includes(search) ||
        (r.BankName || '').toLowerCase().includes(search) ||
        (r.Phone || '').toLowerCase().includes(search)
      );
    }
    return filtered;
  }, [offices, searchText, filterStatus]);

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleEdit = (id) => {
    navigate(paths.dashboard.Powertool.Office.edit(id));
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await Delete(`Office/Delete?id=${deleteId}`);
      if (res.status === 200) {
        enqueueSnackbar('Office deleted successfully!');
        fetchOffices();
      }
    } catch (error) {
      console.error('Error deleting office:', error);
      enqueueSnackbar(error?.response?.data?.Message || 'Error deleting office', { variant: 'error' });
    } finally {
      setDeleteId(null);
    }
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
          placeholder="Search Offices..."
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
          <Tab value="All" label={<Stack direction="row" spacing={1} alignItems="center"><Iconify icon="mdi:view-list-outline" /><span>All ({offices.length})</span></Stack>} />
          <Tab value="Active" label={<Stack direction="row" spacing={1} alignItems="center"><Iconify icon="mdi:check-circle-outline" /><span>Active ({offices.filter(r => r.IsActive).length})</span></Stack>} />
          <Tab value="Inactive" label={<Stack direction="row" spacing={1} alignItems="center"><Iconify icon="mdi:close-circle-outline" /><span>Inactive ({offices.filter(r => !r.IsActive).length})</span></Stack>} />
        </Tabs>
      </Paper>

      {/* Table */}
      <Paper sx={{ width: '100%', borderRadius: 3, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <TableContainer sx={{ maxHeight: 380, overflowY: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: 'background.neutral', fontWeight: 600, color: 'text.secondary' }}>Office Name</TableCell>
                <TableCell sx={{ bgcolor: 'background.neutral', fontWeight: 600, color: 'text.secondary' }}>Code</TableCell>
                <TableCell sx={{ bgcolor: 'background.neutral', fontWeight: 600, color: 'text.secondary' }}>Address</TableCell>
                <TableCell sx={{ bgcolor: 'background.neutral', fontWeight: 600, color: 'text.secondary' }}>City</TableCell>
                <TableCell sx={{ bgcolor: 'background.neutral', fontWeight: 600, color: 'text.secondary' }}>Country</TableCell>
                <TableCell sx={{ bgcolor: 'background.neutral', fontWeight: 600, color: 'text.secondary' }}>Contact</TableCell>
                <TableCell sx={{ bgcolor: 'background.neutral', fontWeight: 600, color: 'text.secondary' }}>Bank Account</TableCell>
                <TableCell sx={{ bgcolor: 'background.neutral', fontWeight: 600, color: 'text.secondary' }}>Status</TableCell>
                <TableCell align="center" sx={{ bgcolor: 'background.neutral', fontWeight: 600, color: 'text.secondary' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                    <LinearProgress sx={{ maxWidth: 300, mx: 'auto', mb: 1, borderRadius: 1 }} />
                    <Box sx={{ color: 'text.disabled', fontSize: '0.875rem' }}>Loading offices...</Box>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <TableRow hover key={row.OfficeId || row.Id || index}>
                    <TableCell sx={{ fontWeight: 600 }}>{row.OfficeName || '-'}</TableCell>
                    <TableCell>{row.OfficeCode || '-'}</TableCell>
                    <TableCell>
                      <Box>
                        <Box sx={{ fontSize: '0.875rem' }}>{row.AddressLine1 || '-'}</Box>
                        {row.AddressLine2 && (
                          <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{row.AddressLine2}</Box>
                        )}
                        {row.PostalCode && (
                          <Box sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>Zip: {row.PostalCode}</Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{row.CityName || '-'}</TableCell>
                    <TableCell>{row.CountryName || '-'}</TableCell>
                    <TableCell>
                      <Box>
                        <Box sx={{ fontSize: '0.875rem' }}>{row.Phone || '-'}</Box>
                        {row.Email && (
                          <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{row.Email}</Box>
                        )}
                        {row.Fax && row.Fax !== 'f' && (
                          <Box sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>Fax: {row.Fax}</Box>
                        )}
                        {row.TaxIdVatNo && (
                          <Box sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>Tax ID: {row.TaxIdVatNo}</Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Box sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{row.BankName || '-'}</Box>
                        {row.BankAccountTitle && (
                          <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{row.BankAccountTitle}</Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={row.IsActive ? 'Active' : 'Inactive'} color={row.IsActive ? 'success' : 'error'} size="small" variant="soft" />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEdit(row.OfficeId || row.Id)} sx={{ color: 'primary.main' }}>
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => setDeleteId(row.OfficeId || row.Id)} sx={{ color: 'error.main' }}>
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">No Offices found.</Typography>
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
        title="Delete Office"
        content="Are you sure you want to delete this item?"
        action={<Button variant="contained" color="error" onClick={confirmDelete}>Delete</Button>}
      />
    </Box>
  );
}