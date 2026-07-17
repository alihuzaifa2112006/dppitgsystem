import React, { useEffect, useState, useMemo } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router';
import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  Typography,
  Container,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
import FormProvider, { RHFAutocomplete } from 'src/components/hook-form';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { Get, Post } from 'src/api/apibasemethods';
import Iconify from 'src/components/iconify';
import PropTypes from 'prop-types';

export default function CityForm({ currentData }) {
  const settings = useSettingsContext();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [countries, setCountries] = useState([]);
  const [cityInput, setCityInput] = useState('');
  const [citiesList, setCitiesList] = useState([]);

  // Fetch Countries
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

  const CitySchema = Yup.object().shape({
    Country: Yup.object().nullable().required('Country is required'),
  });

  const defaultValues = useMemo(
    () => ({
      Country: currentData?.Country || null,
    }),
    [currentData]
  );

  const methods = useForm({
    resolver: yupResolver(CitySchema),
    defaultValues,
  });

  const { handleSubmit, formState: { isSubmitting } } = methods;

  const handleAddCity = () => {
    if (cityInput.trim() !== '') {
      // Prevent duplicates
      if (!citiesList.includes(cityInput.trim())) {
        setCitiesList((prev) => [...prev, cityInput.trim()]);
      }
      setCityInput('');
    }
  };

  const handleDeleteCity = (indexToRemove) => {
    setCitiesList((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCity();
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    if (citiesList.length === 0) {
      enqueueSnackbar('Please add at least one city.', { variant: 'warning' });
      return;
    }

    const countryId = data.Country?.Country_ID || data.Country?.Id || data.Country?.CountryId;

    if (!countryId) {
      enqueueSnackbar('Selected country is missing an ID.', { variant: 'error' });
      return;
    }

    const payload = {
      CountryID: countryId,
      Cities: citiesList,
    };

    try {
      const response = await Post('City/BulkAdd', payload);
      if (response.status === 200) {
        enqueueSnackbar('Cities bulk added successfully!');
        navigate(paths.dashboard.Powertool.City.root);
      } else {
        enqueueSnackbar('Failed to bulk add cities', { variant: 'error' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error saving cities', { variant: 'error' });
    }
  });

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={currentData ? 'Edit City' : 'Add City'}
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Cities', href: paths.dashboard.Powertool.City.root },
          { name: currentData ? 'Edit City' : 'Add City' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Card sx={{ p: 4, borderRadius: '16px', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, mb: 2, display: 'block' }}>
            COUNTRY & CITY DETAILS
          </Typography>
          
          <Grid container spacing={3}>
            {/* COUNTRY DROPDOWN */}
            <Grid item xs={12} md={6}>
              <RHFAutocomplete
                name="Country"
                label="Country *"
                placeholder="— Select Country —"
                options={countries}
                getOptionLabel={(option) => option?.Country_Name || option?.Name || ''}
                isOptionEqualToValue={(option, value) => 
                  (option?.Country_ID || option?.Id) === (value?.Country_ID || value?.Id)
                }
              />
            </Grid>

            {/* ADD CITY INPUT */}
            <Grid item xs={12} md={6}>
              <Stack spacing={2} alignItems="flex-end">
                <TextField
                  fullWidth
                  label="City Name"
                  placeholder="e.g. Multan, Quetta..."
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                />
                <Button variant="contained" color="primary" onClick={handleAddCity} sx={{ borderRadius: 1 }}>
                  Add
                </Button>
              </Stack>
            </Grid>
          </Grid>

          {/* CITIES TABLE */}
          <Box mt={4}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
              Added Cities ({citiesList.length})
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'background.neutral' }}>
                  <TableRow>
                    <TableCell>City Name</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {citiesList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} align="center" sx={{ py: 3, color: 'text.disabled' }}>
                        No cities added yet. Type a city name and click Add.
                      </TableCell>
                    </TableRow>
                  ) : (
                    citiesList.map((city, index) => (
                      <TableRow key={index}>
                        <TableCell>{city}</TableCell>
                        <TableCell align="right" width={80}>
                          <IconButton size="small" color="error" onClick={() => handleDeleteCity(index)}>
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Card>
        <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
          <Button variant="outlined" onClick={() => navigate(paths.dashboard.Powertool.City.root)}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
            Save
          </LoadingButton>
        </Stack>
      </FormProvider>
    </Container>
  );
}

CityForm.propTypes = {
  currentData: PropTypes.object,
};
