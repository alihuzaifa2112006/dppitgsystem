import React, { useEffect, useState, useMemo } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, useParams } from 'react-router';
import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  Typography,
  Container,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
import FormProvider, { RHFAutocomplete, RHFTextField } from 'src/components/hook-form';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { LoadingScreen } from 'src/components/loading-screen';
import { paths } from 'src/routes/paths';
import { Get, Post } from 'src/api/apibasemethods';

export default function LocationEditForm() {
  const { id } = useParams();
  const settings = useSettingsContext();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [continents, setContinents] = useState([]);
  const [loading, setLoading] = useState(true);

  const CountrySchema = Yup.object().shape({
    Continent: Yup.object().nullable().required('Continent is required'),
    CountryName: Yup.string().required('Country Name is required'),
  });

  const methods = useForm({
    resolver: yupResolver(CountrySchema),
    defaultValues: {
      Continent: null,
      CountryName: '',
    },
  });

  const { handleSubmit, reset, formState: { isSubmitting } } = methods;

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Continents
        const contRes = await Get('Continent/GetAll');
        let contList = [];
        if (contRes.status === 200) {
          contList = contRes?.data?.Data || [];
          setContinents(contList);
        }

        // Fetch Country Details
        const countryRes = await Get(`Country/GetById?id=${id}`);
        if (countryRes.status === 200) {
          const countryData = countryRes?.data?.Data || countryRes?.data || {};
          
          const matchedContinent = contList.find(
            (c) => (c.Continent_ID || c.Id) === (countryData.ContinentId || countryData.Continent_ID)
          );

          reset({
            Continent: matchedContinent || null,
            CountryName: countryData.Country_Name || countryData.Name || '',
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        enqueueSnackbar('Error loading country data', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchData();
    }
  }, [id, reset, enqueueSnackbar]);

  const onSubmit = handleSubmit(async (data) => {
    const continentId = data.Continent?.Continent_ID || data.Continent?.Id || data.Continent?.ContinentId;

    if (!continentId) {
      enqueueSnackbar('Selected continent is missing an ID.', { variant: 'error' });
      return;
    }

    const payload = {
      Id: parseInt(id, 10),
      ContinentId: continentId,
      CountryName: data.CountryName,
    };

    try {
      const response = await Post('Country/Update', payload);
      if (response.status === 200) {
        enqueueSnackbar('Country updated successfully!');
        navigate(paths.dashboard.Powertool.Location.root);
      } else {
        enqueueSnackbar('Failed to update country', { variant: 'error' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error saving country', { variant: 'error' });
    }
  });

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit Country"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Countries', href: paths.dashboard.Powertool.Location.root },
          { name: 'Edit Country' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Card sx={{ p: 4, borderRadius: '16px', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, mb: 2, display: 'block' }}>
            UPDATE COUNTRY DETAILS
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

            {/* EDIT COUNTRY INPUT */}
            <Grid item xs={12} md={6}>
              <RHFTextField
                name="CountryName"
                label="Country Name *"
                placeholder="e.g. Argentina, Chile..."
              />
            </Grid>
          </Grid>
        </Card>
        
        <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
          <Button variant="outlined" onClick={() => navigate(paths.dashboard.Powertool.Location.root)}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
            Update Country
          </LoadingButton>
        </Stack>
      </FormProvider>
    </Container>
  );
}
