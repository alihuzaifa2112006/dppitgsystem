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
  InputAdornment,
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

export default function LocationForm({ currentData }) {
  const settings = useSettingsContext();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [continents, setContinents] = useState([]);
  const [countryInput, setCountryInput] = useState('');
  const [countriesList, setCountriesList] = useState([]);

  // Fetch Continents
  useEffect(() => {
    const fetchContinents = async () => {
      try {
        const res = await Get('Continent/GetAll');
        if (res.status === 200) {
          setContinents(res?.data?.Data || []);
        }
      } catch (error) {
        console.error('Error fetching continents:', error);
      }
    };
    fetchContinents();
  }, []);

  const LocationSchema = Yup.object().shape({
    Continent: Yup.object().nullable().required('Continent is required'),
  });

  const defaultValues = useMemo(
    () => ({
      Continent: currentData?.Continent || null,
    }),
    [currentData]
  );

  const methods = useForm({
    resolver: yupResolver(LocationSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = methods;

  const watchedContinent = watch('Continent');

  const handleAddCountry = () => {
    if (countryInput.trim() !== '') {
      // Prevent duplicates
      if (!countriesList.includes(countryInput.trim())) {
        setCountriesList((prev) => [...prev, countryInput.trim()]);
      }
      setCountryInput('');
    }
  };

  const handleDeleteCountry = (indexToRemove) => {
    setCountriesList((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCountry();
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    if (countriesList.length === 0) {
      enqueueSnackbar('Please add at least one country.', { variant: 'warning' });
      return;
    }

    const continentId = data.Continent?.Continent_ID || data.Continent?.Id || data.Continent?.ContinentId;

    if (!continentId) {
      enqueueSnackbar('Selected continent is missing an ID.', { variant: 'error' });
      return;
    }

    const payload = {
      ContinentId: continentId,
      Countries: countriesList,
    };

    try {
      const response = await Post('Country/BulkAdd', payload);
      if (response.status === 200) {
        enqueueSnackbar('Countries bulk added successfully!');
        navigate(paths.dashboard.Powertool.Location.root);
      } else {
        enqueueSnackbar('Failed to bulk add countries', { variant: 'error' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error saving countries', { variant: 'error' });
    }
  });

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={currentData ? 'Edit Location / Country' : 'Add Location / Country'}
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Locations', href: paths.dashboard.Powertool.Location.root },
          { name: currentData ? 'Edit Location' : 'Add Location' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Card sx={{ p: 4, borderRadius: '16px', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, mb: 2, display: 'block' }}>
            CONTINENT & COUNTRY DETAILS
          </Typography>

          <Grid container spacing={3}>
            {/* CONTINENT DROPDOWN */}
            <Grid item xs={12} md={6}>
              <RHFAutocomplete
                name="Continent"
                label="Continent *"
                placeholder="— Select Continent —"
                options={continents}
                getOptionLabel={(option) => option?.Continent_Name || option?.Name || ''}
                isOptionEqualToValue={(option, value) =>
                  (option?.Continent_ID || option?.Id) === (value?.Continent_ID || value?.Id)
                }
              />
            </Grid>

            {/* ADD COUNTRY INPUT */}
            <Grid item xs={12} md={6}>
              <Stack spacing={2} alignItems="flex-end">
                <TextField
                  fullWidth
                  label="Country Name"
                  placeholder="e.g. Argentina, Chile..."
                  value={countryInput}
                  onChange={(e) => setCountryInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                />
                <Button variant="contained" color="primary" onClick={handleAddCountry} sx={{ borderRadius: 1 }}>
                  Add
                </Button>
              </Stack>
            </Grid>
          </Grid>

          {/* COUNTRIES TABLE */}
          <Box mt={4}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
              Added Countries ({countriesList.length})
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'background.neutral' }}>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Country Name</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {countriesList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.disabled' }}>
                        No countries added yet. Type a country name and click Add.
                      </TableCell>
                    </TableRow>
                  ) : (
                    countriesList.map((country, index) => (
                      <TableRow key={index}>
                        <TableCell width={60}>{index + 1}</TableCell>
                        <TableCell>{country}</TableCell>
                        <TableCell align="right" width={80}>
                          <IconButton size="small" color="error" onClick={() => handleDeleteCountry(index)}>
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

          <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
            Save
          </LoadingButton>
        </Stack>
      </FormProvider>
    </Container>
  );
}

LocationForm.propTypes = {
  currentData: PropTypes.object,
};
