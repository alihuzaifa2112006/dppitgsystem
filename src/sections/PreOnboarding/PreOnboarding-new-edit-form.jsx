import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import Scrollbar from 'src/components/scrollbar';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fData } from 'src/utils/format-number';

import { countries } from 'src/assets/data';
// import IncrementDecrementInput from 'src/components/IncrementDecrementInput';

import Label from 'src/components/label';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
  RHFAutocomplete,
  RHFRadioGroup,
} from 'src/components/hook-form';
import {
  ButtonGroup,
  Paper,
  Radio,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import { getUserData } from 'src/utils/getUser';
import { Get, Post, Put } from 'src/api/apibasemethods';
import { decryptObjectKeys } from 'src/utils/getDecryption';
import { decrypt, encrypt } from 'src/api/encryption';

// ----------------------------------------------------------------------

function getCurrentDateFormatted() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so add 1
  const day = String(today.getDate()).padStart(2, '0'); // Ensure 2 digits for day

  return `${year}-${month}-${day}`;
}

export default function PreOnboardingNewEditForm({ currentPreOnboarding }) {
  const router = useRouter();

  const userID = getUserData() ? getUserData()?.userDetails?.userId  : 86;

  const { enqueueSnackbar } = useSnackbar();
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [IndustryType, setIndustryType] = useState([]);
  const [AllCountries, setAllCountries] = useState([]);

  const getFilteredCustomers = async () => {
    try {
      const res = await Get(`GetFilteredDataCustomer?UserID=${userID}`);
      const decryptedFilteredCustomers = decryptObjectKeys(res.data.ServiceRes);
      setFilteredCustomers(decryptedFilteredCustomers);
    } catch (error) {
      console.log('error getting supplier filtered customers', error);
    }
  };
  const getIndustryType = async () => {
    try {
      const res = await Get(`GetIndustryType?UserID=${userID}`);
      const decryptedFilteredCustomers = decryptObjectKeys(res.data.ServiceRes);
      // console.log('decryptedFilteredCustomers', decryptedFilteredCustomers);
      setIndustryType(decryptedFilteredCustomers);
    } catch (error) {
      console.log('error getting supplier industry type', error);
    }
  };

  const getCountries = async () => {
    try {
      const res = await Get(`GetCountry?UserID=${userID}`);
      if (res.data.ResponseCode === '100') {
        // console.log('res.data.ServiceRes', res.data.ServiceRes);
        const decryptedData = decryptObjectKeys(res.data.ServiceRes);
        setAllCountries(decryptedData);
      } else if (res.data.ResponseCode === '-2') {
        console.log('error in getting country by id', res.data.ServiceRes);
      }
    } catch (error) {
      console.log('error getting country by ID', error);
    }
  };

  const GetPreOnboardingData = useCallback(async () => {
    try {
      const response = await Get('GetPreOnboardListData');
      const decryptedData = decryptObjectKeys(response.data.ServiceRes);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    getFilteredCustomers();
    getIndustryType();
    getCountries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getFilteredCustomers, getIndustryType]);

  const NewPreOnboardingSchema = Yup.object().shape({
    VenderName: Yup.string().required('Supplier Name is required'),
    // ShortName: Yup.string().required('Short Name is required'),
    CustomerID: Yup.string().required('Customer is required'),
    IndustryTypeID: Yup.string().required('Industry Type is required'),
    CountryID: Yup.string().required('Country is required'),
    City: Yup.string().required('City is required'),
    OnboardingEmail: Yup.string().required('Email is required'),
  });

  const defaultValues = useMemo(
    () => ({
      VenderName: currentPreOnboarding?.VenderName || '',
      ShortName: currentPreOnboarding?.ShortName || '',
      CustomerID: currentPreOnboarding?.CustomerID || '',
      IndustryTypeID: currentPreOnboarding?.IndustryTypeID || '',
      CountryID: currentPreOnboarding?.CountryID || '',
      City: currentPreOnboarding?.City || '',
      OnboardingEmail: currentPreOnboarding?.OnBoardingEmail || '',

      // currentDate: currentDate,
    }),
    [currentPreOnboarding]
  );

  const methods = useForm({
    resolver: yupResolver(NewPreOnboardingSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const InsertVendorDetail = async (insertVendorDetail) => {
    // decrypt array
    const encryptedVendorDetail = insertVendorDetail.map((X) =>
      Object.assign(
        {},
        ...Object.keys(X).map((key) => ({
          [key]: encrypt(X[key]),
        }))
      )
    );
    try {
      const response = await Post(`InserVendorDetail`, encryptedVendorDetail);
      if (response.data.ResponseCode === '100') {
        // enqueueSnackbar('Supplier created successfully!', { variant: 'success' });
        console.log('response.data', response.data);
      } else {
        // enqueueSnackbar('Supplier creation failed! ', {
        //   variant: 'error',
        // });
        console.log('response.data', response.data);
      }
    } catch (error) {
      console.error('Error while creating API request (InsertVenderDetail):', error);
      // enqueueSnackbar('Supplier creation failed! Error in API ', {
      //   variant: 'error',
      // });
    }
  };

  const InsertVendorData = async (newdata) => {
    const encryptedVendorData = Object.assign(
      {},
      ...Object.keys(newdata).map((key) => ({
        [key]: encrypt(newdata[key]),
      }))
    );

    const response = await Post(`InsertVender`, encryptedVendorData);
    if (response.data.ResponseCode === '100') {
      const types = [
        { type: 'Customer', ids: ['18'] },
        { type: 'Supplier Type', ids: ['1'] },
      ];
      function generateAndSendRequests() {
        types.forEach(({ type, ids }) => {
          ids.forEach((id) => {
            const body = [
              {
                VenderID: decrypt(response.data.ServiceRes[0].VenderLibraryID),
                ID: id,
                Type: type,
              },
            ];
            InsertVendorDetail(body);
          });
        });
      }
      generateAndSendRequests();

      enqueueSnackbar('Supplier Data Inserted Successfully', { variant: 'success' });
      reset();
      GetPreOnboardingData();
      router.push(paths.dashboard.customer.root);
    } else if (response.data.ResponseCode === '-2') {
      enqueueSnackbar('Supplier Data Inserted Failed', { variant: 'error' });
    }
  };

  const UpdatePreOnBoardSupplier = async (data) => {
    const encryptedData = Object.assign(
      {},
      ...Object.keys(data).map((key) => ({
        [key]: encrypt(data[key]),
      }))
    );
    const res = await Put(`UpdatePreOnBoardSupplier`, encryptedData);
    if (res.data.ResponseCode === '100') {
      enqueueSnackbar('Supplier Updated Successfully', { variant: 'success' });
      reset();
      GetPreOnboardingData();
      router.push(paths.dashboard.customer.root);
    } else if (res.data.ResponseCode === '-2') {
      enqueueSnackbar('Supplier Update Failed', { variant: 'error' });
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      // await new Promise((resolve) => setTimeout(resolve, 500));
      // reset();
      // enqueueSnackbar(currentSupplier ? 'Update success!' : 'Create success!');
      // router.push(paths.dashboard.supplierDatabase.root);
      const newdata = {
        ...data,
        VenderCode: '',
        Address1: '',
        Address2: '',
        ZipCode: '',
        FaxNo: '',
        PhoneNumber: '',
        Website: '',
        UserID: userID || 1,
        Province: '',
        MainExportMarketId: '',
        ProductGroupid: '',
        ProductPortfolioID: '',
        ProductCategoriesID: '',
        NoOfEmployeesID: '',
        PercentageOfExportBusinessID: '',
        ExperienceInBusinessTypeID: '',
        ShippingTermsID: '',
        BusinessTypeID: '',
        YearsInBusinessID: '',
        YearsInEuropeanBusinessID: '',
        BusinessPercentageInEuropeanID: '',
        AssortmentRangeID: '',
        AssortmentStrategyID: '',
      };
      console.info('newdata', newdata);

      const UpdateData = {
        VenderLibraryID: currentPreOnboarding?.VenderLibraryID,
        VenderName: data.VenderName,
        ShortName: data.ShortName,
        IndustryTypeID: data.IndustryTypeID,
        City: data.City,
        CountryID: data.CountryID,
        OnBoardingEmail: data.OnboardingEmail,
        UpdatedDate: getCurrentDateFormatted(),
        UpdatedByUserID: userID || '1',
      };

      if (currentPreOnboarding?.VenderLibraryID) {
        await UpdatePreOnBoardSupplier(UpdateData);
      } else {
        await InsertVendorData(newdata);
      }

      // console.info('CountryID', CountryID);
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Supplier Information
            </Typography>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(3, 1fr)',
              }}
            >
              <RHFTextField
                name="VenderName"
                label="Supplier Name "
                sx={{ gridColumn: 'span 2' }}
              />
              <RHFTextField name="ShortName" label="Short Name " />
              <Controller
                name="CustomerID"
                control={control}
                defaultValue=""
                render={({ field, fieldState: { error } }) => (
                  <RHFAutocomplete
                    {...field}
                    options={filteredCustomers}
                    getOptionLabel={(option) => option.CustomerName || ''}
                    isOptionEqualToValue={(option, value) => option.CustomerID === value}
                    value={
                      filteredCustomers.find((init) => init.CustomerID === field.value) || null
                    }
                    onChange={(event, newValue) => {
                      field.onChange(newValue ? newValue.CustomerID : '');
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Customer Name"
                        variant="outlined"
                        fullWidth
                        error={!!error}
                        helperText={error ? error.message : ''}
                      />
                    )}
                  />
                )}
              />
              <Controller
                name="IndustryTypeID"
                control={control}
                defaultValue=""
                render={({ field, fieldState: { error } }) => (
                  <RHFAutocomplete
                    {...field}
                    options={IndustryType}
                    getOptionLabel={(option) => option.IndustryName || ''}
                    isOptionEqualToValue={(option, value) => option.IndustryTypeID === value}
                    value={IndustryType.find((init) => init.IndustryTypeID === field.value) || null}
                    onChange={(event, newValue) => {
                      field.onChange(newValue ? newValue.IndustryTypeID : '');
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Industry Type"
                        variant="outlined"
                        fullWidth
                        error={!!error}
                        helperText={error ? error.message : ''}
                      />
                    )}
                  />
                )}
              />
              <RHFTextField name="City" label="City" />
              <Controller
                name="CountryID"
                control={control}
                defaultValue=""
                render={({ field, fieldState: { error } }) => (
                  <RHFAutocomplete
                    {...field}
                    options={AllCountries}
                    getOptionLabel={(option) => option.CountryName || ''}
                    isOptionEqualToValue={(option, value) => option.Country_id === value}
                    value={AllCountries.find((init) => init.Country_id === field.value) || null}
                    onChange={(event, newValue) => {
                      field.onChange(newValue ? newValue.Country_id : '');
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Country"
                        variant="outlined"
                        fullWidth
                        error={!!error}
                        helperText={error ? error.message : ''}
                      />
                    )}
                  />
                )}
              />
              <RHFTextField name="OnboardingEmail" label="Email" />
            </Box>
          </Card>

          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                color="primary"
                loading={isSubmitting}
              >
                Save
              </LoadingButton>
              {/* <LoadingButton
                type="submit"
                variant="contained"
                color="primary"
                loading={isSubmitting}
              >
                Save Changes{' '}
              </LoadingButton> */}
              <Button
                size="medium"
                variant="outlined"
                onClick={() => {
                  router.push('/dashboard/Onboarding/pre-onboarding');
                }}
              >
                Cancel
              </Button>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

PreOnboardingNewEditForm.propTypes = {
  currentPreOnboarding: PropTypes.object,
};
