import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  IconButton,
  LinearProgress,
  Button,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { Get, Delete } from 'src/api/apibasemethods';
import { useSnackbar } from 'src/components/snackbar';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { ConfirmDialog } from 'src/components/custom-dialog';

export default function BankSheetGrid() {
  const [searchText, setSearchText] = useState('');
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const fetchBanks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await Get('Bank/GetAll');
      if (res.status === 200) {
        setBanks(res?.data?.Data || res?.data || []);
      }
    } catch (error) {
      console.error('Error fetching banks:', error);
      enqueueSnackbar('Error fetching banks', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await Delete(`Bank/Delete?id=${deleteId}`);
      if (res.status === 200) {
        enqueueSnackbar('Bank deleted successfully!');
        fetchBanks();
      }
    } catch (error) {
      console.error('Error deleting bank:', error);
      enqueueSnackbar('Error deleting bank', { variant: 'error' });
    } finally {
      setDeleteId(null);
    }
  };

  const filteredBanks = banks.filter((bank) => {
    const search = searchText.toLowerCase();
    return (
      (bank?.BankName || '').toLowerCase().includes(search) ||
      (bank?.TitleOfAccount || '').toLowerCase().includes(search) ||
      (bank?.AccountNumber || '').toLowerCase().includes(search)
    );
  });

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        elevation={0}
        sx={{ p: 2.5, mb: 3, borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}
      >
        <TextField
          fullWidth
          placeholder="Search Banks..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: '12px', height: '48px', '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: '2px' } }
          }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Iconify icon="eva:search-fill" width={22} sx={{ color: 'text.secondary' }} /></InputAdornment>,
          }}
        />
      </Paper>

      <Card sx={{ borderRadius: '12px', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '12px', maxHeight: 400, overflowY: 'auto' }}>
          <Table stickyHeader>
            <TableHead sx={{ bgcolor: 'background.neutral' }}>
              <TableRow>
                <TableCell>Bank Name</TableCell>
                <TableCell>Account Title</TableCell>
                <TableCell>Account Number</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                    <LinearProgress sx={{ maxWidth: 300, mx: 'auto', mb: 1, borderRadius: 1 }} />
                    <Box sx={{ color: 'text.disabled', fontSize: '0.875rem' }}>Loading banks...</Box>
                  </TableCell>
                </TableRow>
              ) : filteredBanks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.disabled' }}>
                    No banks found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBanks.map((bank, index) => (
                  <TableRow hover key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{bank?.BankName || '-'}</TableCell>
                    <TableCell>{bank?.TitleOfAccount || '-'}</TableCell>
                    <TableCell>{bank?.AccountNumber || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton component={RouterLink} href={paths.dashboard.Powertool.Bank.edit(bank?.BankAccountId || bank?.Id || 0)}>
                        <Iconify icon="solar:pen-bold" />
                      </IconButton>
                      <IconButton color="error" onClick={() => setDeleteId(bank?.BankAccountId || bank?.Id)}>
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Bank Account"
        content="Are you sure you want to delete this bank account?"
        action={<Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>}
      />
    </Box>
  );
}
