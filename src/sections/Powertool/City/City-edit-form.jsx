import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, useParams } from 'react-router';
import {
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
import { Get, Put } from 'src/api/apibasemethods';

export default function CityEditForm() {
  const { id } = useParams();
  const settings = useSettingsContext();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  const CitySchema = Yup.object().shape({
    Country: Yup.object().nullable().required('Country is required'),
    CityName: Yup.string().required('City Name is required'),
  });

  const methods = useForm({
    resolver: yupResolver(CitySchema),
    defaultValues: {
      Country: null,
      CityName: '',
    },
  });

  const { handleSubmit, reset, formState: { isSubmitting } } = methods;

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Countries
        const countryRes = await Get('Country/GetAll');
        let countryList = [];
        if (countryRes.status === 200) {
          countryList = countryRes?.data?.Data || [];
          setCountries(countryList);
        }

        // Fetch City Details
        const cityRes = await Get(`City/GetById?id=${id}`);
        if (cityRes.status === 200) {
          const cityData = cityRes?.data?.Data || cityRes?.data || {};
          
          const matchedCountry = countryList.find((c) => {
            const listId = c.Country_ID || c.CountryId || c.Id;
            const dataId = cityData.CountryID || cityData.CountryId || cityData.Country_ID;
            if (listId !== undefined && dataId !== undefined && listId === dataId) return true;
            const listName = c.Country_Name || c.Name;
            const dataName = cityData.CountryName || cityData.Country_Name;
            return listName && dataName && listName === dataName;
          });

          reset({
            Country: matchedCountry || null,
            CityName: cityData.Name || cityData.City_Name || '',
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        enqueueSnackbar('Error loading city data', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchData();
    }
  }, [id, reset, enqueueSnackbar]);

  const onSubmit = handleSubmit(async (data) => {
    const countryId = data.Country?.Country_ID || data.Country?.Id || data.Country?.CountryId;

    if (!countryId) {
      enqueueSnackbar('Selected country is missing an ID.', { variant: 'error' });
      return;
    }

    const payload = {
      CityId: parseInt(id, 10),
      Name: data.CityName,
      CountryID: countryId,
      SortOrder: 0,
      IsActive: true,
    };

    try {
      const response = await Put('City/Update', payload);
      if (response.status === 200) {
        enqueueSnackbar('City updated successfully!');
        navigate(paths.dashboard.Powertool.City.root);
      } else {
        enqueueSnackbar('Failed to update city', { variant: 'error' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error saving city', { variant: 'error' });
    }
  });

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit City"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Cities', href: paths.dashboard.Powertool.City.root },
          { name: 'Edit City' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Card sx={{ p: 4, borderRadius: '16px', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, mb: 2, display: 'block' }}>
            UPDATE CITY DETAILS
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

            {/* EDIT CITY INPUT */}
            <Grid item xs={12} md={6}>
              <RHFTextField
                name="CityName"
                label="City Name *"
                placeholder="e.g. Multan, Quetta..."
              />
            </Grid>
          </Grid>
        </Card>
        
        <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
          <Button variant="outlined" onClick={() => navigate(paths.dashboard.Powertool.City.root)}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
            Update City
          </LoadingButton>
        </Stack>
      </FormProvider>
    </Container>
  );
}
