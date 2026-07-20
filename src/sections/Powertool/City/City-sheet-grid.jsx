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
  Grid,
  Autocomplete,
  Tooltip,
  IconButton,
  LinearProgress,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { Get } from 'src/api/apibasemethods';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';

export default function CitySheetGrid() {
  const [searchText, setSearchText] = useState('');
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Cities and Countries on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cityRes, countryRes] = await Promise.all([
          Get('City/GetAll'),
          Get('Country/GetAll')
        ]);
        
        if (cityRes.status === 200) {
          setCities(cityRes?.data?.Data || cityRes?.data || []);
        }
        if (countryRes.status === 200) {
          setCountries(countryRes?.data?.Data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCities = cities.filter((city) => {
    const matchesSearch = (city?.Name || city?.City_Name || '').toLowerCase().includes(searchText.toLowerCase());
    
    if (!selectedCountry) return matchesSearch;

    const cityCountryId = city?.CountryID || city?.CountryId || city?.Country_ID;
    const selectedCountryId = selectedCountry?.Country_ID || selectedCountry?.CountryId || selectedCountry?.Id;
    
    const cityCountryName = city?.CountryName || city?.Country_Name;
    const selectedCountryName = selectedCountry?.Country_Name || selectedCountry?.Name;

    const matchesCountry = 
      (cityCountryId && selectedCountryId && cityCountryId === selectedCountryId) ||
      (cityCountryName && selectedCountryName && cityCountryName === selectedCountryName);
    
    return matchesSearch && matchesCountry;
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
              options={countries}
              getOptionLabel={(option) => option?.Country_Name || option?.Name || ''}
              value={selectedCountry}
              onChange={(event, newValue) => setSelectedCountry(newValue)}
              isOptionEqualToValue={(option, value) => {
                const optId = option?.Country_ID || option?.CountryId || option?.Id;
                const valId = value?.Country_ID || value?.CountryId || value?.Id;
                if (optId && valId) return optId === valId;
                const optName = option?.Country_Name || option?.Name;
                const valName = value?.Country_Name || value?.Name;
                return optName === valName;
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Filter by Country" 
                  placeholder="Select a country..."
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
              placeholder="Search Cities..."
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
                <TableCell>City Name</TableCell>
                <TableCell>Country Name</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 5 }}>
                    <LinearProgress sx={{ maxWidth: 300, mx: 'auto', mb: 1, borderRadius: 1 }} />
                    <Box sx={{ color: 'text.disabled', fontSize: '0.875rem' }}>Loading cities...</Box>
                  </TableCell>
                </TableRow>
              ) : filteredCities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.disabled' }}>
                    No cities found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCities.map((city, index) => (
                  <TableRow hover key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{city?.Name || city?.City_Name || '-'}</TableCell>
                    <TableCell>
                      <Tooltip title={city?.ContinentName || city?.Continent_Name || 'Unknown Continent'} arrow placement="top">
                        <span>
                          {city?.CountryName || city?.Country_Name || '-'}
                        </span>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton component={RouterLink} href={paths.dashboard.Powertool.City.edit(city?.CityId || city?.City_ID || city?.Id || 0)}>
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
