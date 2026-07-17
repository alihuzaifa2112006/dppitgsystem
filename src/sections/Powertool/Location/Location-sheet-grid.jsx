import React, { useState, useEffect } from 'react';
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
  Typography,
  Card,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { Get } from 'src/api/apibasemethods';

export default function LocationSheetGrid() {
  const [searchText, setSearchText] = useState('');
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await Get('Country/GetAll');
        if (res.status === 200) {
          setCountries(res?.data?.Data || []);
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCountries();
  }, []);

  const filteredCountries = countries.filter((country) =>
    (country?.Country_Name || country?.Name || '').toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* SEARCH BAR */}
      <Paper
        elevation={0}
        sx={{ p: 2.5, mb: 3, borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}
      >
        <TextField
          fullWidth
          placeholder="Search Countries..."
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

      {/* DATA GRID */}
      <Card sx={{ borderRadius: '12px', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '12px', maxHeight: 380, overflowY: 'auto' }}>
          <Table stickyHeader>
            <TableHead sx={{ bgcolor: 'background.neutral' }}>
              <TableRow>
                <TableCell>Country Name</TableCell>
                <TableCell>Continent Name</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.disabled' }}>
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredCountries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.disabled' }}>
                    No countries found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCountries.map((country, index) => (
                  <TableRow hover key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{country?.Country_Name || country?.Name || '-'}</TableCell>
                    <TableCell>{country?.Continent_Name || '-'}</TableCell>
                    <TableCell align="right">
                      {/* Actions can go here later if needed */}
                      -
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
