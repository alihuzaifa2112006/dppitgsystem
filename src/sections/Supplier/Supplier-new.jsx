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

// Helper function to get country flag URL
const getCountryFlag = (countryCode) => {
  if (!countryCode) return '';
  return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
};

// ----------------------------------------------------------------------

export default function SupplierCreateForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const [isLoading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);

  // --- Form Hooks Setup ---
  const NewSupplierSchema = Yup.object().shape({
    supName: Yup.string().required('Supplier Name is required'),
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
      supName: '',
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

  // Fetch Countries
  const getCountries = async () => {
    try {
      const response = await Get('Country/GetAll');
      if (response.status === 200) {
        setCountries(response?.data?.Data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getCountries();
  }, []);

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    console.log('Form Data:', data);

    const payload = {
      supName: data.supName,
      city: data.city,
      countryId: data.country?.Country_ID || '',
      countryName: data.country?.Country_Name || '',
      countryCode: data.country?.Country_Code || '',
      email: data.email,
      orgId: userData?.userDetails?.orgId || '',
      branchId: userData?.userDetails?.branchID || '',
      createdBy: userData?.userDetails?.userId || 0,
    };

    console.log('Payload to send:', payload);

    try {
      setLoading(true);
      const response = await Post('RegisterOnbaord', payload);

      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar('Supplier Registered Successfully!');
        reset();
        router.push(paths.dashboard.Onboarding.Supplier.root);
      } else {
        enqueueSnackbar(response?.data?.message || 'Failed to register supplier', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      enqueueSnackbar(
        error?.response?.data?.message || 'Error registering supplier',
        { variant: 'error' }
      );
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
                  color: "#1a1a2e",
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

            <Stack spacing={3}>
              {/* Supplier Name - Full Width (70% of the box) */}
              <Box sx={{ width: '70%' }}>
                <RHFTextField
                  name="supName"
                  label="Supplier Name"
                  placeholder="Enter Supplier Name"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <Iconify
                        icon="mdi:domain"
                        width={20}
                        sx={{ color: '#666', mr: 1 }}
                      />
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#3366ff',
                      },
                    },
                  }}
                />
              </Box>

              {/* Remaining Fields - 2 Column Grid */}
              <Box
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
                columnGap={3}
                rowGap={3}
                sx={{
                  '& .MuiTextField-root': {
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#3366ff',
                      },
                    },
                  },
                }}
              >
                <RHFTextField
                  name="city"
                  label="City"
                  placeholder="Enter City"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <Iconify
                        icon="mdi:city"
                        width={20}
                        sx={{ color: '#666', mr: 1 }}
                      />
                    ),
                  }}
                />

                <RHFAutocomplete
                  name="country"
                  label="Country"
                  placeholder="Select Country"
                  fullWidth
                  options={countries}
                  getOptionLabel={(option) => option?.Country_Name || ''}
                  isOptionEqualToValue={(option, value) => option?.Country_ID === value?.Country_ID}
                  renderOption={(props, option) => (
                    <Box
                      component="li"
                      {...props}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        py: 1,
                        px: 2,
                      }}
                    >
                      {option?.Country_Code && (
                        <img
                          src={getCountryFlag(option.Country_Code)}
                          alt={option.Country_Name}
                          style={{
                            width: 28,
                            height: 18,
                            objectFit: 'cover',
                            borderRadius: 2,
                            border: '1px solid #e0e0e0',
                            flexShrink: 0,
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {option?.Country_Name}
                      </Typography>
                    </Box>
                  )}
                  TextFieldProps={{
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          {values?.country?.Country_Code ? (
                            <img
                              src={getCountryFlag(values.country.Country_Code)}
                              alt={values.country.Country_Name}
                              style={{
                                width: 28,
                                height: 18,
                                objectFit: 'cover',
                                borderRadius: 2,
                                border: '1px solid #e0e0e0',
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <Iconify
                              icon="mdi:flag"
                              width={20}
                              sx={{ color: '#666' }}
                            />
                          )}
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <RHFTextField
                  name="email"
                  label="Email"
                  placeholder="Enter Email"
                  fullWidth
                  type="email"
                  InputProps={{
                    startAdornment: (
                      <Iconify
                        icon="mdi:email"
                        width={20}
                        sx={{ color: '#666', mr: 1 }}
                      />
                    ),
                  }}
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
              Save Supplier
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}