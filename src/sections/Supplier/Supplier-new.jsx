import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Button,
  IconButton,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
  Divider,
  Paper,
  Avatar,
  InputAdornment,
} from '@mui/material';

import { LoadingScreen } from 'src/components/loading-screen';

import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFAutocomplete, RHFTextField } from 'src/components/hook-form';
import { useSettingsContext } from 'src/components/settings';

import { Get, Post } from 'src/api/apibasemethods';
import {
  DesktopDatePicker,
} from '@mui/x-date-pickers';
import Scrollbar from 'src/components/scrollbar';
import {
  TableEmptyRows,
  useTable,
  emptyRows,
  TableHeadCustom,
  TableNoData,
} from 'src/components/table';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { fNumber } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';



// ----------------------------------------------------------------------

export default function SupplierCreateForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData') || '{}'), []);

  const [isLoading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [industries, setIndustries] = useState([]);

  // --- Form Hooks Setup ---
  const NewSupplierSchema = Yup.object().shape({
    tier: Yup.object().nullable().required('Tier is required'),
    supName: Yup.string().required('Supplier Name is required'),
    industry: Yup.object().nullable().required('Industry is required'),
    city: Yup.string().required('City is required'),
    country: Yup.object()
      .nullable()
      .required('Country is required')
      .shape({
        Country_ID: Yup.string().required(),
        Country_Name: Yup.string().required(),
        Country_Code: Yup.string().nullable(),
      }),
    email: Yup.string()
      .required('Email is required')
      .email('Invalid email format'),
  });

  const methods = useForm({
    resolver: yupResolver(NewSupplierSchema),
    defaultValues: {
      tier: null,
      supName: '',
      industry: null,
      city: '',
      country: null,
      email: '',
    },
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // Fetch Countries & Tiers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countryRes, tierRes, industryRes] = await Promise.all([
          Get('Country/GetAll'),
          Get('Tier/GetAll'),
          Get('Industry/GetAll'),
        ]);
        if (countryRes.status === 200) setCountries(countryRes?.data?.Data || []);
        if (tierRes.status === 200) setTiers(tierRes?.data?.Data || []);
        if (industryRes.status === 200) setIndustries(industryRes?.data?.Data || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    console.log('📝 Form Data:', data);

    const payload = {
      TierId: data.tier?.TierId || 0,
      supplierName: data.supName,
      IndustryId: data.industry?.IndustryId || 0,
      city: data.city,
      countryID: parseInt(data.country?.Country_ID, 10) || 0,
      email: data.email,
    };

    console.log('📦 Payload to send:', payload);

    try {
      setLoading(true);

      // ✅ The interceptor will automatically add the Authorization header
      const response = await Post('Supplier/Invite', payload);

      console.log('✅ Response:', response);

      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar('Supplier Registered Successfully!');
        reset();
        router.push(paths.dashboard.Onboarding.Supplier.root);
      } else {
        enqueueSnackbar(response?.data?.message || 'Failed to register supplier', { variant: 'error' });
      }
    } catch (error) {
      console.error('❌ Error submitting form:', error);

      if (error?.response?.status === 401 || error?.response?.status === 403) {
        enqueueSnackbar('Authentication failed. Please login again.', { variant: 'error' });
        router.push('/auth/login');
      } else {
        enqueueSnackbar(
          error?.response?.data?.message || error?.message || 'Error registering supplier',
          { variant: 'error' }
        );
      }
    } finally {
      setLoading(false);
    }
  });

  const handleCancel = () => {
    reset();
    router.push(paths.dashboard.Onboarding.Supplier.root);
  };

  const renderLoading = (
    <LoadingScreen
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '70vh',
      }}
    />
  );

  return isLoading ? (
    renderLoading
  ) : (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <Card
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #e8ecf4',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography
                sx={{
                  color: 'text.primary',
                  fontWeight: 700,
                  fontSize: '1.5rem',
                  letterSpacing: '0.5px',
                }}
                variant="h5"
              >
                Supplier Information
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />
            <Stack spacing={2.5}>

              {/* Row 1: Tier (40%) + Supplier Name (60%) */}
              <Box
                display="grid"
                gridTemplateColumns={{ xs: '1fr', sm: '2fr 3fr' }}
                gap={2.5}
                sx={{ '& > *': { minWidth: 0 } }}
              >
                <RHFAutocomplete
                  name="tier"
                  label="Select Tier *"
                  placeholder="Select Tier"
                  fullWidth
                  options={tiers}
                  getOptionLabel={(option) => option?.Name || ''}
                  isOptionEqualToValue={(option, value) => option?.TierId === value?.TierId}
                  TextFieldProps={{
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="mdi:layers-outline" width={20} sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    },
                    sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } },
                  }}
                />

                <RHFTextField
                  name="supName"
                  label="Supplier Name *"
                  placeholder="Enter Supplier Name"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="mdi:domain" width={20} sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>

              {/* Row 2: Industry (50%) + Country (50%) */}
              <Box
                display="grid"
                gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}
                gap={2.5}
                sx={{ '& > *': { minWidth: 0 } }}
              >
                <RHFAutocomplete
                  name="industry"
                  label="Select Industry *"
                  placeholder="Select Industry"
                  fullWidth
                  options={industries}
                  getOptionLabel={(option) => option?.Name || ''}
                  isOptionEqualToValue={(option, value) => option?.IndustryId === value?.IndustryId}
                  TextFieldProps={{
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="mdi:factory" width={20} sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    },
                    sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } },
                  }}
                />

                <RHFAutocomplete
                  name="country"
                  label="Country *"
                  placeholder="Select Country"
                  fullWidth
                  options={countries}
                  getOptionLabel={(option) => option?.Country_Name || ''}
                  isOptionEqualToValue={(option, value) => option?.Country_ID === value?.Country_ID}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, px: 2 }}>
                      {option?.Country_Code && (
                        <Iconify icon={`circle-flags:${option.Country_Code.toLowerCase()}`} sx={{ width: 24, height: 24, flexShrink: 0 }} />
                      )}
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{option?.Country_Name}</Typography>
                    </Box>
                  )}
                  TextFieldProps={{
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          {values?.country?.Country_Code ? (
                            <Iconify icon={`circle-flags:${values.country.Country_Code.toLowerCase()}`} sx={{ width: 24, height: 24 }} />
                          ) : (
                            <Iconify icon="mdi:flag-outline" width={20} sx={{ color: 'text.secondary' }} />
                          )}
                        </InputAdornment>
                      ),
                    },
                    sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } },
                  }}
                />
              </Box>

              {/* Row 3: City (50%) + Email (50%) */}
              <Box
                display="grid"
                gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}
                gap={2.5}
                sx={{ '& > *': { minWidth: 0 } }}
              >
                <RHFTextField
                  name="city"
                  label="City *"
                  placeholder="Enter City"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="mdi:city-variant-outline" width={20} sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />

                <RHFTextField
                  name="email"
                  label="Email *"
                  placeholder="Enter Email"
                  fullWidth
                  type="email"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="mdi:email-outline" width={20} sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>

            </Stack>
          </Card>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="flex-end"
            alignItems="center"
            sx={{ mt: 3 }}
          >
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleCancel}
              startIcon={<Iconify icon="mdi:close" />}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.2,
                borderColor: '#d0d5dd',
                color: '#475467',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#667085',
                  bgcolor: '#f0f1f3',
                },
              }}
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              loading={isSubmitting || isLoading}
              startIcon={<Iconify icon="mdi:content-save" />}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.2,
                fontWeight: 600,
                bgcolor: '#3366ff',
                '&:hover': {
                  bgcolor: '#2952d6',
                },
              }}
            >
              Save
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}