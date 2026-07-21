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

export default function BuyingDepartmentSheetGrid() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteId, setDeleteId] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await Get('Department/GetAll');
      if (res.status === 200) {
        setDepartments(res?.data?.Data || res?.data || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      enqueueSnackbar('Error fetching departments', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Filter Data
  const filteredData = useMemo(() => {
    let filtered = departments;
    if (filterStatus === 'Active') filtered = filtered.filter((r) => r.IsActive);
    if (filterStatus === 'Inactive') filtered = filtered.filter((r) => !r.IsActive);
    if (searchText) {
      filtered = filtered.filter((r) =>
        (r.DepartmentName || r.Name || '').toLowerCase().includes(searchText.toLowerCase())
      );
    }
    return filtered;
  }, [departments, searchText, filterStatus]);

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleEdit = (id) => {
    navigate(paths.dashboard.Powertool.BuyingDepartment.edit(id));
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await Delete(`Department/Delete?id=${deleteId}`);
      if (res.status === 200) {
        enqueueSnackbar('Buying Department deleted successfully!');
        fetchDepartments();
      }
    } catch (error) {
      console.error('Error deleting department:', error);
      enqueueSnackbar(error?.response?.data?.Message || 'Error deleting department', { variant: 'error' });
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
          placeholder="Search Buying Departments..."
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
          <Tab value="All" label={<Stack direction="row" spacing={1} alignItems="center"><Iconify icon="mdi:view-list-outline" /><span>All ({departments.length})</span></Stack>} />
          <Tab value="Active" label={<Stack direction="row" spacing={1} alignItems="center"><Iconify icon="mdi:check-circle-outline" /><span>Active ({departments.filter(r => r.IsActive).length})</span></Stack>} />
          <Tab value="Inactive" label={<Stack direction="row" spacing={1} alignItems="center"><Iconify icon="mdi:close-circle-outline" /><span>Inactive ({departments.filter(r => !r.IsActive).length})</span></Stack>} />
        </Tabs>
      </Paper>

      {/* Table */}
      <Paper sx={{ width: '100%', borderRadius: 3, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <TableContainer sx={{ maxHeight: 380, overflowY: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: 'background.neutral', fontWeight: 600, color: 'text.secondary' }}>NAME</TableCell>
                <TableCell sx={{ bgcolor: 'background.neutral', fontWeight: 600, color: 'text.secondary' }}>STATUS</TableCell>
                <TableCell align="center" sx={{ bgcolor: 'background.neutral', fontWeight: 600, color: 'text.secondary' }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 5 }}>
                    <LinearProgress sx={{ maxWidth: 300, mx: 'auto', mb: 1, borderRadius: 1 }} />
                    <Box sx={{ color: 'text.disabled', fontSize: '0.875rem' }}>Loading departments...</Box>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <TableRow hover key={row.DepartmentId || row.BuyingDepartmentId || index}>
                    <TableCell sx={{ fontWeight: 600 }}>{row.DepartmentName || row.Name}</TableCell>
                    <TableCell>
                      <Chip label={row.IsActive ? 'Active' : 'Inactive'} color={row.IsActive ? 'success' : 'error'} size="small" variant="soft" />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEdit(row.DepartmentId || row.BuyingDepartmentId)} sx={{ color: 'primary.main' }}>
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => setDeleteId(row.DepartmentId || row.BuyingDepartmentId)} sx={{ color: 'error.main' }}>
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">No Buying Departments found.</Typography>
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
        title="Delete BuyingDepartment"
        content="Are you sure you want to delete this item?"
        action={<Button variant="contained" color="error" onClick={confirmDelete}>Delete</Button>}
      />
    </Box>
  );
}