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
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { Get } from 'src/api/apibasemethods';

export default function CitySheetGrid() {
  const [searchText, setSearchText] = useState('');
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch Countries on load
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await Get('Country/GetAll');
        if (res.status === 200) {
          setCountries(res?.data?.Data || []);
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };
    fetchCountries();
  }, []);

  // Fetch Cities when a country is selected
  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedCountry) {
        setCities([]);
        return;
      }
      setLoading(true);
      try {
        const countryId = selectedCountry?.Country_ID || selectedCountry?.Id || selectedCountry?.CountryId;
        const res = await Get(`City/GetByCountry?countryId=${countryId}`);
        if (res.status === 200) {
          setCities(res?.data?.Data || res?.data || []);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCities();
  }, [selectedCountry]);

  const filteredCities = cities.filter((city) =>
    (city?.City_Name || city?.Name || '').toLowerCase().includes(searchText.toLowerCase())
  );

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
              isOptionEqualToValue={(option, value) => 
                (option?.Country_ID || option?.Id) === (value?.Country_ID || value?.Id)
              }
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
                '& .MuiOutlinedInput-root': { borderRadius: '12px', '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: '2px' } }
              }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Iconify icon="eva:search-fill" width={22} sx={{ color: 'text.secondary' }} /></InputAdornment>,
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
              {!selectedCountry ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.disabled' }}>
                    Please select a country to view its cities.
                  </TableCell>
                </TableRow>
              ) : loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.disabled' }}>
                    Loading cities...
                  </TableCell>
                </TableRow>
              ) : filteredCities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.disabled' }}>
                    No cities found for this country.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCities.map((city, index) => (
                  <TableRow hover key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{city?.City_Name || city?.Name || '-'}</TableCell>
                    <TableCell>{city?.Country_Name || selectedCountry?.Country_Name || selectedCountry?.Name || '-'}</TableCell>
                    <TableCell align="right">-</TableCell>
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
