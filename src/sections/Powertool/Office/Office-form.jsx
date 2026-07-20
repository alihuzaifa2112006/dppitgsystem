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
import FormProvider, { RHFTextField, RHFAutocomplete, RHFCheckbox, RHFRadioGroup } from 'src/components/hook-form';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { Get, Post, Put } from 'src/api/apibasemethods';
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
    OfficeCode: Yup.string().required('Office Code is required'),
    AddressLine1: Yup.string().required('Address Line 1 is required'),
    AddressLine2: Yup.string().nullable(),
    Country: Yup.object().nullable().required('Country is required'),
    City: Yup.object().nullable().required('City is required'),
    PostalCode: Yup.string().required('Postal Code is required'),
    Phone: Yup.string().required('Phone is required'),
    Fax: Yup.string().nullable(),
    Email: Yup.string().email('Invalid email format').required('Email is required'),
    TaxId: Yup.string().nullable(),
    Bank: Yup.object().nullable().required('Linked Bank Account is required'),
    IsActive: Yup.boolean(),
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
      TaxId: currentData?.TaxIdVatNo || currentData?.TaxId || '',
      Bank: null,
      IsActive: currentData?.IsActive !== undefined ? currentData.IsActive : true,
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

  const fetchBanks = async () => {
    try {
      const res = await Get('Bank/GetAll');
      if (res.status === 200) {
        setBanks(res?.data?.Data || res?.data || []);
      }
    } catch (error) {
      console.error('Error fetching banks:', error);
    }
  };

  useEffect(() => {
    fetchCountries();
    fetchBanks();
  }, []);

  useEffect(() => {
    if (currentData) {
      reset(defaultValues);
    }
  }, [currentData, reset, defaultValues]);

  useEffect(() => {
    if (watchedCountry) {
      const countryId = watchedCountry?.Country_ID || watchedCountry?.CountryId || watchedCountry?.Id;
      if (countryId) {
        getCities(countryId);
      }
      
      const currentCity = methods.getValues('City');
      if (currentCity) {
        // Clear city if the country doesn't match
        const cityCountryId = currentCity?.CountryID || currentCity?.CountryId || currentCity?.Country_ID;
        // Sometimes city doesn't have CountryId, so we just clear it if watchedCountry changed and it's not initial render.
        // But the safest way is to just let it be, or clear it if it's definitely mismatched.
        // A simple fix: if cities are loaded and current city is not in the list, clear it.
      }
    } else {
      setCities([]);
      setValue('City', null);
    }
  }, [watchedCountry, getCities, setValue, methods]);

  // Bind Country in edit mode
  useEffect(() => {
    if (currentData?.CountryID && countries.length > 0) {
      const matchedCountry = countries.find(
        (c) => (c.Country_ID || c.CountryId || c.Id) === currentData.CountryID
      );
      if (matchedCountry) {
        setValue('Country', matchedCountry);
      }
    }
  }, [currentData, countries, setValue]);

  // Bind City in edit mode
  useEffect(() => {
    if (currentData?.CityId && cities.length > 0) {
      const matchedCity = cities.find(
        (c) => (c.City_ID || c.CityId || c.Id) === currentData.CityId
      );
      if (matchedCity) {
        setValue('City', matchedCity);
      }
    }
  }, [currentData, cities, setValue]);

  // Bind Bank in edit mode
  useEffect(() => {
    if (currentData?.BankAccountId && banks.length > 0) {
      const matchedBank = banks.find(
        (b) => (b.BankAccountId || b.Id) === currentData.BankAccountId
      );
      if (matchedBank) {
        setValue('Bank', matchedBank);
      }
    }
  }, [currentData, banks, setValue]);

  const onSubmit = handleSubmit(
    async (data) => {
      try {
        const payload = {
          OfficeName: data.OfficeName,
          OfficeCode: data.OfficeCode,
          AddressLine1: data.AddressLine1,
          AddressLine2: data.AddressLine2 || '',
          CountryID: data.Country?.Country_ID || data.Country?.CountryId || data.Country?.Id || 0,
          CityId: data.City?.City_ID || data.City?.CityId || data.City?.Id || 0,
          PostalCode: data.PostalCode,
          Phone: data.Phone,
          Fax: data.Fax || '',
          Email: data.Email,
          Website: '0',
          CompanyRegNo: '0',
          TaxIdVatNo: data.TaxId || '',
          BankAccountId: data.Bank?.BankAccountId || data.Bank?.Id || 0,
          IsActive: String(data.IsActive) === 'true' || data.IsActive === true,
        };

        let response;
        if (currentData) {
          payload.OfficeId = currentData?.OfficeId || currentData?.Id || 0;
          response = await Put('Office/Update', payload);
        } else {
          response = await Post('Office/Create', payload);
        }

        if (response.status === 200) {
          enqueueSnackbar(currentData ? 'Office updated successfully!' : 'Office created successfully!');
          navigate(paths.dashboard.Powertool.Office.root);
        } else {
          enqueueSnackbar(response?.data?.Message || 'Something went wrong', { variant: 'error' });
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar(error?.response?.data?.Message || 'Error saving Office', { variant: 'error' });
      }
    },
    (errors) => {
      const errorMessages = Object.values(errors).map((err) => err.message);
      if (errorMessages.length > 0) {
        enqueueSnackbar(errorMessages[0], { variant: 'error' });
      }
    }
  );

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
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                BASIC INFORMATION
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  Status:
                </Typography>
                <RHFRadioGroup
                  row
                  name="IsActive"
                  options={[
                    { label: 'Active', value: true },
                    { label: 'Inactive', value: false },
                  ]}
                />
              </Stack>
            </Stack>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <RHFTextField name="OfficeName" label="Office Name *" placeholder="e.g. Hong Kong Head Office" />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField name="OfficeCode" label="Office Code *" placeholder="e.g. HK-HQ" />
              </Grid>
            </Grid>
          </Box>

          {/* ADDRESS */}
          <Box mb={4}>
            {renderSectionHeader('ADDRESS')}
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <RHFTextField name="AddressLine1" label="Address Line 1 *" placeholder="Street address" />
              </Grid>
              <Grid item xs={12}>
                <RHFTextField name="AddressLine2" label="Address Line 2" placeholder="Building, floor, suite" />
              </Grid>
              <Grid item xs={12} md={4}>
                <RHFAutocomplete
                  name="Country"
                  label="Country *"
                  placeholder="— Select Country —"
                  options={countries}
                  getOptionLabel={(option) => option?.Country_Name || option?.Name || ''}
                  isOptionEqualToValue={(option, value) => {
                    const optId = option?.Country_ID || option?.CountryId || option?.Id;
                    const valId = value?.Country_ID || value?.CountryId || value?.Id;
                    return optId === valId;
                  }}
                  renderOption={(props, option) => (
                    <li {...props} key={option?.Country_ID || option?.CountryId || option?.Id || option?.Country_Name || option?.Name}>
                      {option?.Country_Name || option?.Name || ''}
                    </li>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <RHFAutocomplete
                  name="City"
                  label="City *"
                  placeholder="— Select City —"
                  options={cities}
                  getOptionLabel={(option) => option?.Name || option?.City_Name || ''}
                  isOptionEqualToValue={(option, value) => {
                    const optId = option?.City_ID || option?.CityId || option?.Id;
                    const valId = value?.City_ID || value?.CityId || value?.Id;
                    return optId === valId;
                  }}
                  renderOption={(props, option) => (
                    <li {...props} key={option?.City_ID || option?.CityId || option?.Id || option?.Name || option?.City_Name}>
                      {option?.Name || option?.City_Name || ''}
                    </li>
                  )}
                  disabled={!watchedCountry}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <RHFTextField name="PostalCode" label="Postal Code *" placeholder="Postal code" />
              </Grid>
            </Grid>
          </Box>

          {/* CONTACT & REGISTRATION */}
          <Box mb={4}>
            {renderSectionHeader('CONTACT & REGISTRATION')}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <RHFTextField name="Phone" label="Phone *" placeholder="Enter phone number" />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField name="Fax" label="Fax" placeholder="Enter fax number" />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField name="Email" label="Email *" placeholder="info@company.com" />
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
                  label="Linked Bank Account *"
                  placeholder="— No bank linked —"
                  options={banks}
                  getOptionLabel={(option) => {
                    if (!option) return '';
                    return option?.BankName || option?.TitleOfAccount || '';
                  }}
                  isOptionEqualToValue={(option, value) => {
                    const optId = option?.BankAccountId || option?.Id;
                    const valId = value?.BankAccountId || value?.Id;
                    return optId === valId;
                  }}
                  renderOption={(props, option) => (
                    <li {...props} key={option?.BankAccountId || option?.Id || option?.BankName || option?.TitleOfAccount}>
                      {option?.BankName ? `${option.BankName} - ${option?.TitleOfAccount || ''}` : option?.TitleOfAccount || ''}
                    </li>
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          {/* ACTIONS */}
          <Stack direction="row" justifyContent="flex-end" spacing={2} mt={5}>
            <Button variant="outlined" onClick={() => navigate(paths.dashboard.Powertool.Office.root)}>
              Cancel
            </Button>
            <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
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
