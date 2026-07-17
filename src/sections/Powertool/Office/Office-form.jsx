import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
import FormProvider, { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { Get, Post } from 'src/api/apibasemethods';
import PropTypes from 'prop-types';

export default function OfficeForm({ currentData }) {
  const settings = useSettingsContext();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [banks, setBanks] = useState([]); // Dummy for now

  const OfficeSchema = Yup.object().shape({
    OfficeName: Yup.string().required('Office Name is required'),
    OfficeCode: Yup.string(),
    AddressLine1: Yup.string(),
    AddressLine2: Yup.string(),
    Country: Yup.object().nullable().required('Country is required'),
    City: Yup.object().nullable().required('City is required'),
    PostalCode: Yup.string(),
    Phone: Yup.string(),
    Fax: Yup.string(),
    Email: Yup.string().email('Invalid email format'),
    Website: Yup.string(),
    CompanyRegNo: Yup.string(),
    TaxId: Yup.string(),
    Bank: Yup.object().nullable(),
  });

  const defaultValues = useMemo(
    () => ({
      OfficeName: currentData?.OfficeName || '',
      OfficeCode: currentData?.OfficeCode || '',
      AddressLine1: currentData?.AddressLine1 || '',
      AddressLine2: currentData?.AddressLine2 || '',
      Country: null,
      City: null,
      PostalCode: currentData?.PostalCode || '',
      Phone: currentData?.Phone || '',
      Fax: currentData?.Fax || '',
      Email: currentData?.Email || '',
      Website: currentData?.Website || '',
      CompanyRegNo: currentData?.CompanyRegNo || '',
      TaxId: currentData?.TaxId || '',
      Bank: null,
    }),
    [currentData]
  );

  const methods = useForm({
    resolver: yupResolver(OfficeSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const watchedCountry = watch('Country');

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

  const getCities = useCallback(async (countryId) => {
    try {
      const response = await Get(`City/GetByCountry?countryId=${countryId}`);
      if (response.status === 200) {
        setCities(response?.data?.Data || []);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchCountries();
    // Setting dummy banks for now
    setBanks([{ id: 1, name: 'Standard Chartered Bank' }, { id: 2, name: 'HSBC' }]);
  }, []);

  useEffect(() => {
    if (watchedCountry) {
      getCities(watchedCountry.Country_ID);
    } else {
      setCities([]);
      setValue('City', null);
    }
  }, [watchedCountry, getCities, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log('Office Data:', data);
      enqueueSnackbar('Office created successfully!');
      navigate(paths.dashboard.Powertool.Office.root);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error creating Office', { variant: 'error' });
    }
  });

  const renderSectionHeader = (title) => (
    <Typography
      variant="overline"
      sx={{ color: 'text.secondary', fontWeight: 700, mb: 2, display: 'block' }}
    >
      {title}
    </Typography>
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={currentData ? 'Edit Office' : 'Create a new Office'}
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Offices List', href: paths.dashboard.Powertool.Office.root },
          { name: currentData ? 'Edit Office' : 'New Office' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Card sx={{ p: 4, borderRadius: '16px', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
          
          {/* BASIC INFORMATION */}
          <Box mb={4}>
            {renderSectionHeader('BASIC INFORMATION')}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <RHFTextField name="OfficeName" label="Office Name *" placeholder="e.g. Hong Kong Head Office" />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField name="OfficeCode" label="Office Code" placeholder="e.g. HK-HQ" />
              </Grid>
            </Grid>
          </Box>

          {/* ADDRESS */}
          <Box mb={4}>
            {renderSectionHeader('ADDRESS')}
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <RHFTextField name="AddressLine1" label="Address Line 1" placeholder="Street address" />
              </Grid>
              <Grid item xs={12}>
                <RHFTextField name="AddressLine2" label="Address Line 2" placeholder="Building, floor, suite" />
              </Grid>
              <Grid item xs={12} md={4}>
                <RHFAutocomplete
                  name="Country"
                  label="Country"
                  placeholder="— Select Country —"
                  options={countries}
                  getOptionLabel={(option) => option?.Country_Name || ''}
                  isOptionEqualToValue={(option, value) => option?.Country_ID === value?.Country_ID}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <RHFAutocomplete
                  name="City"
                  label="City"
                  placeholder="— Select City —"
                  options={cities}
                  getOptionLabel={(option) => option?.Name || option?.City_Name || ''}
                  isOptionEqualToValue={(option, value) => option?.City_ID === value?.City_ID}
                  disabled={!watchedCountry}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <RHFTextField name="PostalCode" label="Postal Code" placeholder="Postal code" />
              </Grid>
            </Grid>
          </Box>

          {/* CONTACT & REGISTRATION */}
          <Box mb={4}>
            {renderSectionHeader('CONTACT & REGISTRATION')}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <RHFTextField name="Phone" label="Phone" placeholder="+852 2370 2828" />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField name="Fax" label="Fax" placeholder="+852 2370 2929" />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField name="Email" label="Email" placeholder="info@company.com" />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField name="Website" label="Website" placeholder="www.company.com" />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField name="CompanyRegNo" label="Company Reg. No." placeholder="Registration number" />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField name="TaxId" label="Tax ID / VAT No." placeholder="Tax identification" />
              </Grid>
            </Grid>
          </Box>

          {/* BANK ACCOUNT */}
          <Box mb={4}>
            {renderSectionHeader('BANK ACCOUNT')}
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <RHFAutocomplete
                  name="Bank"
                  label="Linked Bank Account"
                  placeholder="— No bank linked —"
                  options={banks}
                  getOptionLabel={(option) => option?.name || ''}
                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                />
              </Grid>
            </Grid>
          </Box>

          {/* ACTIONS */}
          <Stack direction="row" justifyContent="flex-end" spacing={2} mt={5}>
            <Button variant="outlined" onClick={() => navigate(paths.dashboard.Powertool.Office.root)}>
              Cancel
            </Button>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              {currentData ? 'Update Office' : 'Save Office'}
            </LoadingButton>
          </Stack>
        </Card>
      </FormProvider>
    </Container>
  );
}

OfficeForm.propTypes = {
  currentData: PropTypes.object,
};
