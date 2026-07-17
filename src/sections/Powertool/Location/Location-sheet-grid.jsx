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
  Card,
  IconButton,
  Autocomplete,
  Grid,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { Get } from 'src/api/apibasemethods';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';

export default function LocationSheetGrid() {
  const [searchText, setSearchText] = useState('');
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [continents, setContinents] = useState([]);
  const [selectedContinent, setSelectedContinent] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countryRes, continentRes] = await Promise.all([
          Get('Country/GetAll'),
          Get('Continent/GetAll')
        ]);
        
        if (countryRes.status === 200) {
          setCountries(countryRes?.data?.Data || []);
        }
        if (continentRes.status === 200) {
          setContinents(continentRes?.data?.Data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCountries = countries.filter((country) => {
    const matchesSearch = (country?.Country_Name || country?.Name || '').toLowerCase().includes(searchText.toLowerCase());
    
    if (!selectedContinent) return matchesSearch;

    const countryContId = country?.ContinentId || country?.Continent_ID;
    const selectedContId = selectedContinent?.Continent_ID || selectedContinent?.ContinentId || selectedContinent?.Id;
    
    const countryContName = country?.ContinentName || country?.Continent_Name;
    const selectedContName = selectedContinent?.Continent_Name || selectedContinent?.Name;

    const matchesContinent = 
      (countryContId && selectedContId && countryContId === selectedContId) ||
      (countryContName && selectedContName && countryContName === selectedContName);
    
    return matchesSearch && matchesContinent;
  });

  return (
    <Box sx={{ width: '100%' }}>
      {/* FILTERS & SEARCH */}
      <Paper
        elevation={0}
        sx={{ p: 2.5, mb: 3, borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={continents}
              getOptionLabel={(option) => option?.Continent_Name || option?.Name || ''}
              value={selectedContinent}
              onChange={(event, newValue) => setSelectedContinent(newValue)}
              isOptionEqualToValue={(option, value) => {
                const optId = option?.Continent_ID || option?.ContinentId || option?.Id;
                const valId = value?.Continent_ID || value?.ContinentId || value?.Id;
                if (optId && valId) return optId === valId;
                const optName = option?.Continent_Name || option?.Name;
                const valName = value?.Continent_Name || value?.Name;
                return optName === valName;
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Filter by Continent" 
                  placeholder="Select a continent..."
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: '12px', '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: '2px' } }
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search Countries..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: '12px', height: '100%', minHeight: '56px', '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: '2px' } }
              }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Iconify icon="eva:search-fill" width={22} sx={{ color: 'text.secondary' }} /></InputAdornment>,
                sx: { height: '100%' }
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* DATA GRID */}
      <Card sx={{ borderRadius: '12px', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '12px', maxHeight: 380, overflowY: 'auto' }}>
          <Table stickyHeader>
            <TableHead sx={{ bgcolor: 'background.neutral' }}>
              <TableRow>
                <TableCell>Continent Name</TableCell>
                <TableCell>Country Name</TableCell>
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
                    <TableCell>{country?.ContinentName || country?.Continent_Name || '-'}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{country?.Country_Name || country?.Name || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton component={RouterLink} href={paths.dashboard.Powertool.Location.edit(country?.Country_ID || country?.Id || 0)}>
                        <Iconify icon="solar:pen-bold" />
                      </IconButton>
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
